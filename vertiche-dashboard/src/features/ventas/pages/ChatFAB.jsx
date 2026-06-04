import { useState, useRef, useEffect } from 'react';
import './styles/ChatFAB.css';

import { API_URLS } from '../../../config/api.js';

const CHATBOT_URL = API_URLS.chatbot;

function renderMarkdown(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

function ThinkingBlock({ reasoning, isLive }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [reasoning, open]);

  return (
    <div className="chat-fab__thinking">
      <button className="chat-fab__thinking-toggle" onClick={() => setOpen(o => !o)}>
        <span className="chat-fab__thinking-icon">
          {isLive ? (
            <span className="chat-fab__thinking-dots">
              <span /><span /><span />
            </span>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 5v5l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </span>
        <span className="chat-fab__thinking-label">
          {isLive ? 'Pensando…' : 'Ver razonamiento'}
        </span>
        <span className={`chat-fab__thinking-chevron ${open ? 'chat-fab__thinking-chevron--open' : ''}`}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {open && reasoning && (
        <div className="chat-fab__thinking-body" ref={bodyRef}>
          {reasoning}
        </div>
      )}
    </div>
  );
}

export function ChatFAB() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: '¡Hola! Soy tu asistente de Vertiche. Puedo ayudarte con preguntas sobre ventas y rendimiento por tienda.',
      time: 'Ahora',
      suggestions: [
        '¿Cuáles son las 5 tiendas con más ventas?',
        '¿Qué categoría genera más ingresos?',
        '¿Cómo fueron las ventas en 2025?',
      ],
    },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, open]);

  const buildHistory = () =>
    messages
      .filter((m, i) => !(m.role === 'bot' && i === 0))
      .map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text }));

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setLoading(true);

    setMessages(m => [...m, {
      role: 'user',
      text: msg,
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    }]);

    // Agregar mensaje bot con phase reasoning desde el inicio
    // así el bloque "Pensando..." aparece inmediatamente
    setMessages(m => [...m, {
      role: 'bot',
      text: '',
      reasoning: '',
      phase: 'reasoning',
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      suggestions: [],
    }]);

    try {
      const res = await fetch(`${CHATBOT_URL}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: buildHistory() }),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer    = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const dataStr = line.slice(5).trim();
          if (!dataStr || dataStr === '[DONE]') continue;

          let data;
          try { data = JSON.parse(dataStr); } catch { continue; }

          setMessages(m => {
            const updated = [...m];
            const bot     = { ...updated[updated.length - 1] };

            if (data.type === 'reasoning') {
              bot.reasoning = (bot.reasoning || '') + data.token;
              bot.phase     = 'reasoning';

            } else if (data.type === 'sql') {
              bot.phase = 'content';

            } else if (data.type === 'content') {
              bot.text  = (bot.text || '') + data.token;
              bot.phase = 'content';

            } else if (data.type === 'clean_text') {
              bot.text = data.text;

            } else if (data.type === 'meta') {
              bot.suggestions = data.suggestions || [];

            } else if (data.type === 'done') {
              bot.phase = 'done';

            } else if (data.type === 'error') {
              bot.text  = data.message || 'Error al procesar la consulta.';
              bot.phase = 'done';
            }

            updated[updated.length - 1] = bot;
            return updated;
          });
        }
      }
    } catch {
      setMessages(m => {
        const updated = [...m];
        updated[updated.length - 1] = {
          role: 'bot',
          text: 'Hubo un error al conectar con el asistente.',
          time: 'Ahora',
          suggestions: [],
          phase: 'done',
          reasoning: null,
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="chat-fab__panel">
          {/* Encabezado */}
          <div className="chat-fab__header">
            <div className="chat-fab__header-left">
              <div className="chat-fab__avatar">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 5.58 2 10c0 2.39 1.36 4.52 3.5 6.04V20l3.1-1.7c1.08.3 2.23.46 3.4.46 5.52 0 10-3.58 10-8s-4.48-8-10-8z" stroke="#D8C3A5" strokeWidth="1.5" />
                </svg>
              </div>
              <div>
                <div className="chat-fab__bot-name">Asistente Vertiche</div>
                <div className="chat-fab__status">
                  <span className="chat-fab__status-dot" aria-hidden="true" />
                  En línea
                </div>
              </div>
            </div>
            <button className="chat-fab__close-btn" onClick={() => setOpen(false)} aria-label="Cerrar chat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="chat-fab__messages" ref={messagesRef}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`chat-fab__message ${m.role === 'bot' ? 'chat-fab__message--bot' : 'chat-fab__message--user'}`}
              >
                <div className="chat-fab__message-author">
                  {m.role === 'bot' ? 'Asistente' : 'Tú'}
                </div>

                {/* Thinking: aparece inmediatamente en phase reasoning,
                    y se mantiene después si tiene reasoning acumulado */}
                {m.role === 'bot' && (m.phase === 'reasoning' || m.reasoning) && (
                  <ThinkingBlock
                    reasoning={m.reasoning}
                    isLive={m.phase === 'reasoning'}
                  />
                )}

                {/* Burbuja de respuesta */}
                {m.role === 'bot' && m.text ? (
                  <div className="chat-fab__bubble chat-fab__bubble--bot">
                    {renderMarkdown(m.text)}
                  </div>
                ) : m.role === 'user' ? (
                  <div className="chat-fab__bubble chat-fab__bubble--user">
                    {m.text}
                  </div>
                ) : null}

                <div className="chat-fab__message-time">{m.time}</div>

                {/* Sugerencias */}
                {m.role === 'bot' && m.suggestions?.length > 0 && (
                  <div className="chat-fab__suggestions">
                    <div className="chat-fab__suggestions-label">Sugerencias</div>
                    {m.suggestions.map((s, si) => (
                      <button
                        key={si}
                        className="chat-fab__suggestion-btn"
                        onClick={() => send(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Indicador de carga */}
            {loading && (
              <div className="chat-fab__message chat-fab__message--bot">
                <div className="chat-fab__message-author">Asistente</div>
                <div className="chat-fab__bubble chat-fab__bubble--bot chat-fab__bubble--loading" role="status" aria-label="Cargando respuesta">
                  <span aria-hidden="true" />
                  <span aria-hidden="true" />
                  <span aria-hidden="true" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="chat-fab__input-area">
            <textarea
              className="chat-fab__textarea"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Escribe una pregunta…"
              rows={1}
              disabled={loading}
            />
            <button
              className={`chat-fab__send-btn ${input.trim() && !loading ? 'chat-fab__send-btn--active' : 'chat-fab__send-btn--inactive'}`}
              onClick={() => send()}
              disabled={loading}
              aria-label="Enviar mensaje"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Botón flotante */}
      <button
        className={`chat-fab__trigger ${open ? 'chat-fab__trigger--open' : 'chat-fab__trigger--closed'}`}
        onClick={() => setOpen(o => !o)}
        title="Asistente Vertiche"
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente Vertiche'}
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2C6.48 2 2 5.58 2 10c0 2.39 1.36 4.52 3.5 6.04V20l3.1-1.7c1.08.3 2.23.46 3.4.46 5.52 0 10-3.58 10-8s-4.48-8-10-8z" stroke="#fff" strokeWidth="1.6" />
          </svg>
        )}
      </button>
    </>
  );
}