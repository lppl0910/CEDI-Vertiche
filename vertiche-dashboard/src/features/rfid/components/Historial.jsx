import { useState } from 'react';
import PrepPackModal from './PrepPackModal';
import { STAGE_KEYS, STAGE_LABELS, fmtTs, fmtMin } from '../data/sicatMockData';

const CK_COLOR = { ok:'#6E8B6B', fail:'#B65E4A', act:'#C9963B', pend:'#7C8A96' };
const CK_ICON  = { ok:'✓', fail:'✗', act:'⟳', pend:'—' };

function HistDetail({ order }) {
  const fallaStages = STAGE_KEYS.filter(k => order[k]?.status === 'falla');

  return (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
        {order.id} — {order.product} · {order.prereg.total} prepacks
      </div>

      {/* Stage timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 12 }}>
        {STAGE_KEYS.map((k, idx) => {
          const s = order[k];
          if (!s || s.status === 'pending') {
            return (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: idx < STAGE_KEYS.length - 1 ? '1px solid #F5F2EE' : 'none' }}>
                <span style={{ flex: '0 0 88px', fontWeight: 600, fontSize: 11 }}>{STAGE_LABELS[idx]}</span>
                <span style={{ flex: '0 0 118px', color: '#6B6B6B', fontSize: 10 }}>—</span>
                <span style={{ flex: '0 0 18px', fontSize: 12, fontWeight: 700, color: '#7C8A96' }}>—</span>
                <span style={{ fontSize: 10, color: '#6B6B6B' }}>No procesada</span>
              </div>
            );
          }
          const startTs = order.arrivalTs + s.startMin * 60000;
          const endTs   = s.durMin ? startTs + s.durMin * 60000 : null;
          const icon    = s.status === 'done' ? '✓' : s.status === 'falla' ? '✗' : '⟳';
          const iColor  = s.status === 'done' ? '#6E8B6B' : s.status === 'falla' ? '#B65E4A' : '#C9963B';
          return (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: idx < STAGE_KEYS.length - 1 ? '1px solid #F5F2EE' : 'none', flexWrap: 'wrap' }}>
              <span style={{ flex: '0 0 88px', fontWeight: 600, fontSize: 11 }}>{STAGE_LABELS[idx]}</span>
              <span style={{ flex: '0 0 118px', color: '#6B6B6B', fontSize: 10, fontVariantNumeric: 'tabular-nums' }}>{fmtTs(startTs)} → {endTs ? fmtTs(endTs) : '···'}</span>
              <span style={{ flex: '0 0 18px', fontSize: 12, fontWeight: 700, color: iColor }}>{icon}</span>
              <span style={{ fontSize: 10, color: '#6B6B6B' }}>{s.durMin ? fmtMin(s.durMin) : '—'}</span>
              {s.fallaDesc && <span style={{ fontSize: 10, color: '#B65E4A', marginLeft: 6 }}>⚠ {s.fallaDesc}</span>}
              {s.rej > 0   && <span style={{ fontSize: 10, color: '#C9963B', marginLeft: 6 }}>{s.rej} rechazados</span>}
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
              {['ID','COLOR','TALLA','BAHÍA',...STAGE_LABELS.map(l => l.slice(0,3))].map(h => (
                <th key={h} style={{ padding: '4px 8px', textAlign: ['ID','COLOR','TALLA','BAHÍA'].includes(h) ? 'left' : 'center', fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', color: '#6B6B6B', borderBottom: '1px solid #E7E2DC' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.prepacks.slice(0, 6).map((pp, i) => (
              <tr key={pp.id}>
                <td style={{ padding: '5px 8px', fontWeight: 700, fontSize: 11, borderBottom: '1px solid #F0EDE8' }}>{pp.id}</td>
                <td style={{ padding: '5px 8px', fontSize: 11, borderBottom: '1px solid #F0EDE8' }}>{pp.color}</td>
                <td style={{ padding: '5px 8px', fontSize: 11, borderBottom: '1px solid #F0EDE8' }}>{pp.size}</td>
                <td style={{ padding: '5px 8px', fontSize: 11, borderBottom: '1px solid #F0EDE8' }}>{pp.store}</td>
                {pp.stageResults.map((r, si) => (
                  <td key={si} style={{ padding: '5px 8px', textAlign: 'center', borderBottom: '1px solid #F0EDE8' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: CK_COLOR[r] }}>{CK_ICON[r]}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Historial({ historicalOrders, activeOrders }) {
  const [search,      setSearch]      = useState('');
  const [statusFilter,setStatusFilter]= useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [modal,       setModal]       = useState(null);

  const allOrders = [
    ...historicalOrders,
    ...(activeOrders || []).filter(o => o.envio?.sent),
  ];

  const filtered = allOrders.filter(o => {
    const q = search.toLowerCase().trim();
    if (q && !o.id.toLowerCase().includes(q) && !o.product.toLowerCase().includes(q) && !o.prepacks.some(p => p.id.toLowerCase().includes(q))) return false;
    if (statusFilter === 'ok'    && o.hasFalla) return false;
    if (statusFilter === 'falla' && !o.hasFalla) return false;
    return true;
  });

  const toggleExpand = id => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const thStyle = { padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: '#6B6B6B', background: '#F8F6F3', borderBottom: '1px solid #E7E2DC', whiteSpace: 'nowrap', textAlign: 'left' };
  const tdStyle = { padding: '8px 12px', borderBottom: '1px solid #E7E2DC', verticalAlign: 'middle' };

  const modalOrder   = modal ? allOrders.find(o => o.id === modal.orderId) : null;
  const modalPrepack = modalOrder ? modalOrder.prepacks.find(p => p.id === modal.ppId) : null;

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
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ height: 30, padding: '0 26px 0 10px', border: '1px solid #E7E2DC', borderRadius: 6, fontSize: 11, fontFamily: 'var(--font)', color: '#1F1F1F', background: '#FFFFFF', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='5' fill='%236B6B6B'%3E%3Cpath d='M0 0l4.5 5L9 0z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
          >
            <option value="">Todas las órdenes</option>
            <option value="ok">Sin errores</option>
            <option value="falla">Con fallas</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ border: '1px solid #E7E2DC', borderRadius: 12, overflow: 'hidden', background: '#FFFFFF' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 780 }}>
              <thead>
                <tr>
                  {['ORDEN','EQUIPO','PRODUCTO','LLEGADA','COMPLETADO','DURACIÓN','TOTAL PP','ETAPAS CON FALLA','ESTADO'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: 20, color: '#6B6B6B' }}>Sin resultados</td></tr>
                )}
                {filtered.map(o => {
                  const endSt   = o.envio;
                  const endTs   = endSt?.durMin ? o.arrivalTs + (endSt.startMin + endSt.durMin) * 60000 : null;
                  const durMin  = endTs ? Math.round((endTs - o.arrivalTs) / 60000) : null;
                  const fallaStages = STAGE_KEYS.filter(k => o[k]?.status === 'falla');
                  const isOpen  = expandedIds.has(o.id);

                  return [
                    <tr
                      key={o.id}
                      onClick={() => toggleExpand(o.id)}
                      style={{ cursor: 'pointer', transition: 'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={tdStyle}><strong>{o.id}</strong></td>
                      <td style={tdStyle}>Equipo {o.team}</td>
                      <td style={tdStyle}>{o.product}</td>
                      <td style={tdStyle}>{fmtTs(o.arrivalTs)}</td>
                      <td style={tdStyle}>{endTs ? fmtTs(endTs) : '—'}</td>
                      <td style={tdStyle}>{durMin ? fmtMin(durMin) : '—'}</td>
                      <td style={tdStyle}>{o.prereg.total} pp</td>
                      <td style={tdStyle}>
                        {fallaStages.length > 0
                          ? <span style={{ color: '#B65E4A', fontWeight: 700 }}>{fallaStages.map(k => k.toUpperCase()).join(', ')}</span>
                          : <span style={{ color: '#6E8B6B' }}>—</span>
                        }
                      </td>
                      <td style={tdStyle}>
                        {o.hasFalla
                          ? <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'rgba(182,94,74,.12)', color: '#B65E4A' }}>Con fallas</span>
                          : <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'rgba(110,139,107,.12)', color: '#6E8B6B' }}>OK</span>
                        }
                      </td>
                    </tr>,
                    isOpen && (
                      <tr key={`hexp-${o.id}`}>
                        <td colSpan={9} style={{ background: '#FAFAF9', borderBottom: '1px solid #E7E2DC', padding: 0 }}>
                          <HistDetail order={o} />
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

      {modal && modalOrder && modalPrepack && (
        <PrepPackModal order={modalOrder} prepack={modalPrepack} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
