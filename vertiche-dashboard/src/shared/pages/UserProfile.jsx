import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Bell, LogOut, Eye, EyeOff, Check, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../../features/auth/supabase';

function Section({ title, children }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E7E2DC',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid #F0EDE8',
        fontSize: 11,
        fontWeight: 600,
        color: '#6B6B6B',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        {title}
      </div>
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  height: 36,
  padding: '0 12px',
  border: '1px solid #E7E2DC',
  borderRadius: 8,
  fontSize: 13,
  color: '#111111',
  background: '#F8F6F3',
  fontFamily: 'var(--font)',
  outline: 'none',
  transition: 'border-color .15s, background .15s',
  width: '100%',
  boxSizing: 'border-box',
};

function TextInput({ value, onChange, placeholder, disabled }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{ ...inputStyle, color: '#111111', cursor: disabled ? 'default' : 'text' }}
      onFocus={e => { if (!disabled) { e.target.style.borderColor = '#111111'; e.target.style.background = '#FFFFFF'; } }}
      onBlur={e => { e.target.style.borderColor = '#E7E2DC'; e.target.style.background = '#F8F6F3'; }}
    />
  );
}

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle, paddingRight: 36 }}
        onFocus={e => { e.target.style.borderColor = '#111111'; e.target.style.background = '#FFFFFF'; }}
        onBlur={e => { e.target.style.borderColor = '#E7E2DC'; e.target.style.background = '#F8F6F3'; }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6B6B6B', display: 'flex', alignItems: 'center' }}
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

function SaveButton({ onClick, saved, loading, label = 'Guardar cambios' }) {
  return (
    <button
      onClick={onClick}
      disabled={loading || saved}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 16px', borderRadius: 8, fontSize: 13,
        fontWeight: 500, cursor: loading || saved ? 'default' : 'pointer',
        border: 'none',
        background: saved ? '#EAF2EA' : '#111111',
        color: saved ? '#4A7C59' : '#FFFFFF',
        fontFamily: 'var(--font)', transition: 'background .2s, color .2s',
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading
        ? <><Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> Guardando…</>
        : saved
          ? <><Check size={13} /> Guardado</>
          : label}
    </button>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, background: '#FDF2EF', border: '1px solid #F0D5CF', fontSize: 12, color: '#B65E4A' }}>
      <AlertCircle size={13} style={{ flexShrink: 0 }} />
      {message}
    </div>
  );
}

export default function UserProfile({ onBack, onLogout, user: sessionUser }) {
  const [loadingUser, setLoadingUser] = useState(true);

  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', cargo: '', empleadoId: '' });

  const [passForm,    setPassForm]    = useState({ actual: '', nueva: '', confirmar: '' });
  const [savingPass,  setSavingPass]  = useState(false);
  const [savedPass,   setSavedPass]   = useState(false);
  const [passError,   setPassError]   = useState('');

  const [notifEnabled, setNotifEnabled] = useState(true);
  const [turno,        setTurno]        = useState('Matutino');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const m = user.user_metadata ?? {};
      setForm({
        nombre:     m.nombre      ?? '',
        apellido:   m.apellido    ?? '',
        email:      user.email    ?? '',
        cargo:      m.cargo       ?? '',
        empleadoId: m.empleadoId  ?? '',
      });
      if (m.turno) setTurno(m.turno);
      setLoadingUser(false);
    });
  }, []);


  const handleSavePass = async () => {
    if (!passForm.actual) { setPassError('Ingresa tu contraseña actual.'); return; }
    if (passForm.nueva.length < 8) { setPassError('La nueva contraseña debe tener al menos 8 caracteres.'); return; }
    if (passForm.nueva !== passForm.confirmar) { setPassError('Las contraseñas no coinciden.'); return; }

    setPassError('');
    setSavingPass(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email:    form.email,
      password: passForm.actual,
    });

    if (signInError) {
      setSavingPass(false);
      setPassError('La contraseña actual es incorrecta.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: passForm.nueva });
    setSavingPass(false);

    if (error) {
      setPassError(error.message);
    } else {
      setSavedPass(true);
      setPassForm({ actual: '', nueva: '', confirmar: '' });
      setTimeout(() => setSavedPass(false), 2500);
    }
  };

  const displayName = [form.nombre, form.apellido].filter(Boolean).join(' ') || sessionUser?.email || '—';

  if (loadingUser) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8F6F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font)', fontSize: 13, color: '#6B6B6B', gap: 10 }}>
        <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
        Cargando perfil…
        <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F3', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font)' }}>

      <header style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: '#FFFFFF', borderBottom: '1px solid #E7E2DC',
        height: 56, display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: 16,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 10px', borderRadius: 8, fontSize: 13,
            fontWeight: 500, color: '#6B6B6B', background: 'transparent',
            border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
            transition: 'background .1s, color .1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F8F6F3'; e.currentTarget.style.color = '#111111'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B6B6B'; }}
        >
          <ArrowLeft size={14} />
          Volver
        </button>

        <div style={{ width: 1, height: 20, background: '#E7E2DC' }} />

        <span style={{ fontWeight: 600, fontSize: 14, color: '#111111', letterSpacing: '-0.01em' }}>
          Perfil de usuario
        </span>
      </header>

      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '32px 24px 64px' }}>
        <div style={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Avatar card */}
          <div style={{
            background: '#FFFFFF', border: '1px solid #E7E2DC',
            borderRadius: 12, padding: '20px',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: '#E7E2DC', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <User size={24} color="#6B6B6B" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#111111' }}>{displayName}</div>
              <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>
                {form.cargo || sessionUser?.cargo || '—'} · Turno {turno}
              </div>
              <div style={{ fontSize: 11, color: '#AAAAAA', marginTop: 2 }}>{form.email}</div>
            </div>
          </div>

          {/* Personal info */}
          <Section title="Información personal">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Nombre">
                  <TextInput value={form.nombre} disabled />
                </Field>
                <Field label="Apellido">
                  <TextInput value={form.apellido} disabled />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Correo electrónico">
                  <div style={{ position: 'relative' }}>
                    <Mail size={13} color="#6B6B6B" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="email"
                      value={form.email}
                      disabled
                      style={{ ...inputStyle, paddingLeft: 30, color: '#111111', cursor: 'default' }}
                    />
                  </div>
                </Field>
                <Field label="Cargo">
                  <TextInput value={form.cargo} disabled />
                </Field>
              </div>
              <Field label="ID de empleado">
                <TextInput value={form.empleadoId} disabled />
              </Field>
            </div>
          </Section>

          {/* Security */}
          <Section title="Seguridad · Cambio de contraseña">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <Field label="Contraseña actual">
                <PasswordInput value={passForm.actual} onChange={v => setPassForm(p => ({ ...p, actual: v }))} placeholder="••••••••" />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Nueva contraseña">
                  <PasswordInput value={passForm.nueva} onChange={v => setPassForm(p => ({ ...p, nueva: v }))} placeholder="Mín. 8 caracteres" />
                </Field>
                <Field label="Confirmar contraseña">
                  <PasswordInput value={passForm.confirmar} onChange={v => setPassForm(p => ({ ...p, confirmar: v }))} placeholder="Repite la contraseña" />
                </Field>
              </div>
              {passForm.nueva.length > 0 && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { label: '8+ chars', ok: passForm.nueva.length >= 8 },
                    { label: 'Mayúscula', ok: /[A-Z]/.test(passForm.nueva) },
                    { label: 'Número',    ok: /[0-9]/.test(passForm.nueva) },
                  ].map(r => (
                    <span key={r.label} style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: r.ok ? '#EAF2EA' : '#F5F5F5', color: r.ok ? '#4A7C59' : '#AAAAAA' }}>
                      {r.label}
                    </span>
                  ))}
                </div>
              )}
              <ErrorBanner message={passError} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <SaveButton onClick={handleSavePass} saved={savedPass} loading={savingPass} label="Cambiar contraseña" />
            </div>
          </Section>

          {/* Preferences */}
          <Section title="Preferencias">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111111' }}>Turno de trabajo</div>
                  <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>Define tu jornada activa en el sistema</div>
                </div>
                <select
                  value={turno}
                  onChange={e => setTurno(e.target.value)}
                  style={{
                    height: 32, padding: '0 10px', border: '1px solid #E7E2DC',
                    borderRadius: 8, fontSize: 12, color: '#111111',
                    background: '#F8F6F3', fontFamily: 'var(--font)',
                    cursor: 'pointer', outline: 'none', appearance: 'none',
                    paddingRight: 28, minWidth: 130,
                  }}
                >
                  <option>Matutino</option>
                  <option>Vespertino</option>
                  <option>Nocturno</option>
                </select>
              </div>

              <div style={{ height: 1, background: '#F0EDE8' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Bell size={15} color="#6B6B6B" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111111' }}>Notificaciones de incidencias</div>
                    <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>Alertas en tiempo real de eventos críticos</div>
                  </div>
                </div>
                <button
                  onClick={() => setNotifEnabled(v => !v)}
                  style={{
                    width: 40, height: 22, borderRadius: 11, border: 'none',
                    background: notifEnabled ? '#111111' : '#E7E2DC',
                    cursor: 'pointer', position: 'relative',
                    transition: 'background .2s', flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3,
                    left: notifEnabled ? 21 : 3,
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#FFFFFF',
                    transition: 'left .2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                  }} />
                </button>
              </div>
            </div>
          </Section>

          {/* Session */}
          <Section title="Sesión">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, color: '#111111', fontWeight: 500 }}>Cerrar sesión</div>
                <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>Salir de Vertiche en este dispositivo</div>
              </div>
              <button
                onClick={onLogout}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8, fontSize: 13,
                  fontWeight: 500, cursor: 'pointer',
                  border: '1px solid #F0D5CF', background: '#FDF2EF',
                  color: '#B65E4A', fontFamily: 'var(--font)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAE8E3'}
                onMouseLeave={e => e.currentTarget.style.background = '#FDF2EF'}
              >
                <LogOut size={13} />
                Cerrar sesión
              </button>
            </div>
          </Section>

        </div>
      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
