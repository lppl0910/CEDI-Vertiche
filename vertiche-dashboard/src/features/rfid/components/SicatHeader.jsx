import { useState, useEffect, useRef } from 'react';
import { UserCircle, ChevronDown, Monitor, ShieldCheck } from 'lucide-react';

function pad(n) { return String(n).padStart(2, '0'); }

const RFID_TABS = [
  { id: 'flujo',       label: 'Análisis de flujo' },
  { id: 'historial',   label: 'Historial' },
  { id: 'incidencias', label: 'Incidencias', badge: true },
];

const ALL_INTERFACES = [
  { id: 'monitoreo', label: 'Monitoreo' },
  { id: 'rfid',      label: 'RFID' },
  { id: 'ventas',    label: 'Ventas' },
];

export default function SicatHeader({
  currentTab, onTabChange,
  incBadgeCount, activeOrderCount,
  onSearch, onInterfaceChange,
  onProfileOpen, onAdminOpen,
  allowedPanels, user,
}) {
  const [clock,     setClock]     = useState('--:--:--');
  const [comboOpen, setComboOpen] = useState(false);
  const comboRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClock(pad(n.getHours()) + ':' + pad(n.getMinutes()) + ':' + pad(n.getSeconds()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = e => {
      if (comboRef.current && !comboRef.current.contains(e.target)) setComboOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const visibleInterfaces = allowedPanels?.length
    ? ALL_INTERFACES.filter(i => allowedPanels.includes(i.id))
    : ALL_INTERFACES;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: '#FFFFFF', borderBottom: '1px solid #E7E2DC',
      height: 56, display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16,
    }}>

      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'baseline', minWidth: 100 }}>
        <span style={{ fontWeight: 600, fontSize: 16, color: '#111111', letterSpacing: '-0.02em' }}>
          Vertiche
        </span>
      </div>

      {/* Center: Tabs */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
        {RFID_TABS.map(tab => {
          const isActive = currentTab === tab.id;
          const badge = tab.badge ? incBadgeCount : 0;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 8, fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#FFFFFF' : '#6B6B6B',
                background: isActive ? '#111111' : 'transparent',
                border: 'none', cursor: 'pointer',
                transition: 'background 0.1s, color 0.1s',
                fontFamily: 'var(--font)',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F8F6F3'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              {tab.label}
              {badge > 0 && (
                <span style={{
                  background: '#B65E4A', color: '#FFFFFF',
                  borderRadius: 20, padding: '0 5px', fontSize: 9, fontWeight: 700,
                }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#6B6B6B', pointerEvents: 'none' }}>🔍</span>
          <input
            type="text"
            placeholder="Buscar ID orden o prepack…"
            onChange={e => onSearch?.(e.target.value)}
            style={{
              width: 200, height: 30, padding: '0 10px 0 28px',
              border: '1px solid #E7E2DC', borderRadius: 8, fontSize: 12,
              fontFamily: 'var(--font)', background: '#F8F6F3', outline: 'none',
              transition: 'border-color .15s, background .15s',
            }}
            onFocus={e => { e.target.style.borderColor = '#111111'; e.target.style.background = '#FFFFFF'; }}
            onBlur={e => { e.target.style.borderColor = '#E7E2DC'; e.target.style.background = '#F8F6F3'; }}
          />
        </div>

        {/* Live dot */}
        <div style={{ width: 6, height: 6, background: '#6E8B6B', borderRadius: '50%', animation: 'sicat-blink 2s ease-in-out infinite', flexShrink: 0 }} />

        {/* Clock */}
        <span style={{ fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#6B6B6B', whiteSpace: 'nowrap' }}>
          {clock}
        </span>

        {/* Order counter */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px', border: '1px solid #E7E2DC',
          borderRadius: 20, fontSize: 11, fontWeight: 600,
          color: '#6B6B6B', whiteSpace: 'nowrap',
        }}>
          <span>{activeOrderCount}</span>&nbsp;órdenes activas
        </div>

        {/* Interface switcher — hidden when user only has 1 panel */}
        {visibleInterfaces.length > 1 && (
          <div ref={comboRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setComboOpen(o => !o)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', borderRadius: 8, fontSize: 13,
                fontWeight: 500, color: '#1F1F1F',
                background: '#F8F6F3', border: '1px solid #E7E2DC',
                cursor: 'pointer', fontFamily: 'var(--font)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#EDE8E2'}
              onMouseLeave={e => e.currentTarget.style.background = '#F8F6F3'}
            >
              <Monitor size={14} color="#6B6B6B" />
              RFID
              <ChevronDown size={13} color="#6B6B6B" style={{ transition: 'transform 0.15s', transform: comboOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {comboOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                background: '#FFFFFF', border: '1px solid #E7E2DC',
                borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                minWidth: 160, overflow: 'hidden', zIndex: 300,
              }}>
                <div style={{ padding: '8px 14px 6px', fontSize: 11, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, borderBottom: '1px solid #F0EDE8' }}>
                  Mis interfaces
                </div>
                {visibleInterfaces.map((iface, i) => {
                  const isActive = iface.id === 'rfid';
                  const isLast = i === visibleInterfaces.length - 1;
                  return (
                    <button
                      key={iface.id}
                      onClick={() => { onInterfaceChange?.(iface.id); setComboOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', textAlign: 'left', padding: '10px 14px',
                        fontSize: 13, fontWeight: isActive ? 500 : 400,
                        color: isActive ? '#111111' : '#1F1F1F',
                        background: isActive ? '#F8F6F3' : '#FFFFFF',
                        border: 'none', borderBottom: isLast ? 'none' : '1px solid #F0EDE8',
                        cursor: 'pointer', fontFamily: 'var(--font)',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F8F6F3'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = '#FFFFFF'; }}
                    >
                      <span>{iface.label}</span>
                      {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#111111', display: 'inline-block' }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Admin button (superadmin only) */}
        {user?.role === 'superadmin' && (
          <button
            onClick={() => { window.history.pushState({}, '', '/admin'); onAdminOpen?.(); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500, color: '#6B6B6B', background: '#F8F6F3', border: '1px solid #E7E2DC', cursor: 'pointer', fontFamily: 'var(--font)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#EDE8E2'}
            onMouseLeave={e => e.currentTarget.style.background = '#F8F6F3'}
          >
            <ShieldCheck size={13} />
            Admin
          </button>
        )}

        {/* Avatar */}
        <button
          onClick={onProfileOpen}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 8, transition: 'background .1s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F8F6F3'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <UserCircle size={24} color="#6B6B6B" />
        </button>
      </div>

      <style>{`@keyframes sicat-blink { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </nav>
  );
}
