import { useState, useRef } from 'react';
import BahiasPopup from './BahiasPopup';
import PrepPackModal from './PrepPackModal';
import {
  STAGE_KEYS, STAGE_LABELS,
  stageColor, stagePctStr, stageCountStr, stageTimeStr, stageElapsedMin,
  slaCls, fmtMin, fmtTs, orderAlertCls, orderAdvance,
} from '../data/sicatMockData';

const CIRC_COLOR = { green:'#6E8B6B', amber:'#C9963B', red:'#B65E4A', gray:'#CCC6BE' };
const SLA_BG     = { ok:'rgba(110,139,107,.1)', warn:'rgba(201,150,59,.15)', over:'rgba(182,94,74,.12)' };
const SLA_FG     = { ok:'#6E8B6B', warn:'#C9963B', over:'#B65E4A' };
const CK_COLOR   = { ok:'#6E8B6B', fail:'#B65E4A', act:'#C9963B', pend:'#7C8A96' };
const CK_ICON    = { ok:'✓', fail:'✗', act:'⟳', pend:'—' };

function StageCell({ order, stageKey, onBahiaClick }) {
  const s      = order[stageKey];
  const color  = stageColor(s);
  const pct    = stagePctStr(s);
  const cnt    = stageCountStr(s);
  const tStr   = stageTimeStr(order, stageKey);
  const el     = stageElapsedMin(order, stageKey);
  const sc     = (s && s.status !== 'pending') ? slaCls(el, stageKey) : 'none';
  const slaStr = el !== null ? fmtMin(el) : '';
  const cellBg = s?.status === 'falla' ? 'rgba(182,94,74,.05)'
    : (sc === 'over' && s?.status === 'active') ? 'rgba(201,150,59,.05)' : 'transparent';

  const inner = (
    <>
      <div style={{
        width: 42, height: 42, borderRadius: '50%', border: `3px solid ${CIRC_COLOR[color]}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 3px',
      }}>
        <span style={{ fontSize: pct.length > 3 ? 10 : 13, fontWeight: 700, color: '#1F1F1F', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          {pct}
        </span>
      </div>
      <div style={{ fontSize: 11, color: '#555555', fontWeight: 500, whiteSpace: 'nowrap', marginBottom: 1 }}>{cnt}</div>
      <div style={{ fontSize: 9, color: '#6B6B6B', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', marginBottom: 2 }}>{tStr}</div>
      {slaStr && sc !== 'none'
        ? <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 20, fontSize: 9, fontWeight: 600, whiteSpace: 'nowrap', background: SLA_BG[sc] || 'transparent', color: SLA_FG[sc] || '#6B6B6B' }}>{slaStr}</span>
        : <span style={{ display: 'inline-block', minHeight: 14 }} />
      }
    </>
  );

  const tdStyle = { padding: '5px 8px', textAlign: 'center', verticalAlign: 'middle', minWidth: 116, background: cellBg, borderBottom: '1px solid #E7E2DC' };

  if (stageKey === 'bahias') {
    return (
      <td style={tdStyle}>
        <div
          onClick={e => { e.stopPropagation(); onBahiaClick(e, order); }}
          style={{ cursor: 'pointer', borderRadius: 6, padding: 2 }}
          onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {inner}
        </div>
      </td>
    );
  }

  return <td style={tdStyle}>{inner}</td>;
}

function ExpandedRow({ order, allOrders, allHistorical, onOpenModal }) {
  return (
    <div style={{ background: '#F8F6F3', border: '1px solid #E7E2DC', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700 }}>{order.id} — {order.product}</span>
        <span style={{ fontSize: 10, color: '#6B6B6B' }}>Doble clic en prepack para detalle completo</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              {['ID','COLOR','TALLA','BAHÍA', ...STAGE_LABELS.map(l => l.slice(0,3))].map(h => (
                <th key={h} style={{ padding: '4px 8px', textAlign: h === 'ID' || h === 'COLOR' || h === 'TALLA' || h === 'BAHÍA' ? 'left' : 'center', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', color: '#6B6B6B', borderBottom: '1px solid #E7E2DC' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {order.prepacks.map((pp, i) => (
              <tr
                key={pp.id}
                onDoubleClick={() => onOpenModal(order.id, pp.id)}
                style={{ cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F5F2EE'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '5px 8px', fontWeight: 700, borderBottom: i < order.prepacks.length - 1 ? '1px solid #F0EDE8' : 'none' }}>{pp.id}</td>
                <td style={{ padding: '5px 8px', borderBottom: i < order.prepacks.length - 1 ? '1px solid #F0EDE8' : 'none' }}>{pp.color}</td>
                <td style={{ padding: '5px 8px', borderBottom: i < order.prepacks.length - 1 ? '1px solid #F0EDE8' : 'none' }}>{pp.size}</td>
                <td style={{ padding: '5px 8px', borderBottom: i < order.prepacks.length - 1 ? '1px solid #F0EDE8' : 'none' }}>{pp.store}</td>
                {pp.stageResults.map((r, si) => (
                  <td key={si} style={{ padding: '5px 8px', textAlign: 'center', borderBottom: i < order.prepacks.length - 1 ? '1px solid #F0EDE8' : 'none' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: CK_COLOR[r] }}>{CK_ICON[r]}</span>
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

export default function AnalisisFlujo({ orders }) {
  const [sort,        setSort]        = useState('id-asc');
  const [teamFilter,  setTeamFilter]  = useState('');
  const [statusFilter,setStatusFilter]= useState('');
  const [searchQ,     setSearchQ]     = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [bahiaPopup,  setBahiaPopup]  = useState(null); // { order, rect }
  const [modal,       setModal]       = useState(null); // { orderId, ppId }

  const toggleExpand = (orderId) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(orderId) ? next.delete(orderId) : next.add(orderId);
      return next;
    });
  };

  const handleBahiaClick = (e, order) => {
    const rect = e.currentTarget.closest('td')?.getBoundingClientRect() || e.currentTarget.getBoundingClientRect();
    if (bahiaPopup?.order.id === order.id) { setBahiaPopup(null); return; }
    setBahiaPopup({ order, rect });
  };

  const handleOpenModal = (orderId, ppId) => {
    setModal({ orderId, ppId });
  };

  const getFiltered = () => {
    let res = [...orders];
    if (teamFilter)   res = res.filter(o => o.team === teamFilter);
    if (statusFilter === 'completed') res = res.filter(o => o.envio.sent);
    if (statusFilter === 'active')    res = res.filter(o => !o.envio.sent && STAGE_KEYS.some(k => o[k]?.status === 'active'));
    if (statusFilter === 'falla')     res = res.filter(o => o.hasFalla);
    if (searchQ) res = res.filter(o => o.id.toLowerCase().includes(searchQ.toLowerCase()) || o.prepacks.some(p => p.id.toLowerCase().includes(searchQ.toLowerCase())));

    if (sort === 'id-asc')       res.sort((a, b) => a.id.localeCompare(b.id));
    if (sort === 'id-desc')      res.sort((a, b) => b.id.localeCompare(a.id));
    if (sort === 'arrival-asc')  res.sort((a, b) => a.arrivalTs - b.arrivalTs);
    if (sort === 'arrival-desc') res.sort((a, b) => b.arrivalTs - a.arrivalTs);
    if (sort === 'adv-desc')     res.sort((a, b) => orderAdvance(b) - orderAdvance(a));
    if (sort === 'adv-asc')      res.sort((a, b) => orderAdvance(a) - orderAdvance(b));

    return res;
  };

  const filtered = getFiltered();

  const selStyle = { height: 30, padding: '0 26px 0 10px', border: '1px solid #E7E2DC', borderRadius: 6, fontSize: 11, fontFamily: 'var(--font)', color: '#1F1F1F', background: '#FFFFFF', cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='5' fill='%236B6B6B'%3E%3Cpath d='M0 0l4.5 5L9 0z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' };

  const modalOrder   = modal ? orders.find(o => o.id === modal.orderId) : null;
  const modalPrepack = modalOrder ? modalOrder.prepacks.find(p => p.id === modal.ppId) : null;

  return (
    <div>
      {/* Page header */}
      <div style={{ padding: '16px 24px 10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.4px', margin: 0 }}>Flujo de equipos</h1>
          <p style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>Monitoreo en tiempo real · conteo y tiempos por etapa</p>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ padding: '0 24px 12px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Ordenar:</span>
        <select style={selStyle} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="id-asc">ID Orden ↑</option>
          <option value="id-desc">ID Orden ↓</option>
          <option value="arrival-asc">Llegada (primero)</option>
          <option value="arrival-desc">Llegada (último)</option>
          <option value="adv-desc">Más avanzada</option>
          <option value="adv-asc">Menos avanzada</option>
        </select>
        <div style={{ width: 1, height: 18, background: '#E7E2DC', margin: '0 2px' }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Filtrar:</span>
        <select style={selStyle} value={teamFilter} onChange={e => setTeamFilter(e.target.value)}>
          <option value="">Equipo (todos)</option>
          <option value="Alpha">Alpha</option>
          <option value="Beta">Beta</option>
          <option value="Delta">Delta</option>
          <option value="Gamma">Gamma</option>
        </select>
        <select style={selStyle} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Estado (todos)</option>
          <option value="completed">Completados</option>
          <option value="active">En progreso</option>
          <option value="falla">Con fallas</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6B6B6B', background: '#F8F6F3', border: '1px solid #E7E2DC', borderRadius: 20, padding: '2px 10px' }}>
          {filtered.length} orden{filtered.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* Table */}
      <div style={{ padding: '0 24px 32px', overflowX: 'auto' }}>
        <div style={{ border: '1px solid #E7E2DC', borderRadius: 12, overflow: 'hidden', background: '#FFFFFF' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1040, background: '#FFFFFF' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: '#6B6B6B', background: '#F8F6F3', borderBottom: '1px solid #E7E2DC', textAlign: 'left', whiteSpace: 'nowrap', userSelect: 'none' }}>
                  ORDEN
                </th>
                {STAGE_LABELS.map(l => (
                  <th key={l} style={{ padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: '#6B6B6B', background: '#F8F6F3', borderBottom: '1px solid #E7E2DC', textAlign: 'center', whiteSpace: 'nowrap', userSelect: 'none' }}>
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const ac       = orderAlertCls(order);
                const isOpen   = expandedIds.has(order.id);
                const leftColor = ac === 'red' ? '#B65E4A' : ac === 'yellow' ? '#C9963B' : 'transparent';

                return [
                  <tr
                    key={order.id}
                    onClick={() => toggleExpand(order.id)}
                    style={{ cursor: 'pointer', transition: 'background .1s', borderLeft: `3px solid ${leftColor}` }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '6px 10px', verticalAlign: 'middle', minWidth: 132, maxWidth: 144, borderBottom: '1px solid #E7E2DC' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {order.id}
                        <span style={{ fontSize: 10, color: '#6B6B6B', transition: 'transform .2s', display: 'inline-block', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', lineHeight: 1 }}>›</span>
                        {order.hasFalla && <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#B65E4A' }} title="Falla detectada" />}
                        {!order.hasFalla && ac === 'yellow' && <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#C9963B' }} title="SLA excedido" />}
                      </div>
                      <div style={{ fontSize: 10, color: '#6B6B6B', marginTop: 1, fontWeight: 500 }}>Equipo {order.team}</div>
                      <div style={{ fontSize: 9, color: '#6B6B6B', fontVariantNumeric: 'tabular-nums' }}>{fmtTs(order.arrivalTs)} llegada</div>
                    </td>
                    {STAGE_KEYS.map(k => (
                      <StageCell key={k} order={order} stageKey={k} onBahiaClick={handleBahiaClick} />
                    ))}
                  </tr>,

                  isOpen && (
                    <tr key={`exp-${order.id}`}>
                      <td colSpan={8} style={{ padding: '0 14px 12px', borderBottom: '1px solid #E7E2DC' }}>
                        <ExpandedRow order={order} onOpenModal={handleOpenModal} />
                      </td>
                    </tr>
                  ),
                ];
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bahías popup */}
      {bahiaPopup && (
        <BahiasPopup
          order={bahiaPopup.order}
          triggerRect={bahiaPopup.rect}
          onClose={() => setBahiaPopup(null)}
        />
      )}

      {/* Prepack modal */}
      {modal && modalOrder && modalPrepack && (
        <PrepPackModal
          order={modalOrder}
          prepack={modalPrepack}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
