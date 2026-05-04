import { useState } from 'react';
import BahiasPopup from './BahiasPopup';
import PrepPackModal from './PrepPackModal';
import OrdenTimeline from './OrdenTimeline';

const ETAPAS     = ['Preregistro', 'QA', 'Registro', 'Sorter', 'Bahias', 'Auditoria', 'Envio'];
const ETAPA_IDX  = Object.fromEntries(ETAPAS.map((e, i) => [e, i]));
const CIRC_COLOR = { green: '#6E8B6B', amber: '#C9963B', red: '#B65E4A', gray: '#CCC6BE' };
const SLA_BG     = { ok: 'rgba(110,139,107,.1)', warn: 'rgba(201,150,59,.15)', over: 'rgba(182,94,74,.12)' };
const SLA_FG     = { ok: '#6E8B6B', warn: '#C9963B', over: '#B65E4A' };
const SLA_MIN    = { Preregistro: 10, QA: 15, Registro: 10, Sorter: 5, Bahias: 20, Auditoria: 12, Envio: 8 };

function fmtTs(ts) {
  if (!ts) return '—';
  return new Date(ts).toTimeString().slice(0, 5);
}
function fmtMin(min) {
  if (min >= 60) return `${Math.floor(min / 60)}h ${Math.round(min % 60)}min`;
  return `${Math.round(min)}min`;
}

function getEtapaEvents(orden, etapa) {
  return (orden.prepacks ?? [])
    .flatMap(pp => (pp.historial ?? []).filter(e => e.etapa === etapa))
    .map(e => new Date(e.timestamp).getTime());
}

function etapaColor(pe, orden, etapa) {
  if (!pe || pe.count === 0) return 'gray';
  if (pe.count === pe.total)  return 'green';
  const events  = getEtapaEvents(orden, etapa);
  if (events.length === 0)    return 'amber';
  const elapsed = (Date.now() - Math.max(...events)) / 60000;
  if (elapsed >= SLA_MIN[etapa]) return 'red';
  return 'amber';
}

function slaCls(orden, etapa, pe) {
  if (!pe || pe.count === 0 || pe.count === pe.total) return 'none';
  const events = getEtapaEvents(orden, etapa);
  if (events.length === 0) return 'none';
  const elapsed = (Date.now() - Math.max(...events)) / 60000;
  const sla     = SLA_MIN[etapa];
  if (elapsed >= sla)       return 'over';
  if (elapsed >= sla * 0.7) return 'warn';
  return 'ok';
}

function elapsedStr(orden, etapa, pe) {
  if (!pe || pe.count === 0 || pe.count === pe.total) return '';
  const events = getEtapaEvents(orden, etapa);
  if (events.length === 0) return '';
  return fmtMin((Date.now() - Math.max(...events)) / 60000);
}

function timeRangeStr(orden, etapa) {
  const times = getEtapaEvents(orden, etapa);
  if (times.length === 0) return '';
  const min = Math.min(...times);
  const max = Math.max(...times);
  const active = (orden.prepacks ?? []).some(pp => pp.currentEtapa === etapa);
  return `${fmtTs(min)} → ${active ? '···' : fmtTs(max)}`;
}

function orderAlertCls(orden) {
  for (const etapa of ETAPAS) {
    const pe = orden.progresoEtapa?.find(p => p.etapa === etapa);
    if (!pe || pe.count === 0 || pe.count === pe.total) continue;
    const events = getEtapaEvents(orden, etapa);
    if (events.length === 0) continue;
    const elapsed = (Date.now() - Math.max(...events)) / 60000;
    if (elapsed >= SLA_MIN[etapa]) return 'red';
  }
  for (const etapa of ETAPAS) {
    const pe = orden.progresoEtapa?.find(p => p.etapa === etapa);
    if (!pe || pe.count === 0 || pe.count === pe.total) continue;
    const events = getEtapaEvents(orden, etapa);
    if (events.length === 0) continue;
    const elapsed = (Date.now() - Math.max(...events)) / 60000;
    if (elapsed >= SLA_MIN[etapa] * 0.7) return 'yellow';
  }
  return 'none';
}

function maxEtapaIdx(orden) {
  if (!orden.prepacks?.length) return -1;
  return Math.max(...orden.prepacks.map(pp => ETAPA_IDX[pp.currentEtapa] ?? -1));
}

function StageCell({ orden, etapa, onBahiaClick }) {
  const pe     = orden.progresoEtapa?.find(p => p.etapa === etapa);
  const count  = pe?.count ?? 0;
  const total  = pe?.total ?? orden.totalPrepacks ?? 0;
  const pct    = pe ? Math.round(pe.percentage) : 0;
  const color  = etapaColor(pe, orden, etapa);
  const sc     = slaCls(orden, etapa, pe);
  const slaStr = elapsedStr(orden, etapa, pe);
  const tStr   = timeRangeStr(orden, etapa);
  const pctStr = count === 0 ? '—' : `${pct}%`;
  const cntStr = `${count}/${total} pp`;
  const cellBg = sc === 'over' ? 'rgba(201,150,59,.05)' : sc === 'warn' ? 'rgba(201,150,59,.02)' : 'transparent';

  const inner = (
    <>
      <div style={{
        width: 42, height: 42, borderRadius: '50%', border: `3px solid ${CIRC_COLOR[color]}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 3px',
      }}>
        <span style={{ fontSize: pctStr.length > 3 ? 10 : 13, fontWeight: 700, color: '#1F1F1F', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
          {pctStr}
        </span>
      </div>
      <div style={{ fontSize: 11, color: '#555555', fontWeight: 500, whiteSpace: 'nowrap', marginBottom: 1 }}>{cntStr}</div>
      <div style={{ fontSize: 9, color: '#6B6B6B', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', marginBottom: 2 }}>{tStr}</div>
      {slaStr && sc !== 'none'
        ? <span style={{ display: 'inline-block', padding: '1px 6px', borderRadius: 20, fontSize: 9, fontWeight: 600, whiteSpace: 'nowrap', background: SLA_BG[sc] || 'transparent', color: SLA_FG[sc] || '#6B6B6B' }}>{slaStr}</span>
        : <span style={{ display: 'inline-block', minHeight: 14 }} />
      }
    </>
  );

  const tdStyle = { padding: '5px 8px', textAlign: 'center', verticalAlign: 'middle', minWidth: 116, background: cellBg, borderBottom: '1px solid #E7E2DC' };

  if (etapa === 'Bahias') {
    return (
      <td style={tdStyle}>
        <div
          onClick={e => { e.stopPropagation(); onBahiaClick(e, orden); }}
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

function ExpandedRow({ orden, onOpenModal }) {
  const prepacks = orden.prepacks ?? [];
  return (
    <div style={{ background: '#F8F6F3', border: '1px solid #E7E2DC', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700 }}>{orden.orderId} — {prepacks.length} prepacks</span>
        <span style={{ fontSize: 10, color: '#6B6B6B' }}>Doble clic en prepack para detalle completo</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              {['ID', 'ETAPA ACTUAL', 'ULTIMO REGISTRO'].map(h => (
                <th key={h} style={{ padding: '4px 8px', textAlign: 'left', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', color: '#6B6B6B', borderBottom: '1px solid #E7E2DC' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {prepacks.map((pp, i) => {
              const times = (pp.historial ?? []).map(e => new Date(e.timestamp).getTime());
              const lastTs = times.length > 0 ? Math.max(...times) : null;
              return (
                <tr
                  key={pp.id}
                  onDoubleClick={() => onOpenModal(orden.orderId, pp.id)}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F5F2EE'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '5px 8px', fontWeight: 700, borderBottom: i < prepacks.length - 1 ? '1px solid #F0EDE8' : 'none' }}>{pp.id}</td>
                  <td style={{ padding: '5px 8px', borderBottom: i < prepacks.length - 1 ? '1px solid #F0EDE8' : 'none' }}>{pp.currentEtapa}</td>
                  <td style={{ padding: '5px 8px', fontVariantNumeric: 'tabular-nums', borderBottom: i < prepacks.length - 1 ? '1px solid #F0EDE8' : 'none' }}>{lastTs ? new Date(lastTs).toTimeString().slice(0, 8) : '—'}</td>
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

export default function AnalisisFlujo({ ordenes = [] }) {
  const [sort,        setSort]        = useState('id-asc');
  const [etapaFilter, setEtapaFilter] = useState('');
  const [searchQ,     setSearchQ]     = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [bahiaPopup,  setBahiaPopup]  = useState(null);
  const [modal,       setModal]       = useState(null);

  const toggleExpand = id => {
    setExpandedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const handleBahiaClick = (e, orden) => {
    const rect = e.currentTarget.closest('td')?.getBoundingClientRect() || e.currentTarget.getBoundingClientRect();
    if (bahiaPopup?.orden?.orderId === orden.orderId) { setBahiaPopup(null); return; }
    setBahiaPopup({ orden, rect });
  };

  const getFiltered = () => {
    let res = [...ordenes];
    if (etapaFilter) res = res.filter(o => o.prepacks?.some(pp => pp.currentEtapa === etapaFilter));
    if (searchQ) {
      const q = searchQ.toLowerCase();
      res = res.filter(o => o.orderId.toLowerCase().includes(q) || o.prepacks?.some(p => p.id.toLowerCase().includes(q)));
    }
    if (sort === 'id-asc')   res.sort((a, b) => a.orderId.localeCompare(b.orderId));
    if (sort === 'id-desc')  res.sort((a, b) => b.orderId.localeCompare(a.orderId));
    if (sort === 'adv-desc') res.sort((a, b) => maxEtapaIdx(b) - maxEtapaIdx(a));
    if (sort === 'adv-asc')  res.sort((a, b) => maxEtapaIdx(a) - maxEtapaIdx(b));
    return res;
  };

  const filtered = getFiltered();
  const modalOrden   = modal ? ordenes.find(o => o.orderId === modal.orderId) : null;
  const modalPrepack = modalOrden?.prepacks?.find(p => p.id === modal.ppId) ?? null;

  return (
    <div>
      <div style={{ padding: '16px 24px 10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.4px', margin: 0 }}>Flujo de equipos</h1>
          <p style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>Monitoreo en tiempo real · conteo y tiempos por etapa</p>
        </div>
      </div>

      {/* Filter bar — mismo estilo que el original */}
      <div style={{ padding: '0 24px 12px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Ordenar:</span>
        <select style={selStyle} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="id-asc">ID Orden ↑</option>
          <option value="id-desc">ID Orden ↓</option>
          <option value="adv-desc">Más avanzada</option>
          <option value="adv-asc">Menos avanzada</option>
        </select>
        <div style={{ width: 1, height: 18, background: '#E7E2DC', margin: '0 2px' }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '.5px' }}>Filtrar:</span>
        <select style={selStyle} value={etapaFilter} onChange={e => setEtapaFilter(e.target.value)}>
          <option value="">Etapa (todas)</option>
          {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
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
                <th style={{ padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: '#6B6B6B', background: '#F8F6F3', borderBottom: '1px solid #E7E2DC', textAlign: 'left', whiteSpace: 'nowrap', userSelect: 'none' }}>ORDEN</th>
                {ETAPAS.map(e => (
                  <th key={e} style={{ padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: '#6B6B6B', background: '#F8F6F3', borderBottom: '1px solid #E7E2DC', textAlign: 'center', whiteSpace: 'nowrap', userSelect: 'none' }}>{e}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(orden => {
                const ac        = orderAlertCls(orden);
                const isOpen    = expandedIds.has(orden.orderId);
                const leftColor = ac === 'red' ? '#B65E4A' : ac === 'yellow' ? '#C9963B' : 'transparent';

                return [
                  <tr
                    key={orden.orderId}
                    onClick={() => toggleExpand(orden.orderId)}
                    style={{ cursor: 'pointer', transition: 'background .1s', borderLeft: `3px solid ${leftColor}` }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '6px 10px', verticalAlign: 'middle', minWidth: 132, maxWidth: 144, borderBottom: '1px solid #E7E2DC' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {orden.orderId}
                        <span style={{ fontSize: 10, color: '#6B6B6B', transition: 'transform .2s', display: 'inline-block', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', lineHeight: 1 }}>›</span>
                        {ac === 'red'    && <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#B65E4A' }} title="SLA excedido" />}
                        {ac === 'yellow' && <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#C9963B' }} title="SLA en riesgo" />}
                      </div>
                      <div style={{ fontSize: 10, color: '#6B6B6B', marginTop: 1, fontWeight: 500 }}>{orden.totalPrepacks} prepacks</div>
                    </td>
                    {ETAPAS.map(etapa => (
                      <StageCell key={etapa} orden={orden} etapa={etapa} onBahiaClick={handleBahiaClick} />
                    ))}
                  </tr>,

                  <tr key={`tl-${orden.orderId}`}>
                    <td colSpan={8} style={{ padding: '0 10px 2px', borderBottom: isOpen ? 'none' : '1px solid #E7E2DC' }}>
                      <OrdenTimeline orden={orden} />
                    </td>
                  </tr>,

                  isOpen && (
                    <tr key={`exp-${orden.orderId}`}>
                      <td colSpan={8} style={{ padding: '0 14px 12px', borderBottom: '1px solid #E7E2DC' }}>
                        <ExpandedRow orden={orden} onOpenModal={(orderId, ppId) => setModal({ orderId, ppId })} />
                      </td>
                    </tr>
                  ),
                ];
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#6B6B6B' }}>Sin órdenes activas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {bahiaPopup && (
        <BahiasPopup order={bahiaPopup.orden} triggerRect={bahiaPopup.rect} onClose={() => setBahiaPopup(null)} />
      )}
      {modal && modalOrden && modalPrepack && (
        <PrepPackModal orden={modalOrden} prepack={modalPrepack} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
