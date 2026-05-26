import { useEffect } from "react";
import { fetchYoY, fetchPerformance, fetchTrimestral, fetchFestivos } from "../data/ventasApi";
import { useVentasFetch } from "./useVentasFetch";
import { useSectionStatus } from "../hooks/useSectionStatus.js";
import { ChartStatus } from "./components/ChartStatus";
import { SectionSep } from "./SectionSep";
import { TwoCol } from "./TwoCol";
import { IngresosMensualesChart } from "./charts/IngresosMensualesChart";
import { IngresosUnidadesChart } from "./charts/IngresosUnidadesChart";
import { VentasTrimestralChart } from "./charts/VentasTrimestralChart";
import { FestivosVsNormalesGrid } from "./charts/FestivosVsNormalesGrid";
import "./styles/SectionTendencias.css";

// Etiquetas de meses para mapear los índices 0–11 que devuelve fetchYoY.
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/**
 * Sección "Tendencias Temporales" — 4 gráficas en 2 filas TwoCol.
 *
 * Fetches y filtros aplicados:
 *   yoyData:        fetchYoY(zona, temporada)              — sin period (siempre 12 meses)
 *   lineData:       fetchPerformance(period, zona, temporada)
 *   trimestralData: fetchTrimestral(zona)                  — solo zona
 *   festivosData:   fetchFestivos(period, zona, temporada)
 *
 * `render(fetchResult, children)` centraliza el manejo de loading/error/empty
 * para que el JSX del return sea declarativo sin condicionales repetidos.
 *
 * @param {Object} props
 * @param {{ period: string, zona: string, temporada: string }} props.filters
 * @param {(status: string) => void} [props.onStatusChange]
 */
export function SectionTendencias({ filters, onStatusChange }) {
  const { period, zona, temporada } = filters;

  const yoyData        = useVentasFetch(() => fetchYoY({ zona, temporada }),                 [zona, temporada]);
  const lineData       = useVentasFetch(() => fetchPerformance({ period, zona, temporada }), [period, zona, temporada]);
  const trimestralData = useVentasFetch(() => fetchTrimestral({ zona }),                     [zona]);
  const festivosData   = useVentasFetch(() => fetchFestivos({ period, zona, temporada }),    [period, zona, temporada]);

  const { sectionStatus } = useSectionStatus(yoyData, lineData, trimestralData, festivosData);

  useEffect(() => {
    onStatusChange?.(sectionStatus);
  }, [sectionStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const render = ({ status, data, error, retry }, children) => {
    if (status === "loading")
      return <div className="chart-loading">Cargando...</div>;
    if (status === "error" || status === "empty")
      return <ChartStatus type={status} message={error} onRetry={retry} />;
    return children(data);
  };

  // Si todos los fetches fallaron o están vacíos → un solo mensaje para la sección
  if (sectionStatus === "error" || sectionStatus === "empty") {
    return (
      <div className="section-tendencias">
        <SectionSep label="Tendencias Temporales" />
        <ChartStatus
          type={sectionStatus}
          message="No se pudieron cargar los datos de esta sección"
        />
      </div>
    );
  }

  return (
    <div className="section-tendencias">
      <SectionSep label="Tendencias Temporales" />

      <TwoCol>
        {render(yoyData, (data) => {
          const mapped = MESES.map((mes, i) => ({
            mes,
            2025: data.actual?.[i]   ?? 0,
            2024: data.anterior?.[i] ?? 0,
          }));
          return <IngresosMensualesChart yoyData={mapped} />;
        })}
        {render(lineData, (data) => {
          // '7d' usa etiquetas de día (Lun/Mar...) y '1y' usa meses (Ene/Feb...) — ya legibles.
          // '30d' y '90d' devuelven números de semana que se prefijarean con 'S'.
          // Las unidades se dividen entre 10 para que la escala del eje derecho sea comparable.
          const mapped = data.labels.map((label, i) => ({
            label: data.period === "7d" || data.period === "1y" ? label : `S${label}`,
            ingresos: data.revenue[i],
            unidades: +(data.units[i] / 10).toFixed(1),
          }));
          return <IngresosUnidadesChart lineData={mapped} />;
        })}
      </TwoCol>

      <TwoCol>
        {render(trimestralData, (data) => (
          <VentasTrimestralChart data={data} />
        ))}
        {render(festivosData, (data) => (
          <FestivosVsNormalesGrid data={data} />
        ))}
      </TwoCol>
    </div>
  );
}
