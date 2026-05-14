import { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, Mail } from 'lucide-react';
import { login } from './authService';

const inputBase = {
  width: '100%',
  boxSizing: 'border-box',
  height: 44,
  border: '1px solid #E7E2DC',
  borderRadius: 10,
  fontSize: 13,
  color: '#111111',
  background: '#F8F6F3',
  fontFamily: 'var(--font)',
  outline: 'none',
  transition: 'border-color .15s, background .15s, box-shadow .15s',
};

function IconInput({ icon: Icon, type = 'text', value, onChange, placeholder, rightSlot }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <Icon
        size={15}
        color={focused ? '#111111' : '#AAAAAA'}
        style={{
          position: 'absolute',
          left: 13,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          transition: 'color .15s',
        }}
      />
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          ...inputBase,
          paddingLeft: 38,
          paddingRight: rightSlot ? 42 : 14,
          borderColor: focused ? '#111111' : '#E7E2DC',
          background: focused ? '#FFFFFF' : '#F8F6F3',
          boxShadow: focused ? '0 0 0 3px rgba(17,17,17,0.06)' : 'none',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {rightSlot && (
        <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', display: 'flex', alignItems: 'center', paddingRight: 12 }}>
          {rightSlot}
        </div>
      )}
    </div>
  );
}

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Completa todos los campos.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(email.trim(), password);
    if (result.error) {
      setError('Correo o contraseña incorrectos.');
      setLoading(false);
      return;
    }
    onLogin(result.session);
  };

  const eyeButton = (
    <button
      type="button"
      onClick={() => setShowPass(s => !s)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#AAAAAA', display: 'flex', alignItems: 'center' }}
      aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

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
        <div style={{
          padding: '36px 36px 28px',
          borderBottom: '1px solid #F0EDE8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 32, height: 32,
              background: '#111111',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 10, height: 10, background: '#D8C3A5', borderRadius: 2, transform: 'rotate(45deg)' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: '#111111', letterSpacing: '-0.03em' }}>
              Vertiche
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#111111', letterSpacing: '-0.02em' }}>
            Iniciar sesión
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6B6B6B' }}>
            Sistema de gestión CEDIS
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate style={{ padding: '28px 36px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && (
            <div role="alert" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 14px', borderRadius: 10,
              background: '#FDF2EF', border: '1px solid #F0D5CF',
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
            <IconInput
              icon={Mail}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="tu@correo.com"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Contraseña
            </label>
            <IconInput
              icon={Lock}
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              rightSlot={eyeButton}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => window.history.pushState({}, '', '/forgot-password') && window.dispatchEvent(new PopStateEvent('popstate'))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6B6B6B', fontFamily: 'var(--font)', padding: 0, textDecoration: 'underline', textUnderlineOffset: 2 }}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: 44,
              borderRadius: 10,
              border: 'none',
              background: loading ? '#444444' : '#111111',
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              fontFamily: 'var(--font)',
              letterSpacing: '-0.01em',
              transition: 'background .15s, transform .1s',
              marginTop: 4,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#2A2A2A'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#111111'; }}
            onMouseDown={e => { if (!loading) e.currentTarget.style.transform = 'scale(0.985)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {loading ? 'Verificando…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: 24, fontSize: 11, color: '#AAAAAA', letterSpacing: '0.02em' }}>
        © 2026 Vertiche · Sistema interno
      </p>
    </div>
  );
}
