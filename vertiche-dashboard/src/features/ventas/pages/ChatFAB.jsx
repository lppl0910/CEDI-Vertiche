import { useState, useRef, useEffect } from 'react';
import './styles/ChatFAB.css';

const CHATBOT_URL = 'http://localhost:8090';

/**
 * Convierte marcado Markdown básico a JSX.
 * Solo soporta **texto** → <strong>texto</strong>.
 * El modelo fue instruido para usar únicamente negritas — otros formatos
 * Markdown se mostrarían como texto plano sin causar errores.
 *
 * @param {string} text
 * @returns {Array<string | JSX.Element>}
 */
function renderMarkdown(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i}>{part}</strong>
      : part
  );
}

/**
 * Botón flotante de chatbot para consultas de ventas en lenguaje natural.
 * Se conecta al backend de IA en http://localhost:8090/chat via POST.
 *
 * Estado interno:
 *   open     — visibilidad del panel de chat
 *   messages — historial de conversación (el índice 0 es la bienvenida estática)
 *   input    — texto actual del textarea
 *   loading  — bloquea el envío mientras espera respuesta del servidor
 *
 * El primer mensaje (bienvenida con sugerencias) se inicializa en el estado
 * directamente — no proviene del API — y se excluye del historial enviado al
 * backend en buildHistory() para no contaminar el contexto del modelo.
 */
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
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, open]);

  /**
   * Convierte el historial interno al formato que espera el endpoint /chat.
   * Excluye el mensaje de bienvenida (índice 0) porque es texto estático del frontend,
   * no una respuesta del modelo. Incluirlo contaminaría el contexto de la conversación.
   *
   * Formato interno: { role: 'bot'|'user', text: string, ... }
   * Formato API:     { role: 'assistant'|'user', content: string }
   *
   * @returns {Array<{ role: 'assistant'|'user', content: string }>}
   */
  const buildHistory = () =>
    messages
      .filter(m => m.role !== 'bot' || messages.indexOf(m) > 0)
      .map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.text }));

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = {
      role: 'user',
      text: msg,
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${CHATBOT_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: buildHistory() }),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();

      setMessages(m => [
        ...m,
        {
          role: 'bot',
          text: data.answer,
          time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
          suggestions: data.suggestions || [],
          sql: data.sql,
        },
      ]);
    } catch {
      setMessages(m => [
        ...m,
        {
          role: 'bot',
          text: 'Hubo un error al conectar con el asistente. Verifica que el servidor esté corriendo.',
          time: 'Ahora',
          suggestions: [],
        },
      ]);
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
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 5.58 2 10c0 2.39 1.36 4.52 3.5 6.04V20l3.1-1.7c1.08.3 2.23.46 3.4.46 5.52 0 10-3.58 10-8s-4.48-8-10-8z" stroke="#D8C3A5" strokeWidth="1.5" />
                </svg>
              </div>
              <div>
                <div className="chat-fab__bot-name">Asistente Vertiche</div>
                <div className="chat-fab__status">
                  <span className="chat-fab__status-dot" />
                  En línea
                </div>
              </div>
            </div>
            <button className="chat-fab__close-btn" onClick={() => setOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="chat-fab__messages" ref={messagesRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-fab__message ${m.role === 'bot' ? 'chat-fab__message--bot' : 'chat-fab__message--user'}`}>
                <div className="chat-fab__message-author">
                  {m.role === 'bot' ? 'Asistente' : 'Tú'}
                </div>
                <div className={`chat-fab__bubble ${m.role === 'bot' ? 'chat-fab__bubble--bot' : 'chat-fab__bubble--user'}`}>
                  {m.role === 'bot' ? renderMarkdown(m.text) : m.text}
                </div>
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
                <div className="chat-fab__bubble chat-fab__bubble--bot chat-fab__bubble--loading">
                  <span />
                  <span />
                  <span />
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
              // Enter envía el mensaje; Shift+Enter inserta salto de línea en el textarea.
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Escribe una pregunta…"
              rows={1}
              disabled={loading}
            />
            <button
              className={`chat-fab__send-btn ${input.trim() && !loading ? 'chat-fab__send-btn--active' : 'chat-fab__send-btn--inactive'}`}
              onClick={() => send()}
              disabled={loading}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
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
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 5.58 2 10c0 2.39 1.36 4.52 3.5 6.04V20l3.1-1.7c1.08.3 2.23.46 3.4.46 5.52 0 10-3.58 10-8s-4.48-8-10-8z" stroke="#fff" strokeWidth="1.6" />
          </svg>
        )}
      </button>
    </>
  );
}
