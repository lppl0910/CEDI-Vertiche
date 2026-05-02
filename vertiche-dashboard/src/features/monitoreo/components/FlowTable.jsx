import { useState } from 'react';

const STATUS_COLOR = {
  success: '#6E8B6B',
  warning: '#C9963B',
  error:   '#B65E4A',
};
const STATUS_BG = {
  success: '#EBF2EB',
  warning: '#FBF3E4',
  error:   '#F7EDEB',
};
const STATUS_LABEL = {
  success: 'OK',
  warning: 'Atención',
  error:   'Excepción',
};

const COLUMNAS = [
  { key: 'prepack',   label: 'Preregistro', path: '/dashboard/preregistro' },
  { key: 'qa',        label: 'QA',          path: '/dashboard/qa'          },
  { key: 'registro',  label: 'Registro',    path: '/dashboard/registro'    },
  { key: 'sorter',    label: 'Sorter',      path: '/dashboard/sorter'      },
  { key: 'bahias',    label: 'Bahías',      path: '/dashboard/bahias'      },
  { key: 'auditoria', label: 'Auditoría',   path: '/dashboard/auditoria'   },
  { key: 'envio',     label: 'Envío',       path: '/dashboard/envio'       },
];

function goToPath(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// ─── Aggregation helpers ──────────────────────────────────────────────────────
function avg(arr)    { return Math.round(arr.reduce((s, v) => s + v, 0) / arr.length); }
function sum(arr)    { return arr.reduce((s, v) => s + v, 0); }
function avgPct(arr) { return parseFloat((arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1)); }

function worstStatus(statuses) {
  if (statuses.includes('error'))   return 'error';
  if (statuses.includes('warning')) return 'warning';
  return 'success';
}

function avgTime(strings) {
  // e.g. ["11 min", "14 min", "9 min"] → "11 min"
  const nums = strings.map(s => parseFloat(s));
  const unit = strings[0].replace(/[\d.]+\s*/, '');
  return `${(nums.reduce((s, v) => s + v, 0) / nums.length).toFixed(1).replace('.0', '')} ${unit}`;
}

function avgBahias(allBahiasArrays) {
  // Flatten and average across all bahia arrays
  const flat = allBahiasArrays.flat();
  return flat.reduce((s, b) => s + b.porcentaje, 0) / flat.length;
}

function aggregateRow(data) {
  const e = key => data.map(r => r.etapas[key]);
  return {
    etapas: {
      prepack: {
        status:             worstStatus(e('prepack').map(x => x.status)),
        ppMin:              avg(e('prepack').map(x => x.ppMin)),
        ordenesRecibidas:   sum(e('prepack').map(x => x.ordenesRecibidas)),
        ordenesIncompletas: sum(e('prepack').map(x => x.ordenesIncompletas)),
      },
      qa: {
        status:               worstStatus(e('qa').map(x => x.status)),
        ppMin:                avg(e('qa').map(x => x.ppMin)),
        porcentaje:           avgPct(e('qa').map(x => x.porcentaje)),
        devolucionesPedidos:  sum(e('qa').map(x => x.devolucionesPedidos)),
      },
      registro: {
        status:                  worstStatus(e('registro').map(x => x.status)),
        ppMin:                   avg(e('registro').map(x => x.ppMin)),
        ppCrossDock:             avgPct(e('registro').map(x => x.ppCrossDock)),
        tiempoPromedioRegistro:  avgTime(e('registro').map(x => x.tiempoPromedioRegistro)),
      },
      sorter: {
        status:              worstStatus(e('sorter').map(x => x.status)),
        ppMin:               avg(e('sorter').map(x => x.ppMin)),
        fallas:              sum(e('sorter').map(x => x.fallas)),
        ppBahiaIncorrecta:   sum(e('sorter').map(x => x.ppBahiaIncorrecta)),
        tiempoInactivo:      avgTime(e('sorter').map(x => x.tiempoInactivo)),
      },
      bahias: {
        status:          worstStatus(e('bahias').map(x => x.status)),
        ppMin:           avg(e('bahias').map(x => x.ppMin)),
        bahiasSaturadas: sum(e('bahias').map(x => x.bahiasSaturadas)),
        bahias:          e('bahias').flatMap(x => x.bahias),
        _ocupacion:      parseFloat(avgBahias(e('bahias').map(x => x.bahias)).toFixed(1)),
      },
      auditoria: {
        status:           worstStatus(e('auditoria').map(x => x.status)),
        ppMin:            avg(e('auditoria').map(x => x.ppMin)),
        valor:            avgPct(e('auditoria').map(x => x.valor)),
        fallasRechazadas: sum(e('auditoria').map(x => x.fallasRechazadas)),
      },
      envio: {
        status:                   worstStatus(e('envio').map(x => x.status)),
        ppMin:                    avg(e('envio').map(x => x.ppMin)),
        tiempoPromedioRecorrido:  avgTime(e('envio').map(x => x.tiempoPromedioRecorrido)),
        ordenesConRetraso:        sum(e('envio').map(x => x.ordenesConRetraso)),
      },
    },
  };
}

// Returns { label, value, useStatusColor } for secondary row
function getSecondary(etapas, key) {
  const e = etapas[key];
  switch (key) {
    case 'prepack':   return { label: 'Órdenes recibidas',      value: e.ordenesRecibidas,          useStatusColor: false };
    case 'qa':        return { label: '% Aceptación',           value: `${e.porcentaje}%`,           useStatusColor: true  };
    case 'registro':  return { label: '% pp en cross-dock',     value: `${e.ppCrossDock}%`,          useStatusColor: true  };
    case 'sorter':    return { label: 'pp en bahía incorrecta', value: e.ppBahiaIncorrecta,          useStatusColor: true  };
    case 'bahias':    return { label: '% ocupación',            value: `${e._ocupacion}%`,           useStatusColor: true  };
    case 'auditoria': return { label: '% Aceptación',           value: `${e.valor}%`,               useStatusColor: true  };
    case 'envio':     return { label: 'T. promedio recorrido',  value: e.tiempoPromedioRecorrido,    useStatusColor: false };
    default: return null;
  }
}

// Returns { label, value } for tertiary row
function getTertiary(etapas, key) {
  const e = etapas[key];
  switch (key) {
    case 'prepack':   return { label: 'Órdenes incompletas',  value: e.ordenesIncompletas     };
    case 'qa':        return { label: 'Dev. de pedidos',      value: e.devolucionesPedidos    };
    case 'registro':  return { label: 'T. prom. registro',    value: e.tiempoPromedioRegistro };
    case 'sorter':    return { label: 'Tiempo inactivo',      value: e.tiempoInactivo         };
    case 'bahias':    return { label: 'Bahías saturadas',     value: e.bahiasSaturadas        };
    case 'auditoria': return { label: 'Fallas rechazadas',    value: e.fallasRechazadas       };
    case 'envio':     return { label: 'Órdenes con retraso',  value: e.ordenesConRetraso      };
    default: return null;
  }
}

// ─── pp/min circle ────────────────────────────────────────────────────────────
function PpMinCircle({ valor, status }) {
  const [hovered, setHovered] = useState(false);
  const color = STATUS_COLOR[status] || '#6B6B6B';
  const bg    = STATUS_BG[status]    || '#F5F5F5';

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%',
          transform: 'translateX(-50%)', background: '#1F1F1F', color: '#FFFFFF',
          borderRadius: 6, padding: '5px 10px', fontSize: 11, whiteSpace: 'nowrap',
          pointerEvents: 'none', zIndex: 10, fontFamily: 'var(--font)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        }}>
          {valor} pp/min · {STATUS_LABEL[status]}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0, borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent', borderTop: '4px solid #1F1F1F',
          }} />
        </div>
      )}
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        border: `3px solid ${color}`,
        background: hovered ? bg : '#FFFFFF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'help', transition: 'background 0.15s, transform 0.15s',
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: hovered ? color : '#1F1F1F', fontFamily: 'var(--font)' }}>
          {valor}
        </span>
      </div>
      <span style={{ fontSize: 10, color: '#9B9590', fontFamily: 'var(--font)', letterSpacing: '0.04em' }}>
        pp/min
      </span>
    </div>
  );
}

// ─── Bahías popup ─────────────────────────────────────────────────────────────
function BahiasPopup({ bahias, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#FFFFFF', borderRadius: 12, padding: 28,
        minWidth: 320, maxWidth: 400, width: '90%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.16)', fontFamily: 'var(--font)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1F1F1F' }}>Bahías — Ocupación</div>
            <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>Todas las bahías activas</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6B6B6B', lineHeight: 1, padding: 2 }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {bahias.map(bahia => (
            <div key={bahia.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#1F1F1F' }}>{bahia.id}</span>
                <span style={{ fontSize: 12, color: STATUS_COLOR[bahia.status], fontWeight: 600 }}>{bahia.porcentaje}%</span>
              </div>
              <div style={{ height: 8, background: '#F0EDE9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${bahia.porcentaje}%`,
                  background: STATUS_COLOR[bahia.status], borderRadius: 4,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
export default function FlowTable({ data }) {
  const [bahiasOpen, setBahiasOpen] = useState(false);
  const [hoveredCol, setHoveredCol] = useState(null);
  const { etapas } = aggregateRow(data);

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font)' }}>
          <thead>
            <tr style={{ background: '#F8F6F3' }}>
              {COLUMNAS.map(c => (
                <th key={c.key} style={thStyle}>
                  <button
                    onClick={() => goToPath(c.path)}
                    onMouseEnter={() => setHoveredCol(c.key)}
                    onMouseLeave={() => setHoveredCol(null)}
                    style={{
                      ...thLinkStyle,
                      color: hoveredCol === c.key ? '#1F1F1F' : 'inherit',
                      borderBottomColor: hoveredCol === c.key ? '#A48F7A' : 'transparent',
                    }}
                  >
                    {c.label}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Row 1: pp/min circles */}
            <tr style={{ background: '#FFFFFF' }}>
              {COLUMNAS.map(c => (
                <td
                  key={c.key}
                  style={{ ...tdInner, textAlign: 'center', cursor: c.key === 'bahias' ? 'pointer' : 'default' }}
                  onClick={c.key === 'bahias' ? () => setBahiasOpen(true) : undefined}
                >
                  <PpMinCircle valor={etapas[c.key].ppMin} status={etapas[c.key].status} />
                </td>
              ))}
            </tr>

            {/* Row 2: secondary KPI */}
            <tr style={{ background: '#FAFAF8' }}>
              {COLUMNAS.map(c => {
                const sec = getSecondary(etapas, c.key);
                const color = sec.useStatusColor ? STATUS_COLOR[etapas[c.key].status] : '#1F1F1F';
                return (
                  <td key={c.key} style={{ ...tdInner, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#9B9590', marginBottom: 3, fontFamily: 'var(--font)' }}>{sec.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color, fontFamily: 'var(--font)' }}>{sec.value}</div>
                  </td>
                );
              })}
            </tr>

            {/* Row 3: tertiary KPI */}
            <tr style={{ background: '#FFFFFF' }}>
              {COLUMNAS.map(c => {
                const ter = getTertiary(etapas, c.key);
                return (
                  <td key={c.key} style={{ ...tdInner, borderBottom: 'none', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#9B9590', marginBottom: 3, fontFamily: 'var(--font)' }}>{ter.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: '#6B6B6B', fontFamily: 'var(--font)' }}>{ter.value}</div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {bahiasOpen && (
        <BahiasPopup bahias={etapas.bahias.bahias} onClose={() => setBahiasOpen(false)} />
      )}
    </>
  );
}

const thStyle = {
  padding: '12px 16px',
  textAlign: 'center',
  fontSize: 12,
  color: '#6B6B6B',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 500,
  borderBottom: '2px solid #E7E2DC',
  whiteSpace: 'nowrap',
};

const thLinkStyle = {
  background: 'none',
  border: 'none',
  borderBottom: '1px solid transparent',
  padding: 0,
  cursor: 'pointer',
  color: 'inherit',
  font: 'inherit',
  letterSpacing: 'inherit',
  textTransform: 'inherit',
  transition: 'color 0.15s, border-color 0.15s',
};

const tdInner = {
  padding: '14px 16px',
  borderBottom: '1px solid #F0EDE9',
  verticalAlign: 'middle',
};
