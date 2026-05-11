import React, { useEffect, useMemo, useState } from "react";
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
} from "recharts";
import {
  bahiasGeneral,
  equipos,
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
} from "../data/mockData";
import KPICard from "../../../shared/components/ui/KPICard";

import { usePreregistroKPIs } from "../hooks/usePreRegistroKPI";
import { useOrdenesIncompletas } from "../hooks/useOrdenesIncompletas";
import { useTendenciaSemanal } from "../hooks/useTendenciaSemanal";
import { useProveedoresEstrella } from "../hooks/useProveedoresEstrella";
import { useRendimientoEquipos } from "../hooks/useRendimientoEquipos";
import { useEnvioKPIs } from "../hooks/useEnvioKPIs";
import { useBacklogEnvio } from "../hooks/useBacklogEnvio";
import { useOrdenesActivas } from "../hooks/useOrdenesActivas";

const STATUS_COLOR = {
  success: "#6E8B6B",
  warning: "#C9963B",
  error: "#B65E4A",
};

const STATUS_BG = {
  success: "#EEF2ED",
  warning: "#FBF4E6",
  error: "#F9EDEB",
};

const STATUS_LABEL = { success: "OK", warning: "Atención", error: "Error" };

const stageRoutes = [
  { id: "preregistro", label: "Preregistro", path: "/dashboard/preregistro" },
  { id: "qa", label: "QA", path: "/dashboard/qa" },
  { id: "registro", label: "Registro", path: "/dashboard/registro" },
  { id: "sorter", label: "Sorter", path: "/dashboard/sorter" },
  { id: "bahias", label: "Bahías", path: "/dashboard/bahias" },
  { id: "auditoria", label: "Auditoría", path: "/dashboard/auditoria" },
  { id: "envio", label: "Envío", path: "/dashboard/envio" },
];

const teamPerformanceStages = ["preregistro", "qa", "registro"];

const axisStyle = { fontSize: 12, fill: "#6B6B6B", fontFamily: "Inter" };
const gridStyle = { stroke: "#E7E2DC", strokeDasharray: "3 3" };

function getCurrentStageId() {
  if (typeof window === "undefined") return "preregistro";
  const current = stageRoutes.find(
    (stage) => window.location.pathname === stage.path,
  );
  return current?.id || "preregistro";
}

function goToPath(path) {
  if (typeof window === "undefined") return;
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function overallStatus(statuses) {
  if (statuses.includes("error")) return "error";
  if (statuses.includes("warning")) return "warning";
  return "success";
}

function formatNumber(value, decimals = 0) {
  return Number(value).toLocaleString("es-MX", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
}

function StatusDot({ status }) {
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: STATUS_COLOR[status],
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

function StageTabs({ activeStage, onStageChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        paddingBottom: 2,
      }}
    >
      {stageRoutes.map((stage) => {
        const isActive = activeStage === stage.id;
        return (
          <button
            key={stage.id}
            onClick={() => onStageChange(stage)}
            style={{
              border: "1px solid #E7E2DC",
              background: isActive ? "#111111" : "#FFFFFF",
              color: isActive ? "#FFFFFF" : "#6B6B6B",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: isActive ? 600 : 500,
              fontFamily: "var(--font)",
              cursor: "pointer",
              whiteSpace: "nowrap",
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
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 18,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 11,
            color: "#6B6B6B",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          Dashboard operativo
        </div>
        <h1
          style={{
            fontSize: 28,
            lineHeight: 1.15,
            fontWeight: 600,
            color: "#1F1F1F",
            margin: 0,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "#6B6B6B",
            marginTop: 6,
            maxWidth: 680,
          }}
        >
          {summary}
        </p>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: STATUS_BG[status],
          color: STATUS_COLOR[status],
          borderRadius: 20,
          padding: "6px 12px",
          fontSize: 12,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        {/* <StatusDot status={status} />
        {STATUS_LABEL[status]} */}
      </div>
    </div>
  );
}

function KpiStrip({ primaryKpi, secondaryKpis }) {
  return (
    <div style={{ display: "flex", gap: 14, marginBottom: 22 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <KPICard
          label={primaryKpi.label}
          value={primaryKpi.value}
          delta={primaryKpi.delta}
          unit={primaryKpi.unit}
          description={primaryKpi.description}
        />
      </div>
      {secondaryKpis.map((item) => (
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <h2
          style={{ fontSize: 15, fontWeight: 600, color: "#1F1F1F", margin: 0 }}
        >
          {title}
        </h2>
        {footer && (
          <div style={{ fontSize: 12, color: "#6B6B6B" }}>{footer}</div>
        )}
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E7E2DC",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        fontFamily: "Inter",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ color: "#6B6B6B", marginBottom: 4 }}>{label}</div>
      {payload.map((item) => (
        <div
          key={item.dataKey}
          style={{ color: item.color || "#1F1F1F", fontWeight: 600 }}
        >
          {item.name}: {item.value}
        </div>
      ))}
    </div>
  );
}

function VerticalBarChart({ data, xKey, valueKey, color = "#111111" }) {
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

function HorizontalBarChart({ data, xKey, valueKey, color = "#111111" }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 16, bottom: 4 }}
      >
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
        {lines.map((line) => (
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

function ProgressBar({ value, status = "success" }) {
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          height: 6,
          borderRadius: 6,
          background: "#F0EDE8",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.max(0, Math.min(value, 100))}%`,
            height: "100%",
            background: STATUS_COLOR[status],
            borderRadius: 6,
          }}
        />
      </div>
    </div>
  );
}

function TeamPerformance({ stageId }) {
  if (!teamPerformanceStages.includes(stageId)) return null;

  const rows = equipos.map((equipo) => {
    if (stageId === "preregistro") {
      const receivedPercent =
        (equipo.detalleOrden.totalPrepacks /
          equipo.detalleOrden.prepacksEsperados) *
        100;
      return {
        equipo: equipo.nombre,
        orden: equipo.orden,
        value: formatNumber(receivedPercent, 1),
        unit: "% recibido",
        detail: `${equipo.detalleOrden.totalPrepacks} de ${equipo.detalleOrden.prepacksEsperados} prepacks`,
        status: equipo.etapas.prepack.status,
        progress: receivedPercent,
      };
    }

    if (stageId === "qa") {
      return {
        equipo: equipo.nombre,
        orden: equipo.orden,
        value: equipo.etapas.qa.porcentaje,
        unit: "% aceptación",
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
      detail: "Rendimiento por equipo",
      status: equipo.etapas.registro.status,
      progress: Math.min(
        100,
        Math.round((equipo.etapas.registro.valor / 260) * 100),
      ),
    };
  });

  return (
    <ChartCard
      title="Rendimiento por equipos"
      footer="Solo preregistro, QA y registro"
    >
      <div style={{ display: "grid", gap: 12 }}>
        {rows.map((row) => (
          <div
            key={row.equipo}
            style={{
              border: "1px solid #E7E2DC",
              borderRadius: 8,
              padding: "14px 16px",
              background: "#FAFAF8",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 10,
              }}
            >
              <div>
                <div
                  style={{ fontSize: 14, fontWeight: 600, color: "#1F1F1F" }}
                >
                  {row.equipo}
                </div>
                <div style={{ fontSize: 12, color: "#6B6B6B", marginTop: 2 }}>
                  {row.orden} · {row.detail}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: STATUS_COLOR[row.status],
                  }}
                >
                  {row.value}
                </div>
                <div style={{ fontSize: 11, color: "#6B6B6B" }}>{row.unit}</div>
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
      <div style={{ display: "grid", gap: 10 }}>
        {orders.map((order) => (
          <div
            key={order.orden}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 12,
              alignItems: "center",
              padding: "12px 14px",
              border: "1px solid #E7E2DC",
              borderRadius: 8,
              background: "#FAFAF8",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1F1F1F" }}>
                {order.orden}
              </div>
              <div style={{ fontSize: 12, color: "#6B6B6B", marginTop: 2 }}>
                {order.hora} · {order.prepacks} prepacks · {order.items} SKUs
              </div>
            </div>
            <span
              style={{
                borderRadius: 20,
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 700,
                color: STATUS_COLOR[order.status],
                background: STATUS_BG[order.status],
              }}
            >
              {order.completa ? "Completa" : "Incompleta"}
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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))",
          gap: 12,
        }}
      >
        {bahias.map((bahia) => (
          <div
            key={bahia.id}
            style={{
              border: "1px solid #E7E2DC",
              borderRadius: 8,
              background: "#FAFAF8",
              padding: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1F1F1F" }}>
                {bahia.id}
              </span>
              <StatusDot status={bahia.status} />
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: STATUS_COLOR[bahia.status],
                marginBottom: 8,
              }}
            >
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
    .map((item) => {
      acumulado += item[valueKey];
      const pctAcum = (acumulado / total) * 100;
      const banda =
        pctAcum <= 80 ? "error" : pctAcum <= 95 ? "warning" : "success";
      return { ...item, pctAcum: Number(pctAcum.toFixed(1)), banda };
    });
}

function getBacklogRowBg(minutos, umbral1, umbral2) {
  if (minutos >= umbral2) return STATUS_BG.error;
  if (minutos >= umbral1) return STATUS_BG.warning;
  return "transparent";
}

function TendenciaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const { total, variacion } = payload[0].payload;
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E7E2DC",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        fontFamily: "Inter",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ color: "#6B6B6B", marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 600, color: "#B65E4A" }}>Incompletas: {total}</div>
      {variacion !== null && variacion !== undefined && (
        <div style={{ color: variacion > 0 ? "#B65E4A" : "#6E8B6B", fontSize: 11, marginTop: 2 }}>
          {variacion > 0 ? "+" : ""}{variacion}% vs sem. anterior
        </div>
      )}
    </div>
  );
}

function TendenciaSemanalChart() {
  const [semanas, setSemanas] = useState(8);
  const { data, loading } = useTendenciaSemanal(semanas);
  const avg =
    data.length > 0
      ? Math.round(data.reduce((s, d) => s + d.total, 0) / data.length)
      : 0;

  return (
    <ChartCard
      title="Tendencia semanal de órdenes incompletas"
      footer={
        <div style={{ display: "flex", gap: 4 }}>
          {[4, 8, 12].map((n) => (
            <button
              key={n}
              onClick={() => setSemanas(n)}
              style={{
                border: "1px solid #E7E2DC",
                background: semanas === n ? "#111111" : "#FFFFFF",
                color: semanas === n ? "#FFFFFF" : "#6B6B6B",
                borderRadius: 6,
                padding: "2px 8px",
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "var(--font)",
                cursor: "pointer",
              }}
            >
              {n}S
            </button>
          ))}
        </div>
      }
    >
      {loading ? (
        <div
          style={{
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6B6B6B",
            fontSize: 13,
          }}
        >
          Cargando...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
          >
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="semana" tick={axisStyle} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<TendenciaTooltip />} />
            {avg > 0 && (
              <ReferenceLine
                y={avg}
                stroke="#BBBBBB"
                strokeDasharray="4 4"
                label={{
                  value: `Prom ${avg}`,
                  position: "insideTopRight",
                  fontSize: 11,
                  fill: "#BBBBBB",
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="total"
              name="Incompletas"
              stroke="#B65E4A"
              strokeWidth={2}
              dot={{ r: 3, fill: "#B65E4A" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

const ESTRELLA_COLOR = {
  estrella: "#C9A227",
  bueno: "#6E8B6B",
  riesgo: "#E07B39",
};

const ESTRELLA_BG = {
  estrella: "#FBF6E6",
  bueno: "#EEF2ED",
  riesgo: "#FEF3EC",
};

const ESTRELLA_LABEL = {
  estrella: "Estrella",
  bueno: "Bueno",
  riesgo: "Riesgo",
};

function ProveedoresEstrellaTable() {
  const { data, loading } = useProveedoresEstrella();
  const [expanded, setExpanded] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    fontFamily: "Inter",
  };
  const thStyle = {
    textAlign: "left",
    padding: "8px 10px",
    fontSize: 11,
    fontWeight: 600,
    color: "#6B6B6B",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid #E7E2DC",
    background: "#FAFAF8",
  };
  const tdStyle = {
    padding: "9px 10px",
    borderBottom: "1px solid #F0EDE8",
    color: "#1F1F1F",
    verticalAlign: "middle",
  };

  const handleRowClick = async (item) => {
    if (expanded === item.id_proveedor) {
      setExpanded(null);
      return;
    }
    setExpanded(item.id_proveedor);
    setHistorial([]);
    setLoadingHistorial(true);
    try {
      const res = await fetch(
        `http://localhost:3001/api/preregistro/proveedores/${encodeURIComponent(item.id_proveedor)}/historial`,
      );
      if (!res.ok) throw new Error("Error en el servidor");
      setHistorial(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistorial(false);
    }
  };

  return (
    <ChartCard title="Ranking de proveedores">
      {loading ? (
        <div
          style={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6B6B6B",
            fontSize: 13,
          }}
        >
          Cargando...
        </div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 32 }}>#</th>
              <th style={thStyle}>Proveedor</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Tasa Acept (%)</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Volumen (pp)</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Categoría</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <React.Fragment key={item.id_proveedor}>
                <tr
                  onClick={() => handleRowClick(item)}
                  style={{
                    background:
                      expanded === item.id_proveedor
                        ? ESTRELLA_BG[item.categoria]
                        : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <td style={{ ...tdStyle, color: "#6B6B6B" }}>{i + 1}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {item.proveedor}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      fontWeight: 700,
                      color: ESTRELLA_COLOR[item.categoria],
                    }}
                  >
                    {item.tasa_aceptacion}%
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    {item.volumen.toLocaleString("es-MX")}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <span
                      style={{
                        background: ESTRELLA_BG[item.categoria],
                        color: ESTRELLA_COLOR[item.categoria],
                        borderRadius: 12,
                        padding: "3px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        border: `1px solid ${ESTRELLA_COLOR[item.categoria]}30`,
                      }}
                    >
                      {ESTRELLA_LABEL[item.categoria]}
                    </span>
                  </td>
                </tr>
                {expanded === item.id_proveedor && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "16px 12px",
                        background: ESTRELLA_BG[item.categoria],
                        borderBottom: "1px solid #E7E2DC",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#1F1F1F",
                          marginBottom: 10,
                        }}
                      >
                        Historial mensual — {item.proveedor}
                      </div>
                      {loadingHistorial ? (
                        <div
                          style={{
                            height: 140,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#6B6B6B",
                            fontSize: 12,
                          }}
                        >
                          Cargando...
                        </div>
                      ) : historial.length === 0 ? (
                        <div
                          style={{
                            height: 80,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#6B6B6B",
                            fontSize: 12,
                          }}
                        >
                          Sin historial disponible
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={160}>
                          <LineChart
                            data={historial}
                            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                          >
                            <CartesianGrid {...gridStyle} />
                            <XAxis dataKey="mes" tick={axisStyle} />
                            <YAxis
                              domain={[0, 100]}
                              tick={axisStyle}
                              unit="%"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine
                              y={95}
                              stroke="#C9A227"
                              strokeDasharray="4 4"
                              label={{
                                value: "Estrella 95%",
                                position: "insideTopRight",
                                fontSize: 10,
                                fill: "#C9A227",
                              }}
                            />
                            <ReferenceLine
                              y={80}
                              stroke="#6E8B6B"
                              strokeDasharray="4 4"
                              label={{
                                value: "Bueno 80%",
                                position: "insideTopRight",
                                fontSize: 10,
                                fill: "#6E8B6B",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="tasa_aceptacion"
                              name="Tasa acept (%)"
                              stroke={ESTRELLA_COLOR[item.categoria]}
                              strokeWidth={2}
                              dot={{ r: 3, fill: ESTRELLA_COLOR[item.categoria] }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </ChartCard>
  );
}

const UMBRAL_ALERTA = 80;
const UMBRAL_AVISO = 95;

function RendimientoEquiposPreregistro() {
  const { data, loading } = useRendimientoEquipos();
  const [expanded, setExpanded] = useState(null);

  if (loading) {
    return (
      <ChartCard title="Rendimiento por equipo">
        <div
          style={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6B6B6B",
            fontSize: 13,
          }}
        >
          Cargando...
        </div>
      </ChartCard>
    );
  }

  if (!data.length) {
    return (
      <ChartCard title="Rendimiento por equipo">
        <div
          style={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6B6B6B",
            fontSize: 13,
          }}
        >
          Sin órdenes activas asignadas a equipos
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Rendimiento por equipo"
      footer={`${data.length} equipo${data.length !== 1 ? "s" : ""} activo${data.length !== 1 ? "s" : ""}`}
    >
      <div style={{ display: "grid", gap: 12 }}>
        {data.map((item) => {
          const isExpanded = expanded === item.equipo;
          const belowThreshold = item.pct_recibido < UMBRAL_ALERTA;
          const needsAttention =
            item.pct_recibido < UMBRAL_AVISO && item.pct_recibido >= UMBRAL_ALERTA;
          const borderColor = belowThreshold
            ? STATUS_COLOR.error
            : needsAttention
              ? STATUS_COLOR.warning
              : "#E7E2DC";

          return (
            <div key={item.equipo}>
              <div
                onClick={() => setExpanded(isExpanded ? null : item.equipo)}
                style={{
                  border: `1px solid ${borderColor}`,
                  borderRadius: 8,
                  padding: "14px 16px",
                  background: belowThreshold
                    ? STATUS_BG.error
                    : needsAttention
                      ? STATUS_BG.warning
                      : "#FAFAF8",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1F1F1F",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {item.equipo}
                      {belowThreshold && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: STATUS_COLOR.error,
                            background: STATUS_BG.error,
                            border: `1px solid ${STATUS_COLOR.error}40`,
                            borderRadius: 10,
                            padding: "2px 7px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Bajo umbral
                        </span>
                      )}
                      {needsAttention && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: STATUS_COLOR.warning,
                            background: STATUS_BG.warning,
                            border: `1px solid ${STATUS_COLOR.warning}40`,
                            borderRadius: 10,
                            padding: "2px 7px",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Atención
                        </span>
                      )}
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#6B6B6B", marginTop: 2 }}
                    >
                      {item.id_orden} · {item.recibidos} de {item.total_prepacks} prepacks
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: STATUS_COLOR[item.status],
                      }}
                    >
                      {item.pct_recibido}%
                    </div>
                    <div style={{ fontSize: 11, color: "#6B6B6B" }}>
                      recibido
                    </div>
                  </div>
                </div>
                <ProgressBar value={item.pct_recibido} status={item.status} />
              </div>

              {isExpanded && item.prepacks.length > 0 && (
                <div
                  style={{
                    border: "1px solid #E7E2DC",
                    borderTop: "none",
                    borderRadius: "0 0 8px 8px",
                    background: "#FFFFFF",
                    padding: "12px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#6B6B6B",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 10,
                    }}
                  >
                    Prepacks recibidos ({item.prepacks.length})
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {item.prepacks.map((pp, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "auto 1fr auto",
                          alignItems: "center",
                          gap: 12,
                          padding: "8px 10px",
                          background: "#FAFAF8",
                          borderRadius: 6,
                          border: "1px solid #F0EDE8",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#1F1F1F",
                            minWidth: 80,
                          }}
                        >
                          {pp.modelo}
                        </div>
                        <div style={{ fontSize: 11, color: "#6B6B6B" }}>
                          {pp.distribucion_talla
                            ? Object.entries(pp.distribucion_talla)
                                .filter(([, v]) => v > 0)
                                .map(([k, v]) => `${k}:${v}`)
                                .join(" · ")
                            : "—"}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#6B6B6B",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {pp.cantidad_total} uds
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

const BACKLOG_WARNING_MIN = 30;
const BACKLOG_CRITICAL_MIN = 40;

function elapsedMinutes(fechaCreacion) {
  return Math.floor((Date.now() - new Date(fechaCreacion)) / 60000);
}

function BacklogEnvioTable() {
  const { data, loading } = useBacklogEnvio();
  const [, setTick] = useState(0);

  // Re-render every 60 s so elapsed times update without a server call
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const rows = data
    .map((item) => ({ ...item, elapsed: elapsedMinutes(item.fecha_creacion) }))
    .sort((a, b) => b.elapsed - a.elapsed);

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    fontFamily: "Inter",
  };
  const thStyle = {
    textAlign: "left",
    padding: "8px 10px",
    fontSize: 11,
    fontWeight: 600,
    color: "#6B6B6B",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid #E7E2DC",
    background: "#FAFAF8",
  };
  const tdStyle = {
    padding: "9px 10px",
    borderBottom: "1px solid #F0EDE8",
    color: "#1F1F1F",
    verticalAlign: "middle",
  };

  const alertCount = rows.filter((r) => r.elapsed >= BACKLOG_CRITICAL_MIN).length;
  const warningCount = rows.filter(
    (r) => r.elapsed >= BACKLOG_WARNING_MIN && r.elapsed < BACKLOG_CRITICAL_MIN,
  ).length;

  const footer = loading ? null : (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {alertCount > 0 && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: STATUS_COLOR.error,
            background: STATUS_BG.error,
            borderRadius: 10,
            padding: "2px 8px",
          }}
        >
          {alertCount} crítica{alertCount !== 1 ? "s" : ""}
        </span>
      )}
      {warningCount > 0 && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: STATUS_COLOR.warning,
            background: STATUS_BG.warning,
            borderRadius: 10,
            padding: "2px 8px",
          }}
        >
          {warningCount} en espera
        </span>
      )}
    </div>
  );

  return (
    <ChartCard title="Backlog de órdenes" footer={footer}>
      {loading ? (
        <div
          style={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6B6B6B",
            fontSize: 13,
          }}
        >
          Cargando...
        </div>
      ) : rows.length === 0 ? (
        <div
          style={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6B6B6B",
            fontSize: 13,
          }}
        >
          Sin órdenes activas en las últimas 12 h
        </div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Orden</th>
              <th style={thStyle}>Proveedor</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Recibidos</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Tiempo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const isCritical = item.elapsed >= BACKLOG_CRITICAL_MIN;
              const isWarning =
                !isCritical && item.elapsed >= BACKLOG_WARNING_MIN;
              const timeColor = isCritical
                ? STATUS_COLOR.error
                : isWarning
                  ? STATUS_COLOR.warning
                  : "#1F1F1F";
              const rowBg = isCritical
                ? STATUS_BG.error
                : isWarning
                  ? STATUS_BG.warning
                  : "transparent";
              return (
                <tr key={item.id_orden} style={{ background: rowBg }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {item.id_orden}
                  </td>
                  <td style={tdStyle}>{item.nombre_proveedor}</td>
                  <td style={{ ...tdStyle, textAlign: "right", color: "#6B6B6B" }}>
                    {item.prepacks_recibidos}/{item.total_prepacks}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      fontWeight: 700,
                      color: timeColor,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {item.elapsed} min
                    {isCritical && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 10,
                          fontWeight: 700,
                          color: STATUS_COLOR.error,
                          background: STATUS_BG.error,
                          border: `1px solid ${STATUS_COLOR.error}40`,
                          borderRadius: 8,
                          padding: "1px 5px",
                          textTransform: "uppercase",
                        }}
                      >
                        Crítico
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </ChartCard>
  );
}

const ETAPA_LABEL = {
  preregistro: "Preregistro",
  qa: "QA",
  registro: "Registro",
  sorter: "Sorter",
  bahias: "Bahías",
  auditoria: "Auditoría",
  envio: "Envío",
};

function OrdenesActivasTable() {
  const { data, loading } = useOrdenesActivas();
  const [, setTick] = useState(0);
  const [filtroProveedor, setFiltroProveedor] = useState("");
  const [filtroEtapa, setFiltroEtapa] = useState("");
  const [filtroAlerta, setFiltroAlerta] = useState("todos");

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const rows = data.map((item) => ({
    ...item,
    elapsed: elapsedMinutes(item.fecha_creacion),
  }));

  const proveedores = [...new Set(rows.map((r) => r.nombre_proveedor))]
    .filter(Boolean)
    .sort();
  const etapas = [...new Set(rows.map((r) => r.etapa_actual))]
    .filter(Boolean)
    .sort();

  const filtered = rows
    .filter((r) => !filtroProveedor || r.nombre_proveedor === filtroProveedor)
    .filter((r) => !filtroEtapa || r.etapa_actual === filtroEtapa)
    .filter((r) => {
      if (filtroAlerta === "critico") return r.elapsed >= BACKLOG_CRITICAL_MIN;
      if (filtroAlerta === "atencion") return r.elapsed >= BACKLOG_WARNING_MIN;
      return true;
    })
    .sort((a, b) => b.elapsed - a.elapsed);

  const selectStyle = {
    border: "1px solid #E7E2DC",
    borderRadius: 6,
    padding: "4px 8px",
    fontSize: 12,
    fontFamily: "var(--font)",
    background: "#FFFFFF",
    color: "#1F1F1F",
    cursor: "pointer",
    outline: "none",
  };

  const alertBtnStyle = (active, variant) => ({
    border: `1px solid ${active ? STATUS_COLOR[variant] : "#E7E2DC"}`,
    background: active ? STATUS_BG[variant] : "#FFFFFF",
    color: active ? STATUS_COLOR[variant] : "#6B6B6B",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 11,
    fontWeight: 600,
    fontFamily: "var(--font)",
    cursor: "pointer",
  });

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    fontFamily: "Inter",
  };
  const thStyle = {
    textAlign: "left",
    padding: "8px 10px",
    fontSize: 11,
    fontWeight: 600,
    color: "#6B6B6B",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid #E7E2DC",
    background: "#FAFAF8",
  };
  const tdStyle = {
    padding: "9px 10px",
    borderBottom: "1px solid #F0EDE8",
    color: "#1F1F1F",
    verticalAlign: "middle",
  };

  return (
    <ChartCard title="Estatus de órdenes activas">
      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 14,
          paddingBottom: 12,
          borderBottom: "1px solid #F0EDE8",
        }}
      >
        <select
          value={filtroProveedor}
          onChange={(e) => setFiltroProveedor(e.target.value)}
          style={selectStyle}
        >
          <option value="">Todos los proveedores</option>
          {proveedores.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={filtroEtapa}
          onChange={(e) => setFiltroEtapa(e.target.value)}
          style={selectStyle}
        >
          <option value="">Todas las etapas</option>
          {etapas.map((e) => (
            <option key={e} value={e}>
              {ETAPA_LABEL[e] ?? e}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {[
            { key: "todos", label: "Todos", variant: "success" },
            { key: "atencion", label: "Atención", variant: "warning" },
            { key: "critico", label: "Crítico", variant: "error" },
          ].map(({ key, label, variant }) => (
            <button
              key={key}
              onClick={() => setFiltroAlerta(key)}
              style={alertBtnStyle(filtroAlerta === key, variant)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div
          style={{
            height: 180,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6B6B6B",
            fontSize: 13,
          }}
        >
          Cargando...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            height: 180,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6B6B6B",
            fontSize: 13,
          }}
        >
          Sin órdenes activas con los filtros seleccionados
        </div>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Orden</th>
              <th style={thStyle}>Proveedor</th>
              <th style={thStyle}>Etapa</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Prepacks</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Hora ingreso</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Tiempo</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const isCritical = item.elapsed >= BACKLOG_CRITICAL_MIN;
              const isWarning =
                !isCritical && item.elapsed >= BACKLOG_WARNING_MIN;
              const rowBg = isCritical
                ? STATUS_BG.error
                : isWarning
                  ? STATUS_BG.warning
                  : "transparent";
              const timeColor = isCritical
                ? STATUS_COLOR.error
                : isWarning
                  ? STATUS_COLOR.warning
                  : "#6B6B6B";
              const horaIngreso = new Date(
                item.fecha_creacion,
              ).toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <tr key={item.id_orden} style={{ background: rowBg }}>
                  <td style={{ ...tdStyle, fontWeight: 600, fontSize: 12 }}>
                    {item.id_orden}
                  </td>
                  <td style={tdStyle}>{item.nombre_proveedor}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        background: "#F0EDE8",
                        borderRadius: 10,
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#1F1F1F",
                      }}
                    >
                      {ETAPA_LABEL[item.etapa_actual] ?? item.etapa_actual}
                    </span>
                  </td>
                  <td
                    style={{ ...tdStyle, textAlign: "right", color: "#6B6B6B" }}
                  >
                    {item.prepacks_recibidos}/{item.total_prepacks}
                  </td>
                  <td
                    style={{ ...tdStyle, textAlign: "right", color: "#6B6B6B" }}
                  >
                    {horaIngreso}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      fontWeight: 700,
                      color: timeColor,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {item.elapsed} min
                    {isCritical && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 10,
                          fontWeight: 700,
                          color: STATUS_COLOR.error,
                          background: STATUS_BG.error,
                          border: `1px solid ${STATUS_COLOR.error}40`,
                          borderRadius: 8,
                          padding: "1px 5px",
                          textTransform: "uppercase",
                        }}
                      >
                        Crítico
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </ChartCard>
  );
}

function buildStageData(preregistroKPIs, ordenesIncompletas, envioKPIs, envioPorTurno) {
  // shared table styles
  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    fontFamily: "Inter",
  };
  const thStyle = {
    textAlign: "left",
    padding: "8px 10px",
    fontSize: 11,
    fontWeight: 600,
    color: "#6B6B6B",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid #E7E2DC",
    background: "#FAFAF8",
  };
  const tdStyle = {
    padding: "9px 10px",
    borderBottom: "1px solid #F0EDE8",
    color: "#1F1F1F",
    verticalAlign: "middle",
  };
  const PIE_COLORS = ["#6E8B6B", "#A48F7A", "#C9963B", "#B65E4A", "#8B7355"];
  const CATEGORIA_COLOR = {
    estrella: "success",
    bueno: "warning",
    riesgo: "error",
  };

  // ---- PREREGISTRO ----
  const totalOrdenesRecibidas = preregistroKPIs.ordenes_recibidas;
  const ordenesInc = preregistroKPIs.ordenes_incompletas;
  const tasaCompletas = preregistroKPIs.tasa_completas;
  const provConIncidencias = preregistroKPIs.proveedores_con_incidencias;
  const semanaEnCurso = preregistroKPIs.semana_en_curso;
  const paretoPreregistro = (ordenesIncompletas || []).map((item) => ({
    proveedor: item.proveedor,
    incompletas: item.incompletas,
    pctAcum: item.pct_acumulado,
    banda:
      item.banda === "rojo"
        ? "error"
        : item.banda === "naranja"
          ? "warning"
          : "success",
  }));
  // ---- QA ----
  const totalPrepacks = 1640;
  const totalErroresQA = erroresPPPorProveedor.reduce(
    (s, d) => s + d.errores,
    0,
  );
  const tasaAceptacionQA = formatNumber(
    ((totalPrepacks - totalErroresQA) / totalPrepacks) * 100,
    1,
  );
  const totalRetornados = prepacksRetornadosQA.length;
  const proveedoresConRechazo = erroresPPPorProveedor.filter(
    (d) => d.errores >= 20,
  ).length;
  const motivoPrincipal = motivosRechazoQA.reduce((mx, d) =>
    d.cantidad > mx.cantidad ? d : mx,
  ).motivo;
  const paretoQA = calcularPareto(erroresPPPorProveedor, "errores");

  // ---- REGISTRO ----
  const prepsCrossDock = distribucionAlmacen.find(
    (d) => d.almacen === "Cross-dock",
  ).prepacks;
  const tiempoPromedioReg = formatNumber(
    average(tendenciaTiemposRegistro.map((d) => d.tiempoPromedio)),
    1,
  );
  const ppEnBacklog = backlogPPs.filter((d) => d.minutosEnSistema > 10).length;
  const mejorEquipo = rankingEquiposRegistro.reduce((best, e) =>
    parseInt(e.tiempoPromedio) < parseInt(best.tiempoPromedio) ? e : best,
  );

  // ---- SORTER ----
  const totalPaquetesSorter = paquetesPorBahia.reduce(
    (s, d) => s + d.paquetes,
    0,
  );
  const totalIncorrectos = paquetesIncorrectos.length;
  const tiempoActualSorter =
    tiempoSorterTendencia[tiempoSorterTendencia.length - 1].segundos;
  const bahiaMasCargadaSorter = paquetesPorBahia.reduce((mx, d) =>
    d.paquetes > mx.paquetes ? d : mx,
  );

  // ---- BAHÍAS ----
  const ocupaciones = capacidadBahias.map(
    (d) => (d.procesando / d.capacidad) * 100,
  );
  const ocupacionPromedio = formatNumber(average(ocupaciones), 1);
  const bahiasSaturadas = capacidadBahias.filter(
    (d) => (d.procesando / d.capacidad) * 100 > 90,
  ).length;
  const capacidadTotal = capacidadBahias.reduce((s, d) => s + d.capacidad, 0);
  const bahiaMasDescargada = capacidadBahias.reduce((mn, d) =>
    d.procesando / d.capacidad < mn.procesando / mn.capacidad ? d : mn,
  );
  const bahiaLineKeys = ["B01", "B02", "B03", "B04", "B05"];
  const bahiaLineColors = {
    B01: "#6E8B6B",
    B02: "#A48F7A",
    B03: "#B65E4A",
    B04: "#C9963B",
    B05: "#8B7355",
  };

  // ---- AUDITORÍA ----
  const tiempoPromedioAudit = formatNumber(
    average(cajasIncorrectas.map((d) => d.minutosAuditoria)),
    1,
  );
  const cajasConError = cajasIncorrectas.length;
  const cajasAuditadasHoy = distribucionTiemposAuditoria.reduce(
    (s, d) => s + d.cajas,
    0,
  );
  const tasaExitoAudit = formatNumber(
    ((cajasAuditadasHoy - cajasConError) / cajasAuditadasHoy) * 100,
    1,
  );

  // ---- ENVÍO ----
  const ordenesEnviadas = envioKPIs?.ordenes_enviadas ?? 0;
  const ordenesEnBacklog = envioKPIs?.ordenes_backlog ?? 0;
  const tiempoPromedioEnvio = formatNumber(envioKPIs?.tiempo_promedio ?? 0, 1);
  const ordenesCriticas = envioKPIs?.alertas_criticas ?? 0;
  const prepacksTransito = envioKPIs?.prepacks_transito ?? 0;

  return {
    preregistro: {
      title: "Preregistro",
      summary:
        "Entrada de órdenes al flujo, validando si cada orden llega completa antes de avanzar.",
      status: "warning",
      primaryKpi: {
        label: "Órdenes recibidas",
        value: totalOrdenesRecibidas,
        delta: 12,
        unit: "",
      },
      secondaryKpis: [
        {
          label: "Órdenes incompletas",
          value: ordenesInc,
          delta: -5,
          unit: "",
        },
        {
          label: "Tasa de órdenes completas",
          value: tasaCompletas,
          delta: 1.2,
          unit: "%",
        },
        {
          label: "Proveedores con incidencias",
          value: provConIncidencias,
          delta: 0,
          unit: "",
        },
        { label: "Semana", value: semanaEnCurso, delta: null, unit: "" },
      ],
      charts: [
        <ChartCard
          key="prereg-pareto"
          title="Órdenes incompletas por proveedor (Pareto)"
        >
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Proveedor</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Incompletas</th>
                <th style={{ ...thStyle, textAlign: "right" }}>% Acum</th>
              </tr>
            </thead>
            <tbody>
              {paretoPreregistro.map((item) => (
                <tr
                  key={item.proveedor}
                  style={{ background: STATUS_BG[item.banda] }}
                >
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      fontWeight: 700,
                      color: STATUS_COLOR[item.banda],
                    }}
                  >
                    {item.pctAcum}%
                  </td>
                  <td
                    style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}
                  >
                    {item.incompletas}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      fontWeight: 700,
                      color: STATUS_COLOR[item.banda],
                    }}
                  >
                    {item.pctAcum}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>,
        <TendenciaSemanalChart key="prereg-trend" />,
        <ProveedoresEstrellaTable key="prereg-stars" />,
      ],
    },

    qa: {
      title: "QA",
      summary:
        "Control del porcentaje de aceptación por proveedor y rechazo operativo antes del registro.",
      status: "warning",
      primaryKpi: {
        label: "Tasa de aceptación",
        value: tasaAceptacionQA,
        delta: 0.8,
        unit: "%",
      },
      secondaryKpis: [
        {
          label: "Prepacks retornados",
          value: totalRetornados,
          delta: -2,
          unit: "",
        },
        {
          label: "Proveedores con mayor rechazo",
          value: proveedoresConRechazo,
          delta: 0,
          unit: "",
        },
        {
          label: "Motivo principal",
          value: motivoPrincipal,
          delta: null,
          unit: "",
        },
        {
          label: "Total errores PP",
          value: totalErroresQA,
          delta: -8,
          unit: "",
        },
      ],
      charts: [
        <ChartCard key="qa-pareto" title="Errores por proveedor (Pareto)">
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Proveedor</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Errores</th>
                <th style={{ ...thStyle, textAlign: "right" }}>% Acum</th>
              </tr>
            </thead>
            <tbody>
              {paretoQA.map((item) => (
                <tr
                  key={item.proveedor}
                  style={{ background: STATUS_BG[item.banda] }}
                >
                  <td style={tdStyle}>{item.proveedor}</td>
                  <td
                    style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}
                  >
                    {item.errores}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      fontWeight: 700,
                      color: STATUS_COLOR[item.banda],
                    }}
                  >
                    {item.pctAcum}%
                  </td>
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
                <th style={{ ...thStyle, textAlign: "right" }}>Hora</th>
              </tr>
            </thead>
            <tbody>
              {prepacksRetornadosQA.map((item) => (
                <tr key={item.pp}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{item.pp}</td>
                  <td style={tdStyle}>{item.proveedor}</td>
                  <td style={tdStyle}>{item.motivo}</td>
                  <td style={tdStyle}>{item.equipo}</td>
                  <td
                    style={{ ...tdStyle, textAlign: "right", color: "#6B6B6B" }}
                  >
                    {item.hora}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>,
        <ChartCard key="qa-prenda" title="Rechazo por tipo de prenda">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={rechazosPorTipoPrenda}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 16, bottom: 4 }}
            >
              <CartesianGrid {...gridStyle} horizontal={false} />
              <XAxis type="number" tick={axisStyle} />
              <YAxis
                dataKey="tipo"
                type="category"
                tick={axisStyle}
                width={88}
              />
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
                label={({ motivo, percent }) =>
                  `${motivo}: ${(percent * 100).toFixed(0)}%`
                }
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
      title: "Registro",
      summary:
        "Ritmo de registro por equipo, distribución por almacén y avance del flujo hacia el sorter.",
      status: overallStatus(rankingEquiposRegistro.map((e) => e.status)),
      primaryKpi: {
        label: "Prepacks en Cross-dock",
        value: prepsCrossDock,
        delta: 14,
        unit: "",
      },
      secondaryKpis: [
        {
          label: "Tiempo promedio registro",
          value: tiempoPromedioReg,
          delta: -0.8,
          unit: "min",
        },
        {
          label: "PPs en backlog (>10 min)",
          value: ppEnBacklog,
          delta: 1,
          unit: "",
        },
        {
          label: "Mejor equipo",
          value: mejorEquipo.equipo,
          delta: null,
          unit: "",
        },
        {
          label: "Tiempo mejor equipo",
          value: mejorEquipo.tiempoPromedio,
          delta: null,
          unit: "",
        },
      ],
      charts: [
        /* ── Pastel con leyenda detallada ── */
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
                label={({ almacen, percent }) =>
                  `${almacen}: ${(percent * 100).toFixed(0)}%`
                }
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
                <th style={{ ...thStyle, textAlign: "right" }}>
                  Tiempo Promedio
                </th>
              </tr>
            </thead>
            <tbody>
              {rankingEquiposRegistro.map((item, i) => (
                <tr
                  key={item.equipo}
                  style={{ background: STATUS_BG[item.status] }}
                >
                  <td style={{ ...tdStyle, color: "#6B6B6B" }}>{i + 1}</td>
                  <td
                    style={{
                      ...tdStyle,
                      fontWeight: 600,
                      color: STATUS_COLOR[item.status],
                    }}
                  >
                    {item.equipo}
                  </td>
                  <td
                    style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}
                  >
                    {item.tiempoPromedio}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>,

        /* ── Backlog con alertas precisas y umbrales ── */
        <ChartCard key="reg-backlog" title="Backlog de PPs desde preregistro"
          footer={`Umbrales: ⚠ >10 min · 🔴 >20 min`}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>PP</th>
                <th style={thStyle}>Proveedor</th>
                <th style={thStyle}>Equipo</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Tiempo (min)</th>
              </tr>
            </thead>
            <tbody>
              {backlogPPs.map((item) => (
                <tr
                  key={item.pp}
                  style={{
                    background: getBacklogRowBg(item.minutosEnSistema, 10, 20),
                  }}
                >
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{item.pp}</td>
                  <td style={tdStyle}>{item.proveedor}</td>
                  <td style={tdStyle}>{item.equipo}</td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      fontWeight: 700,
                      color:
                        item.minutosEnSistema >= 20
                          ? STATUS_COLOR.error
                          : item.minutosEnSistema >= 10
                            ? STATUS_COLOR.warning
                            : "#1F1F1F",
                    }}
                  >
                    {item.minutosEnSistema}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>,

        /* ── Tendencia detallada con target, dots críticos y último valor ── */
        <ChartCard key="reg-tendencia" title="Tendencia de tiempos de registro por semana"
          footer={`Último: ${tendenciaTiemposRegistro[tendenciaTiemposRegistro.length - 1].tiempoPromedio} min`}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={tendenciaTiemposRegistro}
              margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="semana" tick={axisStyle} />
              <YAxis tick={axisStyle} domain={[8, 16]} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={10}
                stroke="#BBBBBB"
                strokeDasharray="4 4"
                label={{
                  value: "Target 10 min",
                  position: "insideTopRight",
                  fontSize: 11,
                  fill: "#BBBBBB",
                }}
              />
              <Line
                type="monotone"
                dataKey="tiempoPromedio"
                name="Tiempo prom (min)"
                stroke="#111111"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>,

        /* ── Rendimiento por equipo en Registro (barra precisa con ppMin y ppCrossDock) ── */
        <ChartCard key="reg-rendimiento" title="Rendimiento por equipo en Registro">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={rankingEquiposRegistro}
              margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="equipo" tick={axisStyle} />
              <YAxis tick={axisStyle} label={{ value: 'pp/min', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6B6B6B' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ppMin" name="pp/min total" radius={[3, 3, 0, 0]}>
                {rankingEquiposRegistro.map((item, i) => (
                  <Cell key={i} fill={STATUS_COLOR[item.status]} />
                ))}
              </Bar>
              <Bar dataKey="ppCrossDock" name="pp/min cross-dock" fill="#A48F7A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6B6B6B' }}>
              <div style={{ width: 10, height: 10, background: '#6E8B6B', borderRadius: 2 }} /> pp/min total
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6B6B6B' }}>
              <div style={{ width: 10, height: 10, background: '#A48F7A', borderRadius: 2 }} /> pp/min cross-dock
            </div>
          </div>
        </ChartCard>,
      ],
    },

    sorter: {
      title: "Sorter",
      summary:
        "Flujo único de clasificación con foco en distribución por bahía y paquetes incorrectamente sorteados.",
      status: "warning",
      primaryKpi: {
        label: "Paquetes clasificados hoy",
        value: totalPaquetesSorter,
        delta: 87,
        unit: "",
      },
      secondaryKpis: [
        {
          label: "Paquetes en bahía incorrecta",
          value: totalIncorrectos,
          delta: -2,
          unit: "",
        },
        {
          label: "Tiempo promedio por paquete",
          value: tiempoActualSorter,
          delta: -0.3,
          unit: "seg",
        },
        {
          label: "Bahía más cargada",
          value: bahiaMasCargadaSorter.bahia,
          delta: null,
          unit: "",
        },
        {
          label: "Paquetes bahía top",
          value: bahiaMasCargadaSorter.paquetes,
          delta: null,
          unit: "",
        },
      ],
      charts: [
        <ChartCard key="sorter-dist" title="Distribución de paquetes en bahías">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={paquetesPorBahia}
              margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="bahia" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="paquetes" fill="#A48F7A" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>,
        <ChartCard
          key="sorter-incorrectos"
          title="Paquetes sorteados incorrectamente"
        >
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>PP</th>
                <th style={{ ...thStyle, textAlign: "center" }}>
                  Bahía Actual
                </th>
                <th style={{ ...thStyle, textAlign: "center" }}>
                  Bahía Correcta
                </th>
                <th style={thStyle}>Equipo</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Hora</th>
              </tr>
            </thead>
            <tbody>
              {paquetesIncorrectos.map((item) => (
                <tr key={item.pp} style={{ background: STATUS_BG.error }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{item.pp}</td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "center",
                      fontWeight: 700,
                      color: STATUS_COLOR.error,
                    }}
                  >
                    {item.bahiaActual}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "center",
                      color: STATUS_COLOR.success,
                    }}
                  >
                    {item.bahiaCorrecta}
                  </td>
                  <td style={tdStyle}>{item.equipo}</td>
                  <td
                    style={{ ...tdStyle, textAlign: "right", color: "#6B6B6B" }}
                  >
                    {item.hora}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>,
        <ChartCard
          key="sorter-tiempo"
          title="Tiempo promedio del sorter (seg/paquete)"
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={tiempoSorterTendencia}
              margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="semana" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="segundos"
                name="Seg/paquete"
                stroke="#111111"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>,
      ],
    },

    bahias: {
      title: "Bahías",
      summary:
        "Ocupación a lo largo de los 10 carriles, tendencia histórica y capacidad disponible.",
      status: bahiasGeneral.status,
      primaryKpi: {
        label: "Ocupación promedio",
        value: ocupacionPromedio,
        delta: 2.1,
        unit: "%",
      },
      secondaryKpis: [
        {
          label: "Bahías saturadas (>90%)",
          value: bahiasSaturadas,
          delta: 1,
          unit: "",
        },
        {
          label: "Capacidad total",
          value: capacidadTotal,
          delta: 0,
          unit: "pp",
        },
        {
          label: "Bahía más descargada",
          value: bahiaMasDescargada.bahia,
          delta: null,
          unit: "",
        },
        {
          label: "Procesando en descargada",
          value: bahiaMasDescargada.procesando,
          delta: null,
          unit: "",
        },
      ],
      charts: [
        <BayGrid key="bay-grid" bahias={bahiasGeneral.bahias} />,
        <ChartCard
          key="bay-tendencia"
          title="Tendencia de ocupación por bahía (B01–B05)"
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={tendenciaOcupacionBahias}
              margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="semana" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              {bahiaLineKeys.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={key}
                  stroke={bahiaLineColors[key]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>,
        <ChartCard
          key="bay-capacidad"
          title="Capacidad disponible vs procesando por bahía"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={capacidadBahias}
              margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="bahia" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="capacidad"
                name="Capacidad"
                fill="#1F1F1F"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="procesando"
                name="Procesando"
                fill="#A48F7A"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>,
      ],
    },

    auditoria: {
      title: "Auditoría",
      summary:
        "Validación final con detalle de cajas incorrectas y distribución de tiempos de auditoría.",
      status: "warning",
      primaryKpi: {
        label: "Cajas auditadas hoy",
        value: cajasAuditadasHoy,
        delta: 8,
        unit: "",
      },
      secondaryKpis: [
        {
          label: "Tiempo promedio auditoría",
          value: tiempoPromedioAudit,
          delta: -0.4,
          unit: "min",
        },
        { label: "Cajas con error", value: cajasConError, delta: -1, unit: "" },
        {
          label: "Tasa de éxito",
          value: tasaExitoAudit,
          delta: 0.5,
          unit: "%",
        },
        {
          label: "Auditoría lenta (>8 min)",
          value: cajasIncorrectas.filter((d) => d.minutosAuditoria > 8).length,
          delta: 0,
          unit: "",
        },
      ],
      charts: [
        /* ── Lista completa: proveedor, piezas, badge de tipo y barra de tiempo ── */
        <ChartCard key="audit-cajas" title="Detalle completo de cajas incorrectas">
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Caja</th>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Proveedor</th>
                <th style={thStyle}>Equipo</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Tiempo (min)</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Hora</th>
              </tr>
            </thead>
            <tbody>
              {cajasIncorrectas.map((item) => (
                <tr key={item.caja}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{item.caja}</td>
                  <td style={tdStyle}>{item.tipo}</td>
                  <td style={tdStyle}>{item.equipo}</td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "right",
                      fontWeight: 700,
                      color:
                        item.minutosAuditoria > 8
                          ? STATUS_COLOR.error
                          : "#1F1F1F",
                    }}
                  >
                    {item.minutosAuditoria}
                  </td>
                  <td
                    style={{ ...tdStyle, textAlign: "right", color: "#6B6B6B" }}
                  >
                    {item.hora}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartCard>,
        <ChartCard
          key="audit-dist"
          title="¿Por qué tardan más algunos casos?"
          footer="Distribución de tiempos de auditoría"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={distribucionTiemposAuditoria}
              margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
            >
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="rango" tick={axisStyle} />
              <YAxis tick={axisStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cajas" name="Cajas" radius={[3, 3, 0, 0]}>
                {distribucionTiemposAuditoria.map((item, i) => (
                  <Cell
                    key={i}
                    fill={item.rango === "> 12 min" ? "#B65E4A" : "#A48F7A"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>,
      ],
    },

    envio: {
      title: "Envío",
      summary:
        "Cierre del flujo con backlog de órdenes pendientes y estatus general por proveedor.",
      status:
        ordenesCriticas > 0
          ? "error"
          : ordenesEnBacklog > 0
            ? "warning"
            : "success",
      primaryKpi: {
        label: "Órdenes enviadas hoy",
        value: ordenesEnviadas,
        delta: 1,
        unit: "",
      },
      secondaryKpis: [
        {
          label: "Órdenes en backlog (>30 min)",
          value: ordenesEnBacklog,
          delta: 0,
          unit: "",
        },
        {
          label: "Tiempo promedio total",
          value: tiempoPromedioEnvio,
          delta: -2.1,
          unit: "min",
        },
        {
          label: "Alertas críticas (≥40 min)",
          value: ordenesCriticas,
          delta: 0,
          unit: "",
        },
        {
          label: "Prepacks en tránsito",
          value: prepacksTransito,
          delta: null,
          unit: "",
        },
      ],
      charts: [
        <BacklogEnvioTable key="envio-backlog" />,
        <div key="envio-ordenes-activas" style={{ gridColumn: "span 2" }}>
          <OrdenesActivasTable />
        </div>,
        <ChartCard key="envio-turno" title="Envíos por turno" footer="Matutino 6-14 h · Vespertino 14-22 h">
          {envioPorTurno.length === 0 ? (
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#6B6B6B", fontSize: 13 }}>
              Sin envíos registrados hoy
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={envioPorTurno} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="turno" tick={axisStyle} />
                <YAxis tick={axisStyle} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="ordenes" name="Órdenes" fill="#111111" radius={[3, 3, 0, 0]} />
                <Bar dataKey="prepacks" name="Prepacks" fill="#A48F7A" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>,
      ],
    },
  };
}

export default function Dashboard() {
  const { kpis: preregistroKPIs } = usePreregistroKPIs();
  const { data: ordenesIncompletas } = useOrdenesIncompletas();
  const { kpis: envioKPIs, porTurno: envioPorTurno } = useEnvioKPIs();
  const [activeStage, setActiveStage] = useState(getCurrentStageId);
  const stageData = useMemo(
    () => buildStageData(preregistroKPIs, ordenesIncompletas, envioKPIs, envioPorTurno),
    [preregistroKPIs, ordenesIncompletas, envioKPIs, envioPorTurno],
  );
  const currentStage = stageData[activeStage] || stageData.preregistro;

  useEffect(() => {
    const syncStage = () => setActiveStage(getCurrentStageId());
    window.addEventListener("popstate", syncStage);

    if (!stageRoutes.some((stage) => window.location.pathname === stage.path)) {
      window.history.replaceState({}, "", "/dashboard/preregistro");
      syncStage();
    }

    return () => window.removeEventListener("popstate", syncStage);
  }, []);

  const onStageChange = (stage) => {
    setActiveStage(stage.id);
    goToPath(stage.path);
  };

  return (
    <div
      style={{
        padding: 24,
        background: "#F8F6F3",
        minHeight: "calc(100vh - 56px)",
      }}
    >
      <div style={{ display: "grid", gap: 18, marginBottom: 24 }}>
        <StageTabs activeStage={activeStage} onStageChange={onStageChange} />
        <SectionHeader
          title={currentStage.title}
          summary={currentStage.summary}
          status={currentStage.status}
        />
      </div>

      <KpiStrip
        primaryKpi={currentStage.primaryKpi}
        secondaryKpis={currentStage.secondaryKpis}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 18,
        }}
      >
        {currentStage.charts}
        {activeStage === "preregistro" ? (
          <RendimientoEquiposPreregistro />
        ) : (
          <TeamPerformance stageId={activeStage} />
        )}
      </div>
    </div>
  );
}