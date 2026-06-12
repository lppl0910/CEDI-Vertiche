import { useState } from 'react';
import '../monitoreo.css';

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
      className="mon-pp-circle"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div className="mon-pp-tooltip">
          {valor} pp/min · {STATUS_LABEL[status]}
          <div className="mon-pp-tooltip__arrow" />
        </div>
      )}
      <div
        className="mon-pp-circle__ring"
        style={{
          border: `3px solid ${color}`,
          background: hovered ? bg : '#FFFFFF',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        <span className="mon-pp-circle__value" style={{ color: hovered ? color : '#1F1F1F' }}>
          {valor}
        </span>
      </div>
      <span className="mon-pp-circle__label">pp/min</span>
    </div>
  );
}

// ─── Bahías popup ─────────────────────────────────────────────────────────────
function BahiasPopup({ bahias, onClose }) {
  return (
    <div className="mon-overlay" onClick={onClose}>
      <div className="mon-popup" onClick={e => e.stopPropagation()}>
        <div className="mon-popup__header">
          <div>
            <div className="mon-popup__title">Bahías — Ocupación</div>
            <div className="mon-popup__subtitle">Todas las bahías activas</div>
          </div>
          <button className="mon-popup__close" onClick={onClose}>×</button>
        </div>
        <div className="mon-popup__list">
          {bahias.map(bahia => (
            <div key={bahia.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#1F1F1F' }}>{bahia.id}</span>
                <span style={{ fontSize: 12, color: STATUS_COLOR[bahia.status], fontWeight: 600 }}>{bahia.porcentaje}%</span>
              </div>
              <div className="mon-progress--track">
                <div className="mon-progress__fill" style={{
                  width: `${bahia.porcentaje}%`,
                  background: STATUS_COLOR[bahia.status],
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
      <div className="table-scroll">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font)' }}>
          <thead>
            <tr style={{ background: '#F8F6F3' }}>
              {COLUMNAS.map(c => (
                <th key={c.key} className="mon-flow-th">
                  <button
                    onClick={() => goToPath(c.path)}
                    onMouseEnter={() => setHoveredCol(c.key)}
                    onMouseLeave={() => setHoveredCol(null)}
                    className="mon-flow-th-btn"
                    style={{
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
                  className="mon-flow-td"
                  style={{ textAlign: 'center', cursor: c.key === 'bahias' ? 'pointer' : 'default' }}
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
                  <td key={c.key} className="mon-flow-td" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#9B9590', marginBottom: 3 }}>{sec.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color }}>{sec.value}</div>
                  </td>
                );
              })}
            </tr>

            {/* Row 3: tertiary KPI */}
            <tr style={{ background: '#FFFFFF' }}>
              {COLUMNAS.map(c => {
                const ter = getTertiary(etapas, c.key);
                return (
                  <td key={c.key} className="mon-flow-td mon-td--no-border" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: '#9B9590', marginBottom: 3 }}>{ter.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: '#6B6B6B' }}>{ter.value}</div>
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

