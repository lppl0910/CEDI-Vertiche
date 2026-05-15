import { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { setInitialPassword } from './authService';

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

function PasswordInput({ value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <Lock
        size={15}
        color={focused ? '#111111' : '#AAAAAA'}
        style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'color .15s' }}
      />
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          ...inputBase,
          paddingLeft: 38,
          paddingRight: 42,
          borderColor: focused ? '#111111' : '#E7E2DC',
          background: focused ? '#FFFFFF' : '#F8F6F3',
          boxShadow: focused ? '0 0 0 3px rgba(17,17,17,0.06)' : 'none',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: 0, top: 0, height: '100%', display: 'flex', alignItems: 'center', paddingRight: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#AAAAAA' }}
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function Rule({ met, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 14, height: 14, borderRadius: '50%',
        background: met ? '#E8F5E9' : '#F0EDE8',
        border: `1px solid ${met ? '#A5D6A7' : '#E7E2DC'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'all .2s',
      }}>
        {met && <CheckCircle size={9} color="#2E7D32" />}
      </div>
      <span style={{ fontSize: 11, color: met ? '#2E7D32' : '#AAAAAA', transition: 'color .2s' }}>{label}</span>
    </div>
  );
}

export default function ChangePassword({ user, onDone }) {
  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  const hasMin    = password.length >= 8;
  const hasUpper  = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const matches   = password === confirm && confirm.length > 0;
  const canSubmit = hasMin && hasUpper && hasNumber && matches;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    const result = await setInitialPassword(password);
    if (result.error) {
      setError('No se pudo actualizar la contraseña. Intenta de nuevo.');
      setLoading(false);
      return;
    }
    onDone(result.session);
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
          <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 600, color: '#111111', letterSpacing: '-0.02em' }}>
            Establece tu contraseña
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6B6B6B', lineHeight: 1.5 }}>
            Hola, <strong style={{ color: '#111111' }}>{user.nombre}</strong>. Es tu primer inicio de sesión —
            debes crear una nueva contraseña para continuar.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={{ padding: '28px 36px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && (
            <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: '#FDF2EF', border: '1px solid #F0D5CF', fontSize: 13, color: '#B65E4A' }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Nueva contraseña
            </label>
            <PasswordInput value={password} onChange={setPassword} placeholder="Mínimo 8 caracteres" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Confirmar contraseña
            </label>
            <PasswordInput value={confirm} onChange={setConfirm} placeholder="Repite la contraseña" />
          </div>

          {/* Rules */}
          {password.length > 0 && (
            <div style={{ background: '#F8F6F3', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Rule met={hasMin}    label="Mínimo 8 caracteres" />
              <Rule met={hasUpper}  label="Al menos una mayúscula" />
              <Rule met={hasNumber} label="Al menos un número" />
              <Rule met={matches}   label="Las contraseñas coinciden" />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            style={{
              width: '100%',
              height: 44,
              borderRadius: 10,
              border: 'none',
              background: loading || !canSubmit ? '#CCCCCC' : '#111111',
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading || !canSubmit ? 'default' : 'pointer',
              fontFamily: 'var(--font)',
              letterSpacing: '-0.01em',
              transition: 'background .15s, transform .1s',
              marginTop: 4,
            }}
            onMouseEnter={e => { if (!loading && canSubmit) e.currentTarget.style.background = '#2A2A2A'; }}
            onMouseLeave={e => { if (!loading && canSubmit) e.currentTarget.style.background = '#111111'; }}
            onMouseDown={e => { if (!loading && canSubmit) e.currentTarget.style.transform = 'scale(0.985)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {loading ? 'Guardando…' : 'Establecer contraseña'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: 24, fontSize: 11, color: '#AAAAAA', letterSpacing: '0.02em' }}>
        © 2026 Vertiche · Sistema interno
      </p>
    </div>
  );
}
