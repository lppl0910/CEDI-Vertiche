import { useContext, useEffect } from "react";
import { ContextoFiltros } from "./Contexto";
import { DATA } from "../data/ventasData";
import { fetchPerformance } from "../data/ventasApi";
import { useVentasFetch } from "./useVentasFetch";
import { useSectionStatus } from "../hooks/useSectionStatus.js";
import { ChartStatus } from "./components/ChartStatus";
import { SectionSep } from "./SectionSep";
import { C } from "./CONSTANTES";
import { VentasKPI } from "./VentasKPI";
import "./styles/SectionPerformance.css";

/**
 * Sección de KPIs generales de performance — siempre visible en la parte superior.
 * Realiza un único fetch a /performance y renderiza las tarjetas VentasKPI.
 *
 * Si el fetch falla, notifica a Ventas.jsx via onStatusChange. Ventas combina
 * este estado con el de la sección activa para decidir si mostrar el error global.
 *
 * @param {Object} props
 * @param {{ period: string, zona: string, temporada: string }} props.filters
 * @param {(status: string) => void} [props.onStatusChange]
 *   Callback que recibe el sectionStatus cada vez que cambia.
 */
export function SectionPerformance({ onStatusChange }) {
  const { period, zona, temporada } = useContext(ContextoFiltros);

  const performance = useVentasFetch(
    () => fetchPerformance({ period, zona, temporada }),
    [period, zona, temporada],
  );

  const { sectionStatus } = useSectionStatus(performance);

  useEffect(() => {
    onStatusChange?.(sectionStatus);
  }, [sectionStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  // KPIs: datos reales si llegaron, fallback si no
  const kpis =
    performance.status === "success" && performance.data?.kpis
      ? performance.data.kpis
      : [];

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
          {kpis.map((kpi, i) => (
            <VentasKPI key={i} kpi={kpi} />
          ))}
        </div>
      )}

      {performance.status === "empty" && <ChartStatus type="empty" />}
    </div>
  );
}
