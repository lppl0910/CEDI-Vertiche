const ETAPAS = ['Preregistro', 'QA', 'Registro', 'Sorter', 'Bahias', 'Auditoria', 'Envio'];
const ETAPA_INIT = { Preregistro: 'P', QA: 'Q', Registro: 'R', Sorter: 'S', Bahias: 'B', Auditoria: 'A', Envio: 'E' };

function lastTimestamp(historial) {
  if (!historial || historial.length === 0) return null;
  const sorted = [...historial].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return sorted[0].timestamp;
}

function fmtHMS(ts) {
  if (!ts) return '—';
  return new Date(ts).toTimeString().slice(0, 8);
}

function nodeColor(etapa, prepacks) {
  const active    = prepacks.some(pp => pp.currentEtapa === etapa);
  const inHistory = prepacks.some(pp => pp.historial?.some(e => e.etapa === etapa));
  if (active)    return 'var(--warning)';
  if (inHistory) return 'var(--success)';
  return 'var(--border)';
}

export default function PrepPackModal({ orden, prepack, onClose }) {
  if (!orden) return null;

  const prepacks = orden.prepacks ?? [];

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(17,17,17,.38)', backdropFilter: 'blur(2px)',
        zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        background: '#FFFFFF', borderRadius: 14, boxShadow: '0 8px 40px rgba(17,17,17,.2)',
        width: 'min(600px, 94vw)', maxHeight: '88vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{orden.orderId}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              {orden.totalPrepacks} prepacks en total
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Timeline */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-secondary)', marginBottom: 10 }}>
              Progreso por etapa
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {ETAPAS.map((etapa, i) => {
                const color = nodeColor(etapa, prepacks);
                return (
                  <div key={etapa} style={{ display: 'flex', alignItems: 'center', flex: i < ETAPAS.length - 1 ? 1 : 'none' }}>
                    <div title={etapa} style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: color, color: '#FFFFFF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>
                      {ETAPA_INIT[etapa]}
                    </div>
                    {i < ETAPAS.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: 'var(--border)', minWidth: 8 }} />
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {ETAPAS.map(e => (
                <span key={e} style={{ fontSize: 8, color: 'var(--text-secondary)', textAlign: 'center', flex: 1 }}>{e}</span>
              ))}
            </div>
          </div>

          {/* Prepack list */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-secondary)', marginBottom: 8 }}>
              Prepacks
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
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
                {prepacks.map((pp, i) => {
                  const isSelected = prepack && pp.id === prepack.id;
                  return (
                    <tr
                      key={pp.id}
                      style={{ background: isSelected ? '#F8F6F3' : 'transparent' }}
                    >
                      <td style={{ padding: '6px 8px', fontWeight: isSelected ? 700 : 500, borderBottom: i < prepacks.length - 1 ? '1px solid #F5F2EE' : 'none' }}>{pp.id}</td>
                      <td style={{ padding: '6px 8px', borderBottom: i < prepacks.length - 1 ? '1px solid #F5F2EE' : 'none' }}>{pp.currentEtapa}</td>
                      <td style={{ padding: '6px 8px', fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)', borderBottom: i < prepacks.length - 1 ? '1px solid #F5F2EE' : 'none' }}>{fmtHMS(lastTimestamp(pp.historial))}</td>
                    </tr>
                  );
                })}
                {prepacks.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ padding: '16px 8px', color: 'var(--text-secondary)', textAlign: 'center' }}>Sin prepacks</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
