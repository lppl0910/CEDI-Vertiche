import { useState } from 'react';
import { Mail, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { sendPasswordReset } from './authService';

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  height: 44,
  paddingLeft: 38,
  paddingRight: 14,
  border: '1px solid #E7E2DC',
  borderRadius: 10,
  fontSize: 13,
  color: '#111111',
  background: '#F8F6F3',
  fontFamily: 'var(--font)',
  outline: 'none',
  transition: 'border-color .15s, background .15s, box-shadow .15s',
};

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const goToLogin = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email.trim()) { setError('Ingresa tu correo electrónico.'); return; }
    setLoading(true);
    setError('');
    const result = await sendPasswordReset(email.trim());
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setSent(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F6F3',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font)',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: '#FFFFFF',
        borderRadius: 20,
        border: '1px solid #E7E2DC',
        boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '36px 36px 28px', borderBottom: '1px solid #F0EDE8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, background: '#111111', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 10, height: 10, background: '#D8C3A5', borderRadius: 2, transform: 'rotate(45deg)' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#111111', letterSpacing: '-0.03em' }}>Vertiche</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#111111', letterSpacing: '-0.02em' }}>
            Recuperar contraseña
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B6B6B' }}>
            Te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '28px 36px 32px' }}>
          {sent ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EAF2EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={22} color="#4A7C59" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111111', marginBottom: 6 }}>Correo enviado</div>
                <div style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.5 }}>
                  Revisa tu bandeja de entrada en <strong>{email}</strong> y haz clic en el enlace de recuperación.
                </div>
              </div>
              <button onClick={goToLogin} style={{
                marginTop: 8, padding: '10px 20px', borderRadius: 10, border: 'none',
                background: '#111111', color: '#FFFFFF', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}>
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {error && (
                <div role="alert" style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                  borderRadius: 10, background: '#FDF2EF', border: '1px solid #F0D5CF',
                  fontSize: 13, color: '#B65E4A',
                }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Correo electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="#AAAAAA" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#111111'; e.target.style.background = '#FFFFFF'; e.target.style.boxShadow = '0 0 0 3px rgba(17,17,17,0.06)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E7E2DC'; e.target.style.background = '#F8F6F3'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', height: 44, borderRadius: 10, border: 'none',
                  background: loading ? '#444444' : '#111111', color: '#FFFFFF',
                  fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
                  fontFamily: 'var(--font)', transition: 'background .15s',
                }}
              >
                {loading ? 'Enviando…' : 'Enviar enlace de recuperación'}
              </button>

              <button type="button" onClick={goToLogin} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: '#6B6B6B', fontFamily: 'var(--font)',
              }}>
                <ArrowLeft size={13} />
                Volver al inicio de sesión
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
