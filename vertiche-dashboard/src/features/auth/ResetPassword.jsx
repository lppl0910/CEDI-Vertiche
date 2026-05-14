import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { updatePassword } from './authService';
import { supabase } from './supabase';

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  height: 44,
  paddingLeft: 38,
  paddingRight: 42,
  border: '1px solid #E7E2DC',
  borderRadius: 10,
  fontSize: 13,
  color: '#111111',
  background: '#F8F6F3',
  fontFamily: 'var(--font)',
  outline: 'none',
  transition: 'border-color .15s, background .15s',
};

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <Lock size={15} color="#AAAAAA" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={e => { e.target.style.borderColor = '#111111'; e.target.style.background = '#FFFFFF'; }}
        onBlur={e => { e.target.style.borderColor = '#E7E2DC'; e.target.style.background = '#F8F6F3'; }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#AAAAAA', display: 'flex', alignItems: 'center' }}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

export default function ResetPassword() {
  const [ready,    setReady]    = useState(false);
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    // Supabase intercepts the token from the URL hash and establishes a session
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
  }, []);

  const goToLogin = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    setError('');
    const result = await updatePassword(password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setDone(true);
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
            Nueva contraseña
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B6B6B' }}>
            Elige una contraseña segura para tu cuenta.
          </p>
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '28px 36px 32px' }}>
          {done ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#EAF2EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={22} color="#4A7C59" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111111', marginBottom: 6 }}>Contraseña actualizada</div>
                <div style={{ fontSize: 13, color: '#6B6B6B' }}>Ya puedes iniciar sesión con tu nueva contraseña.</div>
              </div>
              <button onClick={goToLogin} style={{
                marginTop: 8, padding: '10px 20px', borderRadius: 10, border: 'none',
                background: '#111111', color: '#FFFFFF', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}>
                Ir al inicio de sesión
              </button>
            </div>
          ) : !ready ? (
            <div style={{ textAlign: 'center', fontSize: 13, color: '#6B6B6B', padding: '20px 0' }}>
              Verificando enlace de recuperación…
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                  Nueva contraseña
                </label>
                <PasswordInput value={password} onChange={setPassword} placeholder="Mín. 8 caracteres" />
                {password.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    {[
                      { label: '8+ chars', ok: password.length >= 8 },
                      { label: 'Mayúscula', ok: /[A-Z]/.test(password) },
                      { label: 'Número', ok: /[0-9]/.test(password) },
                    ].map(r => (
                      <span key={r.label} style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: r.ok ? '#EAF2EA' : '#F5F5F5', color: r.ok ? '#4A7C59' : '#AAAAAA' }}>
                        {r.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Confirmar contraseña
                </label>
                <PasswordInput value={confirm} onChange={setConfirm} placeholder="Repite la contraseña" />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', height: 44, borderRadius: 10, border: 'none', marginTop: 4,
                  background: loading ? '#444444' : '#111111', color: '#FFFFFF',
                  fontSize: 14, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
                  fontFamily: 'var(--font)', transition: 'background .15s',
                }}
              >
                {loading ? 'Guardando…' : 'Guardar nueva contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
