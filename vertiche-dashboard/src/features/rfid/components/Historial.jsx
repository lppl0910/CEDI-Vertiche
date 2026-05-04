import { useState } from 'react';

const ETAPAS = ['Preregistro', 'QA', 'Registro', 'Sorter', 'Bahias', 'Auditoria', 'Envio'];

function isCompleted(orden) {
  return ETAPAS.every(etapa => {
    const pe = orden.progresoEtapa?.find(p => p.etapa === etapa);
    return pe && pe.count === pe.total && pe.total > 0;
  });
}

function allTimestamps(orden) {
  return (orden.prepacks ?? [])
    .flatMap(pp => (pp.historial ?? []).map(e => new Date(e.timestamp).getTime()))
    .filter(Boolean);
}

function fmtTs(ts) {
  if (!ts) return '—';
  return new Date(ts).toTimeString().slice(0, 5);
}
function fmtMin(min) {
  if (min >= 60) return `${Math.floor(min / 60)}h ${Math.round(min % 60)}min`;
  return `${Math.round(min)}min`;
}

function HistDetail({ orden }) {
  const prepacks = orden.prepacks ?? [];
  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
        {orden.orderId} · {orden.totalPrepacks} prepacks
      </div>

      {/* Stage timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 12 }}>
        {ETAPAS.map((etapa, idx) => {
          const events = prepacks
            .flatMap(pp => (pp.historial ?? []).filter(e => e.etapa === etapa))
            .map(e => new Date(e.timestamp).getTime());
          if (events.length === 0) {
            return (
              <div key={etapa} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: idx < ETAPAS.length - 1 ? '1px solid #F5F2EE' : 'none' }}>
                <span style={{ flex: '0 0 88px', fontWeight: 600, fontSize: 11 }}>{etapa}</span>
                <span style={{ flex: '0 0 118px', color: '#6B6B6B', fontSize: 10 }}>—</span>
                <span style={{ flex: '0 0 18px', fontSize: 12, fontWeight: 700, color: '#7C8A96' }}>—</span>
                <span style={{ fontSize: 10, color: '#6B6B6B' }}>No procesada</span>
              </div>
            );
          }
          const minTs  = Math.min(...events);
          const maxTs  = Math.max(...events);
          const durMin = Math.round((maxTs - minTs) / 60000);
          const pe     = orden.progresoEtapa?.find(p => p.etapa === etapa);
          const done   = pe && pe.count === pe.total;
          return (
            <div key={etapa} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: idx < ETAPAS.length - 1 ? '1px solid #F5F2EE' : 'none', flexWrap: 'wrap' }}>
              <span style={{ flex: '0 0 88px', fontWeight: 600, fontSize: 11 }}>{etapa}</span>
              <span style={{ flex: '0 0 118px', color: '#6B6B6B', fontSize: 10, fontVariantNumeric: 'tabular-nums' }}>{fmtTs(minTs)} → {fmtTs(maxTs)}</span>
              <span style={{ flex: '0 0 18px', fontSize: 12, fontWeight: 700, color: done ? '#6E8B6B' : '#C9963B' }}>{done ? '✓' : '⟳'}</span>
              <span style={{ fontSize: 10, color: '#6B6B6B' }}>{durMin > 0 ? fmtMin(durMin) : '—'}</span>
            </div>
          );
        })}
      </div>

      {/* Prepack sample */}
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#6B6B6B', marginBottom: 6 }}>
        Muestra de prepacks
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              {['ID', 'Etapa actual', 'Ultimo registro'].map(h => (
                <th key={h} style={{ padding: '4px 8px', textAlign: 'left', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', color: '#6B6B6B', borderBottom: '1px solid #E7E2DC' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {prepacks.slice(0, 6).map((pp, i) => {
              const times = (pp.historial ?? []).map(e => new Date(e.timestamp).getTime());
              const lastTs = times.length > 0 ? Math.max(...times) : null;
              return (
                <tr key={pp.id}>
                  <td style={{ padding: '5px 8px', fontWeight: 700, fontSize: 11, borderBottom: '1px solid #F0EDE8' }}>{pp.id}</td>
                  <td style={{ padding: '5px 8px', fontSize: 11, borderBottom: '1px solid #F0EDE8' }}>{pp.currentEtapa}</td>
                  <td style={{ padding: '5px 8px', fontSize: 11, fontVariantNumeric: 'tabular-nums', borderBottom: '1px solid #F0EDE8' }}>{lastTs ? new Date(lastTs).toTimeString().slice(0, 8) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const selStyle = { height: 30, padding: '0 26px 0 10px', border: '1px solid #E7E2DC', borderRadius: 6, fontSize: 11, fontFamily: 'var(--font)', color: '#1F1F1F', background: '#FFFFFF', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='5' fill='%236B6B6B'%3E%3Cpath d='M0 0l4.5 5L9 0z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' };

export default function Historial({ ordenes = [] }) {
  const [search,      setSearch]      = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());

  const completed = ordenes.filter(isCompleted);

  const filtered = search
    ? completed.filter(o =>
        o.orderId.toLowerCase().includes(search.toLowerCase()) ||
        o.prepacks?.some(p => p.id.toLowerCase().includes(search.toLowerCase()))
      )
    : completed;

  const toggleExpand = id => {
    setExpandedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const thStyle = { padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: '#6B6B6B', background: '#F8F6F3', borderBottom: '1px solid #E7E2DC', whiteSpace: 'nowrap', textAlign: 'left' };
  const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #E7E2DC', verticalAlign: 'middle' };

  return (
    <div>
      <div style={{ padding: '16px 24px 10px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.4px', margin: 0 }}>Historial de Órdenes</h1>
        <p style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>Órdenes completadas · errores · recorrido de prepacks</p>
      </div>

      <div style={{ padding: '0 24px 32px' }}>
        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#6B6B6B', pointerEvents: 'none' }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por orden o prepack…"
              style={{ height: 32, padding: '0 10px 0 30px', border: '1px solid #E7E2DC', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font)', outline: 'none', background: '#FFFFFF', width: 250 }}
              onFocus={e => e.target.style.borderColor = '#111111'}
              onBlur={e => e.target.style.borderColor = '#E7E2DC'}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ border: '1px solid #E7E2DC', borderRadius: 12, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 700 }}>
              <thead>
                <tr>
                  {['ORDEN', 'LLEGADA', 'COMPLETADO', 'DURACIÓN', 'TOTAL PP', 'ESTADO'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20, color: '#6B6B6B' }}>
                    {completed.length === 0 ? 'Sin órdenes completadas aún.' : 'Sin resultados.'}
                  </td></tr>
                )}
                {filtered.map(orden => {
                  const times   = allTimestamps(orden);
                  const startTs = times.length > 0 ? Math.min(...times) : null;
                  const endTs   = times.length > 0 ? Math.max(...times) : null;
                  const durMin  = startTs && endTs ? Math.round((endTs - startTs) / 60000) : null;
                  const isOpen  = expandedIds.has(orden.orderId);

                  return [
                    <tr
                      key={orden.orderId}
                      onClick={() => toggleExpand(orden.orderId)}
                      style={{ cursor: 'pointer', transition: 'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={tdStyle}><strong>{orden.orderId}</strong></td>
                      <td style={tdStyle}>{fmtTs(startTs)}</td>
                      <td style={tdStyle}>{fmtTs(endTs)}</td>
                      <td style={tdStyle}>{durMin ? fmtMin(durMin) : '—'}</td>
                      <td style={tdStyle}>{orden.totalPrepacks} pp</td>
                      <td style={tdStyle}>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'rgba(110,139,107,.12)', color: '#6E8B6B' }}>OK</span>
                      </td>
                    </tr>,
                    isOpen && (
                      <tr key={`hexp-${orden.orderId}`}>
                        <td colSpan={6} style={{ background: '#FAFAF9', borderBottom: '1px solid #E7E2DC', padding: 0 }}>
                          <HistDetail orden={orden} />
                        </td>
                      </tr>
                    ),
                  ];
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
