import { useState, useMemo } from 'react';
import { timeAgo } from '../data/sicatMockData';

const STATUS_LABEL = { open: 'Abierta', escalated: 'Escalada', resolved: 'Resuelta' };
const STATUS_STYLE = {
  open:      { background: 'rgba(182,94,74,.12)',  color: '#B65E4A' },
  escalated: { background: 'rgba(201,150,59,.15)', color: '#C9963B' },
  resolved:  { background: 'rgba(110,139,107,.12)',color: '#6E8B6B' },
};

// ── Helpers ────────────────────────────────────────────────────────────────
function toLocalDateStr(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function escapeCSV(val) {
  const s = String(val ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function downloadCSV(rows, filename) {
  const header = ['INC ID', 'Prepack ID', 'Orden ID', 'Etapa', 'Descripcion', 'Estado', 'Detectada', 'Resuelta'];
  const lines = [
    header.join(','),
    ...rows.map(inc => [
      inc.id,
      inc.ppId,
      inc.orderId,
      inc.stage?.toUpperCase(),
      inc.desc,
      STATUS_LABEL[inc.status] ?? inc.status,
      inc.ts     ? new Date(inc.ts).toLocaleString('es-MX')         : '',
      inc.resolvedAt ? new Date(inc.resolvedAt).toLocaleString('es-MX') : '',
    ].map(escapeCSV).join(',')),
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Export modal ───────────────────────────────────────────────────────────
function ExportModal({ incidencias, onClose }) {
  const today = toLocalDateStr(Date.now());

  const [desde,     setDesde]     = useState('');
  const [hasta,     setHasta]     = useState(today);
  const [statusFlt, setStatusFlt] = useState('');   // '' | 'open' | 'escalated' | 'resolved'
  const [etapaFlt,  setEtapaFlt]  = useState('');   // '' | stage key

  // Unique etapas available
  const etapasDisp = useMemo(
    () => [...new Set(incidencias.map(i => i.stage).filter(Boolean))].sort(),
    [incidencias],
  );

  const preview = useMemo(() => {
    return incidencias.filter(inc => {
      if (statusFlt && inc.status !== statusFlt) return false;
      if (etapaFlt  && inc.stage  !== etapaFlt)  return false;
      if (desde || hasta) {
        const d = toLocalDateStr(inc.ts);
        if (desde && d < desde) return false;
        if (hasta && d > hasta) return false;
      }
      return true;
    });
  }, [incidencias, desde, hasta, statusFlt, etapaFlt]);

  const handleExport = () => {
    if (preview.length === 0) return;
    const ts   = new Date().toISOString().slice(0, 10);
    downloadCSV(preview, `incidencias_${ts}.csv`);
    onClose();
  };

  // ── Styles helpers ─────────────────────────────────────────────────────
  const labelSt = { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#6B6B6B', marginBottom: 5, display: 'block' };
  const inputSt = { width: '100%', padding: '7px 10px', border: '1px solid #E7E2DC', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font)', outline: 'none', background: '#F8F6F3', boxSizing: 'border-box', color: '#1F1F1F' };
  const selectSt = { ...inputSt, cursor: 'pointer' };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(17,17,17,.38)', backdropFilter: 'blur(2px)', zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div style={{ background: '#FFFFFF', borderRadius: 14, boxShadow: '0 8px 40px rgba(17,17,17,.2)', width: 'min(440px, 94vw)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #E7E2DC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Exportar incidencias</div>
            <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>Filtra y descarga el reporte en CSV</div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E7E2DC', background: 'transparent', cursor: 'pointer', fontSize: 14, color: '#6B6B6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}
          >✕</button>
        </div>

        {/* Filters */}
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Rango de fechas */}
          <div>
            <span style={labelSt}>Rango de fechas</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: '#6B6B6B', marginBottom: 3 }}>Desde</div>
                <input
                  type="date"
                  value={desde}
                  max={hasta || today}
                  onChange={e => setDesde(e.target.value)}
                  style={inputSt}
                  onFocus={e => e.target.style.borderColor = '#111111'}
                  onBlur={e => e.target.style.borderColor = '#E7E2DC'}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: '#6B6B6B', marginBottom: 3 }}>Hasta</div>
                <input
                  type="date"
                  value={hasta}
                  min={desde}
                  max={today}
                  onChange={e => setHasta(e.target.value)}
                  style={inputSt}
                  onFocus={e => e.target.style.borderColor = '#111111'}
                  onBlur={e => e.target.style.borderColor = '#E7E2DC'}
                />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div>
            <span style={labelSt}>Estado</span>
            <select value={statusFlt} onChange={e => setStatusFlt(e.target.value)} style={selectSt}>
              <option value="">Todos los estados</option>
              <option value="open">Abiertas</option>
              <option value="resolved">Resueltas</option>
            </select>
          </div>

          {/* Etapa */}
          <div>
            <span style={labelSt}>Etapa</span>
            <select value={etapaFlt} onChange={e => setEtapaFlt(e.target.value)} style={selectSt}>
              <option value="">Todas las etapas</option>
              {etapasDisp.map(e => (
                <option key={e} value={e}>{e.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Preview count */}
          <div style={{ background: '#F8F6F3', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: preview.length === 0 ? '#B65E4A' : '#111111' }}>{preview.length}</span>
            <span style={{ fontSize: 12, color: '#6B6B6B' }}>
              {preview.length === 1 ? 'incidencia coincide' : 'incidencias coinciden'} con los filtros
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: '0 18px 18px', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', border: '1px solid #E7E2DC', background: 'transparent', color: '#6B6B6B', transition: 'background .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F8F6F3'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={preview.length === 0}
            style={{ padding: '8px 18px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font)', cursor: preview.length === 0 ? 'not-allowed' : 'pointer', border: 'none', background: preview.length === 0 ? '#D0CBC4' : '#111111', color: '#FFFFFF', transition: 'background .15s' }}
            onMouseEnter={e => { if (preview.length > 0) e.currentTarget.style.background = '#333333'; }}
            onMouseLeave={e => { if (preview.length > 0) e.currentTarget.style.background = '#111111'; }}
          >
            Exportar CSV ({preview.length})
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function Incidencias({ incidencias }) {
  const [filter,      setFilter]      = useState('');
  const [showExport,  setShowExport]  = useState(false);

  const open     = incidencias.filter(i => i.status === 'open').length;
  const resolved = incidencias.filter(i => i.status === 'resolved').length;

  const filtered = filter ? incidencias.filter(i => i.status === filter) : [...incidencias];

  const filterBtns = [
    { val: '',         label: 'Todas' },
    { val: 'open',     label: 'Abiertas' },
    { val: 'resolved', label: 'Resueltas' },
  ];

  const thStyle = { padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: '#6B6B6B', background: '#F8F6F3', borderBottom: '1px solid #E7E2DC', whiteSpace: 'nowrap', textAlign: 'left' };
  const tdStyle = { padding: '9px 12px', borderBottom: '1px solid #E7E2DC', verticalAlign: 'middle' };

  return (
    <div>
      <div style={{ padding: '16px 24px 10px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.4px', margin: 0 }}>Gestión de Incidencias</h1>
          <p style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>Registro, escalación y resolución de fallas detectadas</p>
        </div>
        <button
          onClick={() => setShowExport(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer', border: '1px solid #E7E2DC', background: '#F8F6F3', color: '#1F1F1F', transition: 'background .15s', whiteSpace: 'nowrap', alignSelf: 'center' }}
          onMouseEnter={e => e.currentTarget.style.background = '#EDE8E2'}
          onMouseLeave={e => e.currentTarget.style.background = '#F8F6F3'}
        >
          ⬇ Exportar incidencias
        </button>
      </div>

      <div style={{ padding: '0 24px 32px' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          {[
            { label: 'Abiertas',  val: open,     color: '#B65E4A' },
            { label: 'Resueltas', val: resolved,  color: '#6E8B6B' },
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
                  {['INC ID','ORDEN','ETAPA','DESCRIPCIÓN','DETECTADA','ESTADO'].map(h => (
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
                    style={{ transition: 'background .1s' }}
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

      {showExport && (
        <ExportModal
          incidencias={incidencias}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
