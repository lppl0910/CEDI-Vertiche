import { DATA } from "../data/ventasData";
import { fetchPerformance } from "../data/ventasApi";
import { useVentasFetch } from "./useVentasFetch";
import { ChartStatus } from "./components/ChartStatus";
import { SectionSep } from "./SectionSep";
import { C } from "./CONSTANTES";
import { VentasKPI } from "./VentasKPI";
import "./styles/SectionPerformance.css";

export function SectionPerformance({ filters }) {
  const { period, zona, temporada } = filters;

  const fallback = DATA[period] || DATA["30d"];
  const insightBorderColor =
    fallback.insight?.type === "warn" ? C.warning : C.success;

  const performance = useVentasFetch(
    () => fetchPerformance({ period, zona, temporada }),
    [period, zona, temporada],
  );

  // Usa los KPIs del backend si ya cargaron, si no los del fallback
  const kpis =
    performance.status === "success" && performance.data?.kpis
      ? performance.data.kpis
      : fallback.kpis;

  return (
    <div className="section-performance">
      <SectionSep label="Performance General" />

      {performance.status === "loading" && (
        <div className="chart-loading">Cargando...</div>
      )}

      {performance.status === "error" && (
        <ChartStatus
          type="error"
          message={performance.error}
          onRetry={performance.retry}
        />
      )}

      {/* Muestra KPIs en todos los estados excepto loading:
          - 'success' → datos reales del backend
          - 'empty'   → fallback (no hay datos para el filtro)
          - 'error'   → fallback mientras se muestra el mensaje de error */}
      {performance.status !== "loading" && (
        <div className="section-performance__kpi-grid">
          {kpis.map((kpi, i) => (
            <VentasKPI key={i} kpi={kpi} />
          ))}
        </div>
      )}

      {performance.status === "empty" && <ChartStatus type="empty" />}

      {fallback.insight && (
        <div
          className="section-performance__insight"
          style={{ borderLeft: `3px solid ${insightBorderColor}` }}
        >
          <div className="section-performance__insight-title">
            {fallback.insight.title}
          </div>
          <div className="section-performance__insight-body">
            {fallback.insight.text}
          </div>
        </div>
      )}
    </div>
  );
}
