import { useState, useMemo } from 'react';
import { detectarPrepacksDetenidos, SLA_POR_ETAPA } from '../utils/alertas';

const STATUS_LABEL = { open: 'Abierta', escalated: 'Escalada', resolved: 'Resuelta' };
const STATUS_STYLE = {
  open:      { background: 'rgba(182,94,74,.12)',   color: '#B65E4A' },
  escalated: { background: 'rgba(201,150,59,.15)',  color: '#C9963B' },
  resolved:  { background: 'rgba(110,139,107,.12)', color: '#6E8B6B' },
};

function elapsedMinPp(pp) {
  const events = (pp.historial ?? [])
    .filter(e => e.etapa === pp.currentEtapa)
    .map(e => new Date(e.timestamp).getTime());
  if (events.length === 0) return 0;
  return (Date.now() - Math.max(...events)) / 60000;
}

function lastTsForEtapa(pp) {
  const events = (pp.historial ?? [])
    .filter(e => e.etapa === pp.currentEtapa)
    .map(e => new Date(e.timestamp).getTime());
  return events.length > 0 ? Math.max(...events) : null;
}

function timeAgo(ts) {
  if (!ts) return 'ahora mismo';
  const min = Math.floor((Date.now() - ts) / 60000);
  if (min < 1)  return 'ahora mismo';
  if (min < 60) return `hace ${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `hace ${h}h${m > 0 ? ` ${m}min` : ''}`;
}

function genDesc(pp) {
  const el  = Math.round(elapsedMinPp(pp));
  const sla = SLA_POR_ETAPA[pp.currentEtapa] ?? 0;
  if (el >= sla * 2) return `Prepack crítico — detenido ${el}min en ${pp.currentEtapa}, supera 2x SLA`;
  return `Prepack detenido ${el}min en ${pp.currentEtapa} — revisar lectora RFID`;
}

function initialStatus(pp) {
  const el  = elapsedMinPp(pp);
  const sla = SLA_POR_ETAPA[pp.currentEtapa] ?? 0;
  return el > sla * 2 ? 'escalated' : 'open';
}

function IncModal({ inc, onClose, onSave, onEscalate, onResolve }) {
  const [causa, setCausa] = useState(inc.causa ?? '');

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(17,17,17,.38)', backdropFilter: 'blur(2px)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ background: '#FFFFFF', borderRadius: 14, boxShadow: '0 8px 40px rgba(17,17,17,.2)', width: 'min(460px, 94vw)', maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #E7E2DC', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{inc.id} — {inc.orderId}</div>
            <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>Etapa: {inc.stage.toUpperCase()} · {timeAgo(inc.ts)}</div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E7E2DC', background: 'transparent', cursor: 'pointer', fontSize: 14, color: '#6B6B6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>✕</button>
        </div>

        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#6B6B6B', marginBottom: 7 }}>Descripción de la falla</div>
            <p style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.5, background: '#F8F6F3', padding: '8px 10px', borderRadius: 8, margin: 0 }}>{inc.desc}</p>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#6B6B6B', marginBottom: 4, display: 'block' }}>Causa registrada</label>
            <textarea
              value={causa}
              onChange={e => setCausa(e.target.value)}
              placeholder="Describe la causa raíz del problema…"
              style={{ width: '100%', minHeight: 72, padding: '8px 10px', border: '1px solid #E7E2DC', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font)', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#111111'}
              onBlur={e => e.target.style.borderColor = '#E7E2DC'}
            />
          </div>

          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#6B6B6B', marginBottom: 7 }}>Acciones</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => onSave(inc.id, causa)} style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', border: 'none', background: '#111111', color: '#FFFFFF', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#333333'}
                onMouseLeave={e => e.currentTarget.style.background = '#111111'}>
                💾 Guardar causa
              </button>
              <button onClick={() => onEscalate(inc.id, causa)} style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', border: '1px solid rgba(201,150,59,.3)', background: 'rgba(201,150,59,.15)', color: '#C9963B' }}>
                ⬆️ Escalar
              </button>
              <button onClick={() => onResolve(inc.id, causa)} style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', border: '1px solid rgba(110,139,107,.3)', background: 'rgba(110,139,107,.15)', color: '#6E8B6B' }}>
                ✅ Marcar resuelto
              </button>
              <button onClick={onClose} style={{ padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', border: '1px solid #E7E2DC', background: 'transparent', color: '#6B6B6B' }}>
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
  const [overrides,   setOverrides]   = useState({});
  const [filter,      setFilter]      = useState('');
  const [activeModal, setActiveModal] = useState(null);

  const detected = useMemo(() => detectarPrepacksDetenidos(prepacks), [prepacks]);

  // Construir lista de incidencias con IDs generados
  const incidencias = detected.map((pp, i) => {
    const ov = overrides[pp.id] ?? {};
    return {
      id:      `INC-${String(i + 1).padStart(3, '0')}`,
      ppId:    pp.id,
      orderId: pp.orderId,
      stage:   pp.currentEtapa,
      desc:    genDesc(pp),
      ts:      lastTsForEtapa(pp),
      causa:   ov.causa ?? '',
      status:  ov.status ?? initialStatus(pp),
    };
  });

  const open      = incidencias.filter(i => i.status === 'open').length;
  const escalated = incidencias.filter(i => i.status === 'escalated').length;
  const resolved  = incidencias.filter(i => i.status === 'resolved').length;

  const filtered  = filter ? incidencias.filter(i => i.status === filter) : [...incidencias];
  const modalInc  = activeModal ? incidencias.find(i => i.id === activeModal) : null;

  const handleSave = (incId, causa) => {
    const inc = incidencias.find(i => i.id === incId);
    if (inc) setOverrides(prev => ({ ...prev, [inc.ppId]: { ...prev[inc.ppId], causa } }));
    setActiveModal(null);
  };
  const handleEscalate = (incId, causa) => {
    const inc = incidencias.find(i => i.id === incId);
    if (inc) setOverrides(prev => ({ ...prev, [inc.ppId]: { ...prev[inc.ppId], causa, status: 'escalated' } }));
    setActiveModal(null);
  };
  const handleResolve = (incId, causa) => {
    const inc = incidencias.find(i => i.id === incId);
    if (inc) setOverrides(prev => ({ ...prev, [inc.ppId]: { ...prev[inc.ppId], causa, status: 'resolved' } }));
    setActiveModal(null);
  };

  const filterBtns = [
    { val: '',          label: 'Todas' },
    { val: 'open',      label: 'Abiertas' },
    { val: 'escalated', label: 'Escaladas' },
    { val: 'resolved',  label: 'Resueltas' },
  ];

  const thStyle = { padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: '#6B6B6B', background: '#F8F6F3', borderBottom: '1px solid #E7E2DC', whiteSpace: 'nowrap', textAlign: 'left' };
  const tdStyle = { padding: '9px 12px', borderBottom: '1px solid #E7E2DC', verticalAlign: 'middle' };

  return (
    <div>
      <div style={{ padding: '16px 24px 10px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.4px', margin: 0 }}>Gestión de Incidencias</h1>
        <p style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>Registro, escalación y resolución de fallas detectadas</p>
      </div>

      <div style={{ padding: '0 24px 32px' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          {[
            { label: 'Abiertas',  val: open,      color: '#B65E4A' },
            { label: 'Escaladas', val: escalated,  color: '#C9963B' },
            { label: 'Resueltas', val: resolved,   color: '#6E8B6B' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ flex: 1, minWidth: 130, background: '#FFFFFF', border: '1px solid #E7E2DC', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#6B6B6B', marginBottom: 4 }}>{label}</div>
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
                borderColor: filter === btn.val ? '#111111' : '#E7E2DC',
                background:  filter === btn.val ? '#111111' : 'transparent',
                color:        filter === btn.val ? '#FFFFFF' : '#1F1F1F',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{ border: '1px solid #E7E2DC', borderRadius: 12, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 700 }}>
              <thead>
                <tr>
                  {['INC ID', 'ORDEN', 'ETAPA', 'DESCRIPCIÓN', 'DETECTADA', 'ESTADO'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#6B6B6B' }}>Sin incidencias</td></tr>
                )}
                {[...filtered].reverse().map(inc => (
                  <tr
                    key={inc.id}
                    onClick={() => setActiveModal(inc.id)}
                    style={{ cursor: 'pointer', transition: 'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={tdStyle}><strong>{inc.id}</strong></td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{inc.orderId}</td>
                    <td style={tdStyle}>
                      <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 20, fontSize: 9, fontWeight: 600, background: 'rgba(182,94,74,.12)', color: '#B65E4A' }}>
                        {inc.stage.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 220, fontSize: 11, color: '#6B6B6B' }}>{inc.desc}</td>
                    <td style={{ ...tdStyle, fontSize: 11, color: '#6B6B6B', whiteSpace: 'nowrap' }}>{timeAgo(inc.ts)}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, ...STATUS_STYLE[inc.status] }}>
                        {STATUS_LABEL[inc.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalInc && (
        <IncModal
          inc={modalInc}
          onClose={() => setActiveModal(null)}
          onSave={handleSave}
          onEscalate={handleEscalate}
          onResolve={handleResolve}
        />
      )}
    </div>
  );
}
