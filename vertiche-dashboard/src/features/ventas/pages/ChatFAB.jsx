import { useState, useRef, useEffect } from 'react';
import './styles/ChatFAB.css';

export function ChatFAB() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: '¡Hola! Soy tu asistente de Vertiche. Puedo ayudarte con preguntas sobre ventas y rendimiento por tienda.',
      time: 'Ahora',
    },
  ]);
  const [input, setInput] = useState('');
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(m => [...m, { role: 'user', text, time: 'Ahora' }]);
    setInput('');
    setTimeout(() => {
      setMessages(m => [
        ...m,
        {
          role: 'bot',
          text: 'Estoy procesando tu consulta. Esta es una demostración — en producción conectaría con los datos reales de ventas.',
          time: 'Ahora',
        },
      ]);
    }, 800);
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
              <div
                key={i}
                className={`chat-fab__message ${m.role === 'bot' ? 'chat-fab__message--bot' : 'chat-fab__message--user'}`}
              >
                <div className="chat-fab__message-author">
                  {m.role === 'bot' ? 'Asistente' : 'Tú'}
                </div>
                <div className={`chat-fab__bubble ${m.role === 'bot' ? 'chat-fab__bubble--bot' : 'chat-fab__bubble--user'}`}>
                  {m.text}
                </div>
                <div className="chat-fab__message-time">{m.time}</div>
              </div>
            ))}
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
            />
            <button
              className={`chat-fab__send-btn ${input.trim() ? 'chat-fab__send-btn--active' : 'chat-fab__send-btn--inactive'}`}
              onClick={send}
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
        {open
          ? (
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
