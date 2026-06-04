import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Trash2, AlertCircle, UserCheck, Loader } from 'lucide-react';
import { supabase } from '../auth/supabase';

import { API_URLS } from '../../config/api.js';

const AUTH_API = API_URLS.auth;

const ROLES_CONFIG = {
  superadmin: { label: 'Super Admin',  panels: ['monitoreo', 'rfid', 'ventas'] },
  supervisor:  { label: 'Supervisor',   panels: ['monitoreo', 'ventas'] },
  operador:    { label: 'Operador',     panels: ['rfid'] },
  analista:    { label: 'Analista',     panels: ['ventas'] },
};

const PANEL_LABELS = { monitoreo: 'Monitoreo', rfid: 'RFID', ventas: 'Ventas' };

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  height: 36,
  padding: '0 12px',
  border: '1px solid #E7E2DC',
  borderRadius: 8,
  fontSize: 13,
  color: '#111111',
  background: '#F8F6F3',
  fontFamily: 'var(--font)',
  outline: 'none',
};

function Badge({ text, color = '#6B6B6B', bg = '#F5F5F5' }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: bg, color }}>
      {text}
    </span>
  );
}

function UserFormModalWithToken({ onClose, onCreated, getToken }) {
  const [token, setToken] = useState('');
  useEffect(() => { getToken().then(setToken); }, [getToken]);
  return <UserFormModal onClose={onClose} onCreated={onCreated} token={token} />;
}

function UserFormModal({ onClose, onCreated, token }) {
  const [form, setForm] = useState({ email: '', password: '', nombre: '', cargo: '', role: 'operador' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const update = key => val => setForm(f => ({ ...f, [key]: val }));

  const panels = ROLES_CONFIG[form.role]?.panels ?? [];

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password || !form.nombre) { setError('Email, contraseña y nombre son obligatorios.'); return; }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${AUTH_API}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, panels }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al crear usuario');
      onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 480,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden',
      }}>
        <div style={{ padding: '22px 24px', borderBottom: '1px solid #F0EDE8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#111111' }}>Nuevo usuario</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#6B6B6B', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, background: '#FDF2EF', border: '1px solid #F0D5CF', fontSize: 12, color: '#B65E4A' }}>
              <AlertCircle size={13} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          {[
            { label: 'Correo electrónico *', key: 'email', type: 'email', placeholder: 'usuario@empresa.com' },
            { label: 'Contraseña temporal *', key: 'password', type: 'password', placeholder: 'Mín. 6 caracteres' },
            { label: 'Nombre completo *', key: 'nombre', type: 'text', placeholder: 'Nombre Apellido' },
            { label: 'Cargo', key: 'cargo', type: 'text', placeholder: 'Ej: Supervisor CEDIS' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>
              <input type={type} value={form[key]} onChange={e => update(key)(e.target.value)} placeholder={placeholder} style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#111111'; e.target.style.background = '#FFFFFF'; }}
                onBlur={e => { e.target.style.borderColor = '#E7E2DC'; e.target.style.background = '#F8F6F3'; }}
              />
            </div>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rol</label>
            <select value={form.role} onChange={e => update('role')(e.target.value)} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' }}>
              {Object.entries(ROLES_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div style={{ padding: '10px 12px', borderRadius: 8, background: '#F8F6F3', border: '1px solid #E7E2DC', fontSize: 12, color: '#6B6B6B' }}>
            Paneles asignados: {panels.map(p => PANEL_LABELS[p]).join(', ')}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, height: 38, borderRadius: 8, border: '1px solid #E7E2DC',
              background: '#F8F6F3', color: '#6B6B6B', fontSize: 13, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{
              flex: 2, height: 38, borderRadius: 8, border: 'none',
              background: loading ? '#444444' : '#111111', color: '#FFFFFF',
              fontSize: 13, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
              fontFamily: 'var(--font)',
            }}>
              {loading ? 'Creando…' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPanel({ user, onBack, onLogout }) {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showForm,    setShowForm]    = useState(false);
  const [deletingId,  setDeletingId]  = useState(null);
  const [confirmId,   setConfirmId]   = useState(null);

  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? '';
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = await getToken();
      const res = await fetch(`${AUTH_API}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al cargar usuarios');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleDelete = async id => {
    setDeletingId(id);
    try {
      const token = await getToken();
      const res = await fetch(`${AUTH_API}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Error al eliminar usuario');
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const roleInfo = role => ROLES_CONFIG[role] ?? { label: role, panels: [] };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F3', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: '#FFFFFF', borderBottom: '1px solid #E7E2DC',
        height: 56, display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: 16,
      }}>
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
          borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#6B6B6B',
          background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F8F6F3'; e.currentTarget.style.color = '#111111'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B6B6B'; }}
        >
          <ArrowLeft size={14} />
          Volver
        </button>
        <div style={{ width: 1, height: 20, background: '#E7E2DC' }} />
        <span style={{ fontWeight: 600, fontSize: 14, color: '#111111', flex: 1 }}>Panel de administración</span>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            borderRadius: 8, fontSize: 13, fontWeight: 500, border: 'none',
            background: '#111111', color: '#FFFFFF', cursor: 'pointer', fontFamily: 'var(--font)',
          }}
        >
          <Plus size={14} />
          Nuevo usuario
        </button>
      </header>

      {/* Contenido */}
      <main style={{ flex: 1, padding: '32px 24px', maxWidth: 900, width: '100%', margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#111111', letterSpacing: '-0.02em' }}>Usuarios del sistema</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B6B6B' }}>Gestiona los accesos y roles del equipo</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: '#FDF2EF', border: '1px solid #F0D5CF', fontSize: 13, color: '#B65E4A', marginBottom: 16 }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '40px 0', color: '#6B6B6B', fontSize: 13 }}>
            <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
            Cargando usuarios…
          </div>
        ) : (
          <div style={{ background: '#FFFFFF', border: '1px solid #E7E2DC', borderRadius: 12, overflow: 'hidden' }}>
            {/* Encabezado tabla */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 120px 1fr 80px',
              padding: '10px 16px', borderBottom: '1px solid #F0EDE8',
              fontSize: 10, fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              <span>Nombre</span>
              <span>Correo</span>
              <span>Rol</span>
              <span>Paneles</span>
              <span></span>
            </div>

            {users.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: 13, color: '#6B6B6B' }}>
                No hay usuarios registrados.
              </div>
            ) : users.map((u, i) => {
              const { label: roleLabel } = roleInfo(u.user_metadata?.role ?? 'operador');
              const panels = (u.user_metadata?.panels ?? []).map(p => PANEL_LABELS[p] ?? p).join(', ');
              const isLast = i === users.length - 1;
              const isMe = u.id === user.id;

              return (
                <div key={u.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 120px 1fr 80px',
                  padding: '12px 16px', alignItems: 'center',
                  borderBottom: isLast ? 'none' : '1px solid #F0EDE8',
                  background: isMe ? '#FAFAF8' : '#FFFFFF',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#E7E2DC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <UserCheck size={13} color="#6B6B6B" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#111111' }}>
                      {u.user_metadata?.nombre ?? '—'}
                      {isMe && <span style={{ fontSize: 10, color: '#AAAAAA', marginLeft: 6 }}>(tú)</span>}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: '#6B6B6B', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</span>
                  <Badge text={roleLabel} />
                  <span style={{ fontSize: 12, color: '#6B6B6B' }}>{panels || '—'}</span>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {!isMe && (
                      confirmId === u.id ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setConfirmId(null)} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid #E7E2DC', background: '#F8F6F3', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                            No
                          </button>
                          <button onClick={() => handleDelete(u.id)} disabled={deletingId === u.id} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: 'none', background: '#B65E4A', color: '#FFFFFF', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                            {deletingId === u.id ? '…' : 'Sí'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(u.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px', borderRadius: 6, border: '1px solid #F0D5CF', background: '#FDF2EF', color: '#B65E4A', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font)' }}
                        >
                          <Trash2 size={12} />
                          Eliminar
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showForm && (
        <UserFormModalWithToken
          onClose={() => setShowForm(false)}
          onCreated={loadUsers}
          getToken={getToken}
        />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
