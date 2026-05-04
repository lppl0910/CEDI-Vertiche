import { useState } from 'react';

const ETAPAS = ['Preregistro', 'QA', 'Registro', 'Sorter', 'Bahias', 'Auditoria', 'Envio'];

function isCompleted(orden) {
  return ETAPAS.every(etapa => {
    const pe = orden.progresoEtapa?.find(p => p.etapa === etapa);
    return pe && pe.count === pe.total && pe.total > 0;
  });
}

function fmtDateTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' }) + ' ' + d.toTimeString().slice(0, 8);
}

function HistDetail({ orden }) {
  const prepacks = orden.prepacks ?? [];
  return (
    <div style={{ padding: '12px 16px', background: '#FAFAF9' }}>
      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.4px' }}>
        Historial de prepacks
      </div>
      {prepacks.map(pp => {
        const eventos = [...(pp.historial ?? [])].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        return (
          <div key={pp.id} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4 }}>{pp.id}</div>
            {eventos.length === 0 ? (
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Sin eventos registrados</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr>
                    {['Etapa', 'Timestamp', 'Reader ID'].map(h => (
                      <th key={h} style={{ padding: '3px 8px', textAlign: 'left', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eventos.map((ev, i) => (
                    <tr key={i}>
                      <td style={{ padding: '4px 8px', borderBottom: i < eventos.length - 1 ? '1px solid #F5F2EE' : 'none' }}>{ev.etapa}</td>
                      <td style={{ padding: '4px 8px', fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)', borderBottom: i < eventos.length - 1 ? '1px solid #F5F2EE' : 'none' }}>{fmtDateTime(ev.timestamp)}</td>
                      <td style={{ padding: '4px 8px', color: 'var(--text-secondary)', borderBottom: i < eventos.length - 1 ? '1px solid #F5F2EE' : 'none' }}>{ev.readerId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Historial({ ordenes = [] }) {
  const [search,      setSearch]      = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set());

  const completed = ordenes.filter(isCompleted);

  const filtered = search
    ? completed.filter(o =>
        o.orderId.toLowerCase().includes(search.toLowerCase()) ||
        o.prepacks?.some(pp => pp.id.toLowerCase().includes(search.toLowerCase()))
      )
    : completed;

  const toggleExpand = id => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const thStyle = { padding: '8px 12px', fontSize: 9, fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-secondary)', background: '#F8F6F3', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', textAlign: 'left' };
  const tdStyle = { padding: '8px 12px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' };

  return (
    <div>
      <div style={{ padding: '16px 24px 10px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.4px', margin: 0 }}>Historial de Ordenes</h1>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Ordenes con las 7 etapas completadas</p>
      </div>

      <div style={{ padding: '0 24px 32px' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por orden o prepack..."
            style={{ height: 32, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font)', outline: 'none', background: '#FFFFFF', width: 250 }}
            onFocus={e => e.target.style.borderColor = '#111111'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', background: '#F8F6F3', border: '1px solid var(--border)', borderRadius: 20, padding: '2px 10px' }}>
            {filtered.length} completada{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg-card)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 560 }}>
              <thead>
                <tr>
                  {['Orden', 'Total prepacks', 'Estado'].map(h => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>
                      {completed.length === 0 ? 'No hay ordenes completadas aun.' : 'Sin resultados para la busqueda.'}
                    </td>
                  </tr>
                )}
                {filtered.map(orden => {
                  const isOpen = expandedIds.has(orden.orderId);
                  return [
                    <tr
                      key={orden.orderId}
                      onClick={() => toggleExpand(orden.orderId)}
                      style={{ cursor: 'pointer', transition: 'background .1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                          {orden.orderId}
                          <span style={{ fontSize: 10, color: 'var(--text-secondary)', display: 'inline-block', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .2s', lineHeight: 1 }}>›</span>
                        </div>
                      </td>
                      <td style={tdStyle}>{orden.totalPrepacks} prepacks</td>
                      <td style={tdStyle}>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'rgba(110,139,107,.12)', color: 'var(--success)' }}>
                          Completada
                        </span>
                      </td>
                    </tr>,
                    isOpen && (
                      <tr key={`hexp-${orden.orderId}`}>
                        <td colSpan={3} style={{ padding: 0, borderBottom: '1px solid var(--border)' }}>
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
