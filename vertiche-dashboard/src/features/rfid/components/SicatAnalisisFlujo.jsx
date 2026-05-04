import { useState } from 'react';
import BahiasPopup from './BahiasPopup';
import PrepPackModal from './PrepPackModal';
import OrdenesFilterBar from './OrdenesFilterBar';

const ETAPAS = ['Preregistro', 'QA', 'Registro', 'Sorter', 'Bahias', 'Auditoria', 'Envio'];

function cellBg(percentage) {
  if (percentage >= 100) return 'var(--error)';
  if (percentage >= 70)  return 'var(--warning)';
  return 'var(--success)';
}

function lastTimestamp(historial) {
  if (!historial || historial.length === 0) return null;
  const sorted = [...historial].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return sorted[0].timestamp;
}

function fmtHMS(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toTimeString().slice(0, 8);
}

function maxEtapaIdx(orden) {
  if (!orden.prepacks || orden.prepacks.length === 0) return -1;
  return Math.max(...orden.prepacks.map(pp => ETAPA_IDX[pp.currentEtapa] ?? -1));
}

function isCompleted(orden) {
  if (!orden.progresoEtapa) return false;
  return ETAPAS.every(etapa => {
    const pe = orden.progresoEtapa.find(p => p.etapa === etapa);
    return pe && pe.count === pe.total && pe.total > 0;
  });
}

function StageCell({ orden, etapa, onBahiaClick }) {
  const pe = orden.progresoEtapa?.find(p => p.etapa === etapa);
  const count = pe?.count ?? 0;
  const total = pe?.total ?? orden.totalPrepacks ?? 0;
  const pct   = pe?.percentage ?? 0;
  const bg    = pe ? cellBg(pct) : 'var(--border)';

  const cell = (
    <td
      style={{
        padding: '8px 10px', textAlign: 'center', verticalAlign: 'middle',
        minWidth: 110, borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{
        borderRadius: 6, padding: '6px 4px',
        background: bg, color: '#FFFFFF',
        fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
      }}>
        {count} / {total}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 3 }}>
        {pe ? `${Math.round(pct)}%` : '—'}
      </div>
    </td>
  );

  if (etapa === 'Bahias') {
    return (
      <td
        style={{
          padding: '8px 10px', textAlign: 'center', verticalAlign: 'middle',
          minWidth: 110, borderBottom: '1px solid var(--border)', cursor: 'pointer',
        }}
        onClick={e => { e.stopPropagation(); onBahiaClick(e, orden); }}
      >
        <div style={{
          borderRadius: 6, padding: '6px 4px',
          background: bg, color: '#FFFFFF',
          fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
        }}>
          {count} / {total}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 3 }}>
          {pe ? `${Math.round(pct)}%` : '—'}
        </div>
      </td>
    );
  }

  return cell;
}

function ExpandedRow({ orden, onOpenModal }) {
  const prepacks = orden.prepacks ?? [];
  return (
    <div style={{ background: '#F8F6F3', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
        {orden.orderId} — {prepacks.length} prepacks
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr>
            {['ID', 'Etapa actual', 'Ultimo registro'].map(h => (
              <th key={h} style={{ padding: '4px 8px', textAlign: 'left', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {prepacks.map((pp, i) => (
            <tr
              key={pp.id}
              onDoubleClick={() => onOpenModal(orden.orderId, pp.id)}
              style={{ cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F2EE'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '5px 8px', fontWeight: 700, borderBottom: i < prepacks.length - 1 ? '1px solid #F0EDE8' : 'none' }}>{pp.id}</td>
              <td style={{ padding: '5px 8px', borderBottom: i < prepacks.length - 1 ? '1px solid #F0EDE8' : 'none' }}>{pp.currentEtapa}</td>
              <td style={{ padding: '5px 8px', fontVariantNumeric: 'tabular-nums', borderBottom: i < prepacks.length - 1 ? '1px solid #F0EDE8' : 'none' }}>{fmtHMS(lastTimestamp(pp.historial))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AnalisisFlujo({ ordenes = [] }) {
  const [filtered,    setFiltered]    = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [bahiaPopup,  setBahiaPopup]  = useState(null);
  const [modal,       setModal]       = useState(null);

  const toggleExpand = (orderId) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(orderId) ? next.delete(orderId) : next.add(orderId);
      return next;
    });
  };

  const handleBahiaClick = (e, orden) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (bahiaPopup?.orden?.orderId === orden.orderId) { setBahiaPopup(null); return; }
    setBahiaPopup({ orden, rect });
  };

  const modalOrden   = modal ? ordenes.find(o => o.orderId === modal.orderId) : null;
  const modalPrepack = modalOrden ? modalOrden.prepacks?.find(p => p.id === modal.ppId) : null;

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '16px 24px 10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.4px', margin: 0 }}>Flujo de equipos</h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Monitoreo en tiempo real · conteo y tiempos por etapa</p>
        </div>
      </div>

      <OrdenesFilterBar ordenes={ordenes} onChange={setFiltered} />
      <div style={{ padding: '0 24px 8px', display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', background: '#F8F6F3', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 10px' }}>
          {filtered.length} orden{filtered.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* Table */}
      <div style={{ padding: '0 24px 32px', overflowX: 'auto' }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg-card)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000, background: 'var(--bg-card)' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-secondary)', background: '#F8F6F3', borderBottom: '1px solid var(--border)', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  ORDEN
                </th>
                {ETAPAS.map(e => (
                  <th key={e} style={{ padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-secondary)', background: '#F8F6F3', borderBottom: '1px solid var(--border)', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {e}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(orden => {
                const isOpen = expandedIds.has(orden.orderId);
                const done   = isCompleted(orden);
                return [
                  <tr
                    key={orden.orderId}
                    onClick={() => toggleExpand(orden.orderId)}
                    style={{ cursor: 'pointer', transition: 'background .1s', borderLeft: done ? '3px solid var(--success)' : '3px solid transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '6px 10px', verticalAlign: 'middle', minWidth: 140, borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {orden.orderId}
                        <span style={{ fontSize: 10, color: 'var(--text-secondary)', display: 'inline-block', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .2s', lineHeight: 1 }}>›</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 1 }}>
                        {orden.totalPrepacks} prepacks
                      </div>
                    </td>
                    {ETAPAS.map(etapa => (
                      <StageCell key={etapa} orden={orden} etapa={etapa} onBahiaClick={handleBahiaClick} />
                    ))}
                  </tr>,

                  isOpen && (
                    <tr key={`exp-${orden.orderId}`}>
                      <td colSpan={8} style={{ padding: '0 14px 12px', borderBottom: '1px solid var(--border)' }}>
                        <ExpandedRow orden={orden} onOpenModal={(orderId, ppId) => setModal({ orderId, ppId })} />
                      </td>
                    </tr>
                  ),
                ];
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                    No hay ordenes que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {bahiaPopup && (
        <BahiasPopup
          order={bahiaPopup.orden}
          triggerRect={bahiaPopup.rect}
          onClose={() => setBahiaPopup(null)}
        />
      )}

      {modal && modalOrden && modalPrepack && (
        <PrepPackModal
          orden={modalOrden}
          prepack={modalPrepack}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
