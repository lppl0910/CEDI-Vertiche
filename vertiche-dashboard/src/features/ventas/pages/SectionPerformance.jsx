import { useEffect } from "react";
import { DATA } from "../data/ventasData";
import { fetchPerformance } from "../data/ventasApi";
import { useVentasFetch } from "./useVentasFetch";
import { useSectionStatus } from "../hooks/useSectionStatus.js";
import { ChartStatus } from "./components/ChartStatus";
import { SectionSep } from "./SectionSep";
import { C } from "./CONSTANTES";
import { VentasKPI } from "./VentasKPI";
import "./styles/SectionPerformance.css";

// filters contiene los parámetros de los filtros
// onStatusChange se usa para notificar a Ventas.jsx en caso de error global
export function SectionPerformance({ filters, onStatusChange }) {
  const { period, zona, temporada } = filters;

  const performance = useVentasFetch(
    () => fetchPerformance({ period, zona, temporada }),
    [period, zona, temporada],
  );

  const { sectionStatus } = useSectionStatus(performance);

  useEffect(() => {
    onStatusChange?.(sectionStatus);
  }, [sectionStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // KPIs: datos reales si llegaron, fallback si no
  const kpis = performance.status === "success" && performance.data?.kpis
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

      {performance.status !== "loading" && (
        <div className="section-performance__kpi-grid">
            <VentasKPI key={i} kpi={kpi} />
          ))}
        </div>
      )}

      {performance.status === "empty" && (
        <ChartStatus type="empty" />
      )}

    </div>
  );
}
