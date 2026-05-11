import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  ReferenceLine,
} from 'recharts';
import {
  bahiasGeneral,
  equipos,
  ordenesIncompletasPorProveedor,
  tendenciaOrdenesIncompletas,
  proveedoresEstrella,
  erroresPPPorProveedor,
  prepacksRetornadosQA,
  rechazosPorTipoPrenda,
  motivosRechazoQA,
  distribucionAlmacen,
  rankingEquiposRegistro,
  backlogPPs,
  tendenciaTiemposRegistro,
  paquetesPorBahia,
  paquetesIncorrectos,
  tiempoSorterTendencia,
  tendenciaOcupacionBahias,
  capacidadBahias,
  cajasIncorrectas,
  distribucionTiemposAuditoria,
  backlogOrdenes,
  estatusOrdenes,
} from '../data/mockData';
import KPICard from '../../../shared/components/ui/KPICard';

const STATUS_COLOR = {
  success: '#6E8B6B',
  warning: '#C9963B',
  error: '#B65E4A',
};

const STATUS_BG = {
  success: '#EEF2ED',
  warning: '#FBF4E6',
  error: '#F9EDEB',
};

const STATUS_LABEL = { success: 'OK', warning: 'Atención', error: 'Error' };

const stageRoutes = [
  { id: 'preregistro', label: 'Preregistro', path: '/dashboard/preregistro' },
  { id: 'qa', label: 'QA', path: '/dashboard/qa' },
  { id: 'registro', label: 'Registro', path: '/dashboard/registro' },
  { id: 'sorter', label: 'Sorter', path: '/dashboard/sorter' },
  { id: 'bahias', label: 'Bahías', path: '/dashboard/bahias' },
  { id: 'auditoria', label: 'Auditoría', path: '/dashboard/auditoria' },
  { id: 'envio', label: 'Envío', path: '/dashboard/envio' },
];

const teamPerformanceStages = ['preregistro', 'qa', 'registro'];

const axisStyle = { fontSize: 12, fill: '#6B6B6B', fontFamily: 'Inter' };
const gridStyle = { stroke: '#E7E2DC', strokeDasharray: '3 3' };

function getCurrentStageId() {
  if (typeof window === 'undefined') return 'preregistro';
  const current = stageRoutes.find(stage => window.location.pathname === stage.path);
  return current?.id || 'preregistro';
}

function goToPath(path) {
  if (typeof window === 'undefined') return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function overallStatus(statuses) {
  if (statuses.includes('error')) return 'error';
  if (statuses.includes('warning')) return 'warning';
  return 'success';
}

function formatNumber(value, decimals = 0) {
  return Number(value).toLocaleString('es-MX', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}

function StatusDot({ status }) {
  return (
    <span style={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: STATUS_COLOR[status],
      display: 'inline-block',
      flexShrink: 0,
    }} />
  );
}

function StageTabs({ activeStage, onStageChange }) {
  return (
    <div style={{
      display: 'flex',
      gap: 6,
      overflowX: 'auto',
      paddingBottom: 2,
    }}>
      {stageRoutes.map(stage => {
        const isActive = activeStage === stage.id;
        return (
          <button
            key={stage.id}
            onClick={() => onStageChange(stage)}
            style={{
              border: '1px solid #E7E2DC',
              background: isActive ? '#111111' : '#FFFFFF',
              color: isActive ? '#FFFFFF' : '#6B6B6B',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              fontFamily: 'var(--font)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {stage.label}
          </button>
        );
      })}
    </div>
  );
}

function SectionHeader({ title, summary, status }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
      <div>
        <div style={{
          fontSize: 11,
          color: '#6B6B6B',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 600,
          marginBottom: 6,
        }}>
          Dashboard operativo
        </div>
        <h1 style={{ fontSize: 28, lineHeight: 1.15, fontWeight: 600, color: '#1F1F1F', margin: 0 }}>
          {title}
        </h1>
        <p style={{ fontSize: 14, color: '#6B6B6B', marginTop: 6, maxWidth: 680 }}>
          {summary}
        </p>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: STATUS_BG[status],
        color: STATUS_COLOR[status],
        borderRadius: 20,
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}>
        {/* <StatusDot status={status} />
        {STATUS_LABEL[status]} */}
      </div>
    </div>
  );
}

function KpiStrip({ primaryKpi, secondaryKpis }) {
  return (
    <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <KPICard
          label={primaryKpi.label}
          value={primaryKpi.value}
          delta={primaryKpi.delta}
          unit={primaryKpi.unit}
          description={primaryKpi.description}
        />
      </div>
      {secondaryKpis.map(item => (
        <div key={item.label} style={{ flex: 1, minWidth: 0 }}>
          <KPICard
            label={item.label}
            value={item.value}
            delta={item.delta}
            unit={item.unit}
            description={item.description}
          />
        </div>
      ))}
    </div>
  );
}

function ChartCard({ title, children, footer }) {
  return (
    <div className="card" style={{ minHeight: 320 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1F1F1F', margin: 0 }}>{title}</h2>
        {footer && <span style={{ fontSize: 12, color: '#6B6B6B' }}>{footer}</span>}
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E7E2DC',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12,
      fontFamily: 'Inter',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    }}>
      <div style={{ color: '#6B6B6B', marginBottom: 4 }}>{label}</div>
      {payload.map(item => (
        <div key={item.dataKey} style={{ color: item.color || '#1F1F1F', fontWeight: 600 }}>
          {item.name}: {item.value}
        </div>
      ))}
    </div>
  );
}

function VerticalBarChart({ data, xKey, valueKey, color = '#111111' }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid {...gridStyle} />
        <XAxis dataKey={xKey} tick={axisStyle} />
        <YAxis tick={axisStyle} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={valueKey} fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function HorizontalBarChart({ data, xKey, valueKey, color = '#111111' }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 4 }}>
        <CartesianGrid {...gridStyle} horizontal={false} />
        <XAxis type="number" tick={axisStyle} />
        <YAxis dataKey={xKey} type="category" tick={axisStyle} width={88} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={valueKey} fill={color} radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function LineMetricChart({ data, lines }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid {...gridStyle} />
        <XAxis dataKey="hora" tick={axisStyle} />
        <YAxis tick={axisStyle} />
        <Tooltip content={<CustomTooltip />} />
        {lines.map(line => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function ProgressBar({ value, status = 'success' }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ height: 6, borderRadius: 6, background: '#F0EDE8', overflow: 'hidden' }}>
        <div style={{
          width: `${Math.max(0, Math.min(value, 100))}%`,
          height: '100%',
          background: STATUS_COLOR[status],
          borderRadius: 6,
        }} />
      </div>
    </div>
  );
}

function TeamPerformance({ stageId }) {
  if (!teamPerformanceStages.includes(stageId)) return null;

  const rows = equipos.map(equipo => {
    if (stageId === 'preregistro') {
      const receivedPercent = (equipo.detalleOrden.totalPrepacks / equipo.detalleOrden.prepacksEsperados) * 100;
      return {
        equipo: equipo.nombre,
        orden: equipo.orden,
        value: formatNumber(receivedPercent, 1),
        unit: '% recibido',
        detail: `${equipo.detalleOrden.totalPrepacks} de ${equipo.detalleOrden.prepacksEsperados} prepacks`,
        status: equipo.etapas.prepack.status,
        progress: receivedPercent,
      };
    }

    if (stageId === 'qa') {
      return {
        equipo: equipo.nombre,
        orden: equipo.orden,
        value: equipo.etapas.qa.porcentaje,
        unit: '% aceptación',
        detail: `${formatNumber(100 - equipo.etapas.qa.porcentaje, 1)}% rechazo`,
        status: equipo.etapas.qa.status,
        progress: equipo.etapas.qa.porcentaje,
      };
    }

    return {
      equipo: equipo.nombre,
      orden: equipo.orden,
      value: equipo.etapas.registro.valor,
      unit: equipo.etapas.registro.unidad,
      detail: 'Rendimiento por equipo',
      status: equipo.etapas.registro.status,
      progress: Math.min(100, Math.round((equipo.etapas.registro.valor / 260) * 100)),
    };
  });

  return (
    <ChartCard title="Rendimiento por equipos" footer="Solo preregistro, QA y registro">
      <div style={{ display: 'grid', gap: 12 }}>
        {rows.map(row => (
          <div
            key={row.equipo}
            style={{
              border: '1px solid #E7E2DC',
              borderRadius: 8,
              padding: '14px 16px',
              background: '#FAFAF8',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1F1F1F' }}>{row.equipo}</div>
                <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>{row.orden} · {row.detail}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: STATUS_COLOR[row.status] }}>{row.value}</div>
                <div style={{ fontSize: 11, color: '#6B6B6B' }}>{row.unit}</div>
              </div>
            </div>
            <ProgressBar value={row.progress} status={row.status} />
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

function OrdersTable({ orders }) {
  return (
    <ChartCard title="Ordenes recibidas" footer="Llegadas recientes">
      <div style={{ display: 'grid', gap: 10 }}>
        {orders.map(order => (
          <div
            key={order.orden}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 12,
              alignItems: 'center',
              padding: '12px 14px',
              border: '1px solid #E7E2DC',
              borderRadius: 8,
              background: '#FAFAF8',
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1F1F1F' }}>{order.orden}</div>
              <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>
                {order.hora} · {order.prepacks} prepacks · {order.items} SKUs
              </div>
            </div>
            <span style={{
              borderRadius: 20,
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 700,
              color: STATUS_COLOR[order.status],
              background: STATUS_BG[order.status],
            }}>
              {order.completa ? 'Completa' : 'Incompleta'}
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

function BayGrid({ bahias }) {
  return (
    <ChartCard title="Ocupacion por carril" footer="10 carriles">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))', gap: 12 }}>
        {bahias.map(bahia => (
          <div
            key={bahia.id}
            style={{
              border: '1px solid #E7E2DC',
              borderRadius: 8,
              background: '#FAFAF8',
              padding: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1F1F1F' }}>{bahia.id}</span>
              <StatusDot status={bahia.status} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: STATUS_COLOR[bahia.status], marginBottom: 8 }}>
              {bahia.porcentaje}%
            </div>
            <ProgressBar value={bahia.porcentaje} status={bahia.status} />
          </div>
        ))}
      </div>
    </ChartCard>
  );
}


function calcularPareto(items, valueKey) {
  const total = items.reduce((sum, item) => sum + item[valueKey], 0);
  let acumulado = 0;
  return [...items]
    .sort((a, b) => b[valueKey] - a[valueKey])
    .map(item => {
      acumulado += item[valueKey];
      const pctAcum = (acumulado / total) * 100;
      const banda = pctAcum <= 80 ? 'error' : pctAcum <= 95 ? 'warning' : 'success';
      return { ...item, pctAcum: Number(pctAcum.toFixed(1)), banda };
    });
}

function getBacklogRowBg(minutos, umbral1, umbral2) {
  if (minutos >= umbral2) return STATUS_BG.error;
  if (minutos >= umbral1) return STATUS_BG.warning;
  return 'transparent';
}

function buildStageData() {
  // shared table styles
  const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'Inter' };
  const thStyle = {
    textAlign: 'left', padding: '8px 10px', fontSize: 11, fontWeight: 600,
    color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.06em',
    borderBottom: '1px solid #E7E2DC', background: '#FAFAF8',
  };
  const tdStyle = {
    padding: '9px 10px', borderBottom: '1px solid #F0EDE8',
    color: '#1F1F1F', verticalAlign: 'middle',
  };
  const PIE_COLORS = ['#6E8B6B', '#A48F7A', '#C9963B', '#B65E4A', '#8B7355'];
  const CATEGORIA_COLOR = { estrella: 'success', bueno: 'warning', riesgo: 'error' };

  // ---- PREREGISTRO ----
  const totalOrdenesRecibidas = 489;
  const ordenesInc = ordenesIncompletasPorProveedor.reduce((s, d) => s + d.incompletas, 0);
  const tasaCompletas = formatNumber(((totalOrdenesRecibidas - ordenesInc) / totalOrdenesRecibidas) * 100, 1);
  const provConIncidencias = ordenesIncompletasPorProveedor.filter(d => d.incompletas > 0).length;
  const paretoPreregistro = calcularPareto(ordenesIncompletasPorProveedor, 'incompletas');

  // ---- QA ----
  const totalPrepacks = 1640;
  const totalErroresQA = erroresPPPorProveedor.reduce((s, d) => s + d.errores, 0);
  const tasaAceptacionQA = formatNumber(((totalPrepacks - totalErroresQA) / totalPrepacks) * 100, 1);
  const totalRetornados = prepacksRetornadosQA.length;
  const proveedoresConRechazo = erroresPPPorProveedor.filter(d => d.errores >= 20).length;
  const motivoPrincipal = motivosRechazoQA.reduce((mx, d) => d.cantidad > mx.cantidad ? d : mx).motivo;
  const paretoQA = calcularPareto(erroresPPPorProveedor, 'errores');

  // ---- REGISTRO ----
  const prepsCrossDock = distribucionAlmacen.find(d => d.almacen === 'Cross-dock').prepacks;
  const tiempoPromedioReg = formatNumber(average(tendenciaTiemposRegistro.map(d => d.tiempoPromedio)), 1);
  const ppEnBacklog = backlogPPs.filter(d => d.minutosEnSistema > 10).length;
  const mejorEquipo = rankingEquiposRegistro.reduce((best, e) =>
    parseInt(e.tiempoPromedio) < parseInt(best.tiempoPromedio) ? e : best
  );

  // ---- SORTER ----
  const totalPaquetesSorter = paquetesPorBahia.reduce((s, d) => s + d.paquetes, 0);
  const totalIncorrectos = paquetesIncorrectos.length;
  const tiempoActualSorter = tiempoSorterTendencia[tiempoSorterTendencia.length - 1].segundos;
  const bahiaMasCargadaSorter = paquetesPorBahia.reduce((mx, d) => d.paquetes > mx.paquetes ? d : mx);

  // ---- BAHÍAS ----
  const ocupaciones = capacidadBahias.map(d => (d.procesando / d.capacidad) * 100);
  const ocupacionPromedio = formatNumber(average(ocupaciones), 1);
  const bahiasSaturadas = capacidadBahias.filter(d => (d.procesando / d.capacidad) * 100 > 90).length;
  const capacidadTotal = capacidadBahias.reduce((s, d) => s + d.capacidad, 0);
  const bahiaMasDescargada = capacidadBahias.reduce((mn, d) =>
    (d.procesando / d.capacidad) < (mn.procesando / mn.capacidad) ? d : mn
  );
  const bahiaLineKeys = ['B01', 'B02', 'B03', 'B04', 'B05'];
  const bahiaLineColors = { B01: '#6E8B6B', B02: '#A48F7A', B03: '#B65E4A', B04: '#C9963B', B05: '#8B7355' };

  // ---- AUDITORÍA ----
  const tiempoPromedioAudit = formatNumber(average(cajasIncorrectas.map(d => d.minutosAuditoria)), 1);
  const cajasConError = cajasIncorrectas.length;
  const cajasAuditadasHoy = distribucionTiemposAuditoria.reduce((s, d) => s + d.cajas, 0);
  const tasaExitoAudit = formatNumber(((cajasAuditadasHoy - cajasConError) / cajasAuditadasHoy) * 100, 1);

  // ---- ENVÍO ----
  const ordenesEnviadas = estatusOrdenes.filter(d => d.etapaActual === 'Envío').length;
  const ordenesEnBacklog = backlogOrdenes.filter(d => d.minutosEnSistema > 30).length;
  const tiempoPromedioEnvio = formatNumber(average(backlogOrdenes.map(d => d.minutosEnSistema)), 1);
  const ordenesCriticas = backlogOrdenes.filter(d => d.minutosEnSistema >= 40).length;

  return {
    preregistro: {
      title: 'Preregistro',
      summary: 'Entrada de órdenes al flujo, validando si cada orden llega completa antes de avanzar.',
      status: 'warning',
      primaryKpi: {
        label: 'Órdenes recibidas',
        value: totalOrdenesRecibidas,
        delta: 12,
        unit: '',
        description: 'Total de órdenes ingresadas hoy al flujo.',
      },
      secondaryKpis: [
        {
          label: 'Órdenes incompletas',
          value: ordenesInc,
          delta: -5,
          unit: '',
          description: 'Órdenes recibidas con faltantes detectados.',
        },
        {
          label: 'Tasa de órdenes completas',
          value: tasaCompletas,
          delta: 1.2,
          unit: '%',
          description: 'Porcentaje de órdenes recibidas sin faltantes.',
        },
        {
          label: 'Proveedores con incidencias',
          value: provConIncidencias,
          delta: 0,
          unit: '',
          description: 'Número de proveedores con al menos una orden incompleta.',
        },
        {
          label: 'Semana',
          value: 'S6',
          delta: null,
          unit: '',
          description: 'Semana operativa actual del análisis.',
        },
      ],
      charts: [
        <ChartCard key="prereg-pareto" title="Órdenes incompletas por proveedor (Pareto)">
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Proveedor</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Incompletas</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>% Acum</th>
              </tr>
            </thead>
            <tbody>
              {paretoPreregistro.map(item => (
                <tr key={item.proveedor} style={{ background: STATUS_BG[item.banda] }}>
                  <td style={tdStyle}>{item.proveedor}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{item.incompletas}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: STATUS_COLOR[item.banda] }}>{item.pctAcum}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>,
        <ChartCard key="prereg-trend" title="Tendencia semanal de órdenes incompletas">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={tendenciaOrdenesIncompletas} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="semana" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total" name="Incompletas" stroke="#B65E4A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>,
        <ChartCard key="prereg-stars" title="Ranking de proveedores">
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 32 }}>#</th>
                <th style={thStyle}>Proveedor</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Tasa Acept (%)</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Volumen (pp)</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Categoría</th>
              </tr>
            </thead>
            <tbody>
              {proveedoresEstrella.map((item, i) => (
                <tr key={item.proveedor}>
                  <td style={{ ...tdStyle, color: '#6B6B6B' }}>{i + 1}</td>
                  <td style={tdStyle}>{item.proveedor}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{item.tasaAceptacion}%</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{item.volumen.toLocaleString('es-MX')}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{
                      background: STATUS_BG[CATEGORIA_COLOR[item.categoria]],
                      color: STATUS_COLOR[CATEGORIA_COLOR[item.categoria]],
                      borderRadius: 12, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                    }}>{item.categoria}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>,
      ],
    },

    qa: {
      title: 'QA',
      summary: 'Control del porcentaje de aceptación por proveedor y rechazo operativo antes del registro.',
      status: 'warning',
      primaryKpi: {
        label: 'Tasa de aceptación',
        value: tasaAceptacionQA,
        delta: 0.8,
        unit: '%',
        description: 'Porcentaje de prepacks que pasan QA sin rechazo.',
      },
      secondaryKpis: [
        {
          label: 'Prepacks retornados',
          value: totalRetornados,
          delta: -2,
          unit: '',
          description: 'Total de prepacks devueltos por QA.',
        },
        {
          label: 'Proveedores con mayor rechazo',
          value: proveedoresConRechazo,
          delta: 0,
          unit: '',
          description: 'Cantidad de proveedores con rechazo alto (≥ 20 errores).',
        },
        {
          label: 'Motivo principal',
          value: motivoPrincipal,
          delta: null,
          unit: '',
          description: 'Motivo de rechazo con mayor frecuencia.',
        },
        {
          label: 'Total errores PP',
          value: totalErroresQA,
          delta: -8,
          unit: '',
          description: 'Total de errores detectados en prepacks.',
        },
      ],
      charts: [
        <ChartCard key="qa-pareto" title="Errores por proveedor (Pareto)">
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Proveedor</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Errores</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>% Acum</th>
              </tr>
            </thead>
            <tbody>
              {paretoQA.map(item => (
                <tr key={item.proveedor} style={{ background: STATUS_BG[item.banda] }}>
                  <td style={tdStyle}>{item.proveedor}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>{item.errores}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: STATUS_COLOR[item.banda] }}>{item.pctAcum}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>,
        <ChartCard key="qa-retornados" title="Prepacks retornados por QA">
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>PP</th>
                <th style={thStyle}>Proveedor</th>
                <th style={thStyle}>Motivo</th>
                <th style={thStyle}>Equipo</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Hora</th>
              </tr>
            </thead>
            <tbody>
              {prepacksRetornadosQA.map(item => (
                <tr key={item.pp}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{item.pp}</td>
                  <td style={tdStyle}>{item.proveedor}</td>
                  <td style={tdStyle}>{item.motivo}</td>
                  <td style={tdStyle}>{item.equipo}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#6B6B6B' }}>{item.hora}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>,
        <ChartCard key="qa-prenda" title="Rechazo por tipo de prenda">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rechazosPorTipoPrenda} layout="vertical" margin={{ top: 8, right: 16, left: 16, bottom: 4 }}>
              <CartesianGrid {...gridStyle} horizontal={false} />
              <XAxis type="number" tick={axisStyle} />
              <YAxis dataKey="tipo" type="category" tick={axisStyle} width={88} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rechazos" fill="#B65E4A" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>,
        <ChartCard key="qa-motivos" title="Motivos de rechazo">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={motivosRechazoQA}
                dataKey="cantidad"
                nameKey="motivo"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ motivo, percent }) => `${motivo}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {motivosRechazoQA.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>,
      ],
    },

    registro: {
      title: 'Registro',
      summary: 'Ritmo de registro por equipo, distribución por almacén y avance del flujo hacia el sorter.',
      status: overallStatus(rankingEquiposRegistro.map(e => e.status)),
      primaryKpi: {
        label: 'Prepacks en Cross-dock',
        value: prepsCrossDock,
        delta: 14,
        unit: '',
        description: 'Prepacks registrados con destino Cross-dock.',
      },
      secondaryKpis: [
        {
          label: 'Tiempo promedio registro',
          value: tiempoPromedioReg,
          delta: -0.8,
          unit: 'min',
          description: 'Promedio de minutos para registrar un prep pack.',
        },
        {
          label: 'PPs en backlog (>10 min)',
          value: ppEnBacklog,
          delta: 1,
          unit: '',
          description: 'Prepacks con más de 10 min en registro.',
        },
        {
          label: 'Mejor equipo',
          value: mejorEquipo.equipo,
          delta: null,
          unit: '',
          description: 'Equipo con menor tiempo promedio de registro.',
        },
        {
          label: 'Tiempo mejor equipo',
          value: mejorEquipo.tiempoPromedio,
          delta: null,
          unit: '',
          description: 'Tiempo promedio del equipo más rápido.',
        },
      ],
      charts: [
        <ChartCard key="reg-pie" title="Distribución por almacén">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={distribucionAlmacen}
                dataKey="prepacks"
                nameKey="almacen"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ almacen, percent }) => `${almacen}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {distribucionAlmacen.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>,
        <ChartCard key="reg-equipos" title="Ranking de equipos">
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 32 }}>#</th>
                <th style={thStyle}>Equipo</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Tiempo Promedio</th>
              </tr>
            </thead>
            <tbody>
              {rankingEquiposRegistro.map((item, i) => (
                <tr key={item.equipo} style={{ background: STATUS_BG[item.status] }}>
                  <td style={{ ...tdStyle, color: '#6B6B6B' }}>{i + 1}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: STATUS_COLOR[item.status] }}>{item.equipo}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>{item.tiempoPromedio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>,
        <ChartCard key="reg-backlog" title="Backlog de PPs">
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>PP</th>
                <th style={thStyle}>Proveedor</th>
                <th style={thStyle}>Equipo</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Tiempo (min)</th>
              </tr>
            </thead>
            <tbody>
              {backlogPPs.map(item => (
                <tr key={item.pp} style={{ background: getBacklogRowBg(item.minutosEnSistema, 10, 20) }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{item.pp}</td>
                  <td style={tdStyle}>{item.proveedor}</td>
                  <td style={tdStyle}>{item.equipo}</td>
                  <td style={{
                    ...tdStyle, textAlign: 'right', fontWeight: 700,
                    color: item.minutosEnSistema >= 20 ? STATUS_COLOR.error : item.minutosEnSistema >= 10 ? STATUS_COLOR.warning : '#1F1F1F',
                  }}>{item.minutosEnSistema}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>,
        <ChartCard key="reg-tendencia" title="Tendencia de tiempos de registro">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={tendenciaTiemposRegistro} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="semana" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={10} stroke="#BBBBBB" strokeDasharray="4 4"
                label={{ value: 'Target 10 min', position: 'insideTopRight', fontSize: 11, fill: '#BBBBBB' }}
              />
              <Line type="monotone" dataKey="tiempoPromedio" name="Tiempo prom (min)" stroke="#111111" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>,
      ],
    },

    sorter: {
      title: 'Sorter',
      summary: 'Flujo único de clasificación con foco en distribución por bahía y paquetes incorrectamente sorteados.',
      status: 'warning',
      primaryKpi: {
        label: 'Paquetes clasificados hoy',
        value: totalPaquetesSorter,
        delta: 87,
        unit: '',
        description: 'Total de paquetes procesados por el sorter hoy.',
      },
      secondaryKpis: [
        {
          label: 'Paquetes en bahía incorrecta',
          value: totalIncorrectos,
          delta: -2,
          unit: '',
          description: 'Paquetes asignados a una bahía distinta a la correcta.',
        },
        {
          label: 'Tiempo promedio por paquete',
          value: tiempoActualSorter,
          delta: -0.3,
          unit: 'seg',
          description: 'Segundos promedio por paquete en sorter.',
        },
        {
          label: 'Bahía más cargada',
          value: bahiaMasCargadaSorter.bahia,
          delta: null,
          unit: '',
          description: 'Bahía con mayor volumen de paquetes.',
        },
        {
          label: 'Paquetes bahía top',
          value: bahiaMasCargadaSorter.paquetes,
          delta: null,
          unit: '',
          description: 'Total de paquetes en la bahía más cargada.',
        },
      ],
      charts: [
        <ChartCard key="sorter-dist" title="Distribución de paquetes en bahías">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={paquetesPorBahia} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="bahia" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="paquetes" fill="#A48F7A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>,
        <ChartCard key="sorter-incorrectos" title="Paquetes sorteados incorrectamente">
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>PP</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Bahía Actual</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Bahía Correcta</th>
                <th style={thStyle}>Equipo</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Hora</th>
              </tr>
            </thead>
            <tbody>
              {paquetesIncorrectos.map(item => (
                <tr key={item.pp} style={{ background: STATUS_BG.error }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{item.pp}</td>
                  <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700, color: STATUS_COLOR.error }}>{item.bahiaActual}</td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: STATUS_COLOR.success }}>{item.bahiaCorrecta}</td>
                  <td style={tdStyle}>{item.equipo}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#6B6B6B' }}>{item.hora}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>,
        <ChartCard key="sorter-tiempo" title="Tiempo promedio del sorter (seg/paquete)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={tiempoSorterTendencia} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="semana" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="segundos" name="Seg/paquete" stroke="#111111" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>,
      ],
    },

    bahias: {
      title: 'Bahías',
      summary: 'Ocupación a lo largo de los 10 carriles, tendencia histórica y capacidad disponible.',
      status: bahiasGeneral.status,
      primaryKpi: {
        label: 'Ocupación promedio',
        value: ocupacionPromedio,
        delta: 2.1,
        unit: '%',
        description: 'Promedio de ocupación de los carriles.',
      },
      secondaryKpis: [
        {
          label: 'Bahías saturadas (>90%)',
          value: bahiasSaturadas,
          delta: 1,
          unit: '',
          description: 'Número de bahías con ocupación mayor a 90%.',
        },
        {
          label: 'Capacidad total',
          value: capacidadTotal,
          delta: 0,
          unit: 'pp',
          description: 'Suma de capacidad de todas las bahías.',
        },
        {
          label: 'Bahía más descargada',
          value: bahiaMasDescargada.bahia,
          delta: null,
          unit: '',
          description: 'Bahía con menor ocupación.',
        },
        {
          label: 'Procesando en descargada',
          value: bahiaMasDescargada.procesando,
          delta: null,
          unit: '',
          description: 'Paquetes en proceso en la bahía menos cargada.',
        },
      ],
      charts: [
        <BayGrid key="bay-grid" bahias={bahiasGeneral.bahias} />,
        <ChartCard key="bay-tendencia" title="Tendencia de ocupación por bahía (B01–B05)">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={tendenciaOcupacionBahias} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="semana" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              {bahiaLineKeys.map(key => (
                <Line key={key} type="monotone" dataKey={key} name={key} stroke={bahiaLineColors[key]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>,
        <ChartCard key="bay-capacidad" title="Capacidad disponible vs procesando por bahía">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={capacidadBahias} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="bahia" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="capacidad" name="Capacidad" fill="#1F1F1F" radius={[3, 3, 0, 0]} />
              <Bar dataKey="procesando" name="Procesando" fill="#A48F7A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>,
      ],
    },

    auditoria: {
      title: 'Auditoría',
      summary: 'Validación final con detalle de cajas incorrectas y distribución de tiempos de auditoría.',
      status: 'warning',
      primaryKpi: {
        label: 'Cajas auditadas hoy',
        value: cajasAuditadasHoy,
        delta: 8,
        unit: '',
        description: 'Total de cajas auditadas hoy.',
      },
      secondaryKpis: [
        {
          label: 'Tiempo promedio auditoría',
          value: tiempoPromedioAudit,
          delta: -0.4,
          unit: 'min',
          description: 'Promedio de minutos por auditoría.',
        },
        {
          label: 'Cajas con error',
          value: cajasConError,
          delta: -1,
          unit: '',
          description: 'Cajas auditadas con error detectado.',
        },
        {
          label: 'Tasa de éxito',
          value: tasaExitoAudit,
          delta: 0.5,
          unit: '%',
          description: 'Porcentaje de cajas auditadas sin error.',
        },
        {
          label: 'Auditoría lenta (>8 min)',
          value: cajasIncorrectas.filter(d => d.minutosAuditoria > 8).length,
          delta: 0,
          unit: '',
          description: 'Cajas con auditoría mayor a 8 minutos.',
        },
      ],
      charts: [
        <ChartCard key="audit-cajas" title="Detalle de cajas incorrectas">
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Caja</th>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Equipo</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Tiempo (min)</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Hora</th>
              </tr>
            </thead>
            <tbody>
              {cajasIncorrectas.map(item => (
                <tr key={item.caja}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{item.caja}</td>
                  <td style={tdStyle}>{item.tipo}</td>
                  <td style={tdStyle}>{item.equipo}</td>
                  <td style={{
                    ...tdStyle, textAlign: 'right', fontWeight: 700,
                    color: item.minutosAuditoria > 8 ? STATUS_COLOR.error : '#1F1F1F',
                  }}>{item.minutosAuditoria}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#6B6B6B' }}>{item.hora}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>,
        <ChartCard key="audit-dist" title="¿Por qué tardan más algunos casos?" footer="Distribución de tiempos de auditoría">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={distribucionTiemposAuditoria} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="rango" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cajas" name="Cajas" radius={[3, 3, 0, 0]}>
                {distribucionTiemposAuditoria.map((item, i) => (
                  <Cell key={i} fill={item.rango === '> 12 min' ? '#B65E4A' : '#A48F7A'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>,
      ],
    },

    envio: {
      title: 'Envío',
      summary: 'Cierre del flujo con backlog de órdenes pendientes y estatus general por proveedor.',
      status: ordenesCriticas > 0 ? 'error' : ordenesEnBacklog > 0 ? 'warning' : 'success',
      primaryKpi: {
        label: 'Órdenes enviadas hoy',
        value: ordenesEnviadas,
        delta: 1,
        unit: '',
        description: 'Órdenes cerradas y enviadas hoy.',
      },
      secondaryKpis: [
        {
          label: 'Órdenes en backlog (>30 min)',
          value: ordenesEnBacklog,
          delta: 0,
          unit: '',
          description: 'Órdenes con más de 30 min en backlog.',
        },
        {
          label: 'Tiempo promedio total',
          value: tiempoPromedioEnvio,
          delta: -2.1,
          unit: 'min',
          description: 'Promedio de minutos desde ingreso hasta envío.',
        },
        {
          label: 'Alertas críticas (≥40 min)',
          value: ordenesCriticas,
          delta: 0,
          unit: '',
          description: 'Órdenes con más de 40 min en backlog.',
        },
        {
          label: 'Prepacks en tránsito',
          value: backlogOrdenes.reduce((s, d) => s + d.prepacks, 0),
          delta: null,
          unit: '',
          description: 'Prepacks en movimiento dentro del flujo de envío.',
        },
      ],
      charts: [
        <ChartCard key="envio-backlog" title="Backlog de órdenes">
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Orden</th>
                <th style={thStyle}>Proveedor</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Tiempo (min)</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Prepacks</th>
              </tr>
            </thead>
            <tbody>
              {backlogOrdenes.map(item => (
                <tr key={item.orden} style={{ background: getBacklogRowBg(item.minutosEnSistema, 30, 40) }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{item.orden}</td>
                  <td style={tdStyle}>{item.proveedor}</td>
                  <td style={{
                    ...tdStyle, textAlign: 'right', fontWeight: 700,
                    color: item.minutosEnSistema >= 40 ? STATUS_COLOR.error : item.minutosEnSistema >= 30 ? STATUS_COLOR.warning : '#1F1F1F',
                  }}>{item.minutosEnSistema}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{item.prepacks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>,
        <ChartCard key="envio-estatus" title="Estatus de órdenes">
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Orden</th>
                <th style={thStyle}>Proveedor</th>
                <th style={thStyle}>Etapa Actual</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Prepacks</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Hora Ingreso</th>
              </tr>
            </thead>
            <tbody>
              {estatusOrdenes.map(item => (
                <tr key={item.orden}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{item.orden}</td>
                  <td style={tdStyle}>{item.proveedor}</td>
                  <td style={tdStyle}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <StatusDot status={item.status} />
                      {item.etapaActual}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>{item.prepacks}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: '#6B6B6B' }}>{item.horaIngreso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>,
      ],
    },
  };
}

export default function Dashboard() {
  const [activeStage, setActiveStage] = useState(getCurrentStageId);
  const stageData = useMemo(() => buildStageData(), []);
  const currentStage = stageData[activeStage] || stageData.preregistro;

  useEffect(() => {
    const syncStage = () => setActiveStage(getCurrentStageId());
    window.addEventListener('popstate', syncStage);

    if (!stageRoutes.some(stage => window.location.pathname === stage.path)) {
      window.history.replaceState({}, '', '/dashboard/preregistro');
      syncStage();
    }

    return () => window.removeEventListener('popstate', syncStage);
  }, []);

  const onStageChange = stage => {
    setActiveStage(stage.id);
    goToPath(stage.path);
  };

  return (
    <div style={{ padding: 24, background: '#F8F6F3', minHeight: 'calc(100vh - 56px)' }}>
      <div style={{ display: 'grid', gap: 18, marginBottom: 24 }}>
        <StageTabs activeStage={activeStage} onStageChange={onStageChange} />
        <SectionHeader
          title={currentStage.title}
          summary={currentStage.summary}
          status={currentStage.status}
        />
      </div>

      <KpiStrip primaryKpi={currentStage.primaryKpi} secondaryKpis={currentStage.secondaryKpis} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
        {currentStage.charts}
        <TeamPerformance stageId={activeStage} />
      </div>
    </div>
  );
}
