import { useState, useMemo } from 'react';
import { detectarPrepacksDetenidos, SLA_POR_ETAPA } from '../utils/alertas';
import StatusPill from '../../../shared/components/ui/StatusPill';

function elapsedMin(pp) {
  const eventos = pp.historial ?? [];
  const etapaEvents = eventos
    .filter(e => e.etapa === pp.currentEtapa)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  if (etapaEvents.length === 0) return 0;
  return (Date.now() - new Date(etapaEvents[0].timestamp).getTime()) / 60000;
}

function fmtElapsed(min) {
  if (min >= 60) return `${Math.floor(min / 60)}h ${Math.round(min % 60)}m`;
  return `${Math.round(min)} min`;
}

function pillStatus(pp) {
  const sla = SLA_POR_ETAPA[pp.currentEtapa] ?? 0;
  const min = elapsedMin(pp);
  if (min > sla * 2) return 'error';
  return 'warning';
}

const STATUS_LABEL = { open: 'Abierta', escalated: 'Escalada', resolved: 'Resuelta' };

function IncModal({ pp, override, onClose, onSave, onEscalate, onResolve }) {
  const [causa, setCausa] = useState(override?.causa ?? '');

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(17,17,17,.38)', backdropFilter: 'blur(2px)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ background: '#FFFFFF', borderRadius: 14, boxShadow: '0 8px 40px rgba(17,17,17,.2)', width: 'min(460px, 94vw)', maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{pp.id}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              Orden: {pp.orderId} · Etapa: {pp.currentEtapa} · {fmtElapsed(elapsedMin(pp))} detenido
            </div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>✕</button>
        </div>

        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Causa registrada</label>
            <textarea
              value={causa}
              onChange={e => setCausa(e.target.value)}
              placeholder="Describe la causa raiz del problema..."
              style={{ width: '100%', minHeight: 72, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font)', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#111111'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-secondary)', marginBottom: 7 }}>Acciones</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => onSave(pp.id, causa)} style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', border: 'none', background: '#111111', color: '#FFFFFF' }}>
                Guardar causa
              </button>
              <button onClick={() => onEscalate(pp.id, causa)} style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', border: '1px solid rgba(201,150,59,.3)', background: 'rgba(201,150,59,.15)', color: '#C9963B' }}>
                Escalar
              </button>
              <button onClick={() => onResolve(pp.id, causa)} style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', border: '1px solid rgba(110,139,107,.3)', background: 'rgba(110,139,107,.15)', color: '#6E8B6B' }}>
                Marcar resuelto
              </button>
              <button onClick={onClose} style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Incidencias({ prepacks = [] }) {
  const [overrides,   setOverrides]   = useState({});  // { [ppId]: { status, causa } }
  const [filter,      setFilter]      = useState('');
  const [activeModal, setActiveModal] = useState(null);

  const detected = useMemo(() => detectarPrepacksDetenidos(prepacks), [prepacks]);

  const incidencias = detected.map(pp => ({
    pp,
    status: overrides[pp.id]?.status ?? pillStatus(pp) === 'error' ? 'escalated' : 'open',
    causa:  overrides[pp.id]?.causa ?? '',
  }));

  const open      = incidencias.filter(i => i.status === 'open').length;
  const escalated = incidencias.filter(i => i.status === 'escalated').length;
  const resolved  = incidencias.filter(i => i.status === 'resolved').length;

  const filtered = filter ? incidencias.filter(i => i.status === filter) : incidencias;

  const handleSave = (ppId, causa) => {
    setOverrides(prev => ({ ...prev, [ppId]: { ...prev[ppId], causa } }));
    setActiveModal(null);
  };
  const handleEscalate = (ppId, causa) => {
    setOverrides(prev => ({ ...prev, [ppId]: { ...prev[ppId], causa, status: 'escalated' } }));
    setActiveModal(null);
  };
  const handleResolve = (ppId, causa) => {
    setOverrides(prev => ({ ...prev, [ppId]: { ...prev[ppId], causa, status: 'resolved' } }));
    setActiveModal(null);
  };

  const filterBtns = [
    { val: '',          label: 'Todas' },
    { val: 'open',      label: 'Abiertas' },
    { val: 'escalated', label: 'Escaladas' },
    { val: 'resolved',  label: 'Resueltas' },
  ];

  const thStyle = { padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-secondary)', background: '#F8F6F3', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', textAlign: 'left' };
  const tdStyle = { padding: '9px 12px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' };

  const activePp       = activeModal ? detected.find(p => p.id === activeModal) : null;
  const activeOverride = activeModal ? overrides[activeModal] : null;

  return (
    <div>
      <div style={{ padding: '16px 24px 10px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.4px', margin: 0 }}>Gestion de Incidencias</h1>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Prepacks detenidos mas alla del SLA por etapa</p>
      </div>

      <div style={{ padding: '0 24px 32px' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          {[
            { label: 'Abiertas',  val: open,      color: 'var(--error)' },
            { label: 'Escaladas', val: escalated,  color: 'var(--warning)' },
            { label: 'Resueltas', val: resolved,   color: 'var(--success)' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ flex: 1, minWidth: 130, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {filterBtns.map(btn => (
            <button
              key={btn.val}
              onClick={() => setFilter(btn.val)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                border: '1px solid', fontFamily: 'var(--font)', transition: 'all .15s',
                borderColor: filter === btn.val ? '#111111' : 'var(--border)',
                background:  filter === btn.val ? '#111111' : 'transparent',
                color:        filter === btn.val ? '#FFFFFF' : 'var(--text-primary)',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg-card)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 700 }}>
              <thead>
                <tr>
                  {['Prepack ID', 'Orden', 'Etapa', 'Tiempo detenido', 'Estado'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 20, color: 'var(--text-secondary)' }}>
                      {detected.length === 0 ? 'Sin prepacks detenidos.' : 'Sin incidencias en este estado.'}
                    </td>
                  </tr>
                )}
                {filtered.map(({ pp, status }) => (
                  <tr
                    key={pp.id}
                    onClick={() => setActiveModal(pp.id)}
                    style={{ cursor: 'pointer', transition: 'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={tdStyle}><strong>{pp.id}</strong></td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{pp.orderId}</td>
                    <td style={tdStyle}>{pp.currentEtapa}</td>
                    <td style={{ ...tdStyle, fontVariantNumeric: 'tabular-nums' }}>{fmtElapsed(elapsedMin(pp))}</td>
                    <td style={tdStyle}>
                      <StatusPill status={status} label={STATUS_LABEL[status]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {activePp && (
        <IncModal
          pp={activePp}
          override={activeOverride}
          onClose={() => setActiveModal(null)}
          onSave={handleSave}
          onEscalate={handleEscalate}
          onResolve={handleResolve}
        />
      )}
    </div>
  );
}
