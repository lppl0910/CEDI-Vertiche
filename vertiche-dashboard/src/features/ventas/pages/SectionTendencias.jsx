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

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// filters contiene los parámetros de los filtros
// onStatusChange se usa para notificar a Ventas.jsx en caso de error global
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
