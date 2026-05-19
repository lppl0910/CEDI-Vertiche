import {
  DATA,
  // yoy24,
  // yoy23,
  QUARTERLY_REVENUE,
  FESTIVOS_DATA,
} from "../data/ventasData";
import {
  fetchYoY,
  fetchPerformance,
  fetchTrimestral,
  fetchFestivos,
} from "../data/ventasApi";
import { ChartStatus } from "./components/ChartStatus";
import { useVentasFetch } from "./useVentasFetch";
import { SectionSep } from "./SectionSep";
import { TwoCol } from "./TwoCol";
import { IngresosMensualesChart } from "./charts/IngresosMensualesChart";
import { IngresosUnidadesChart } from "./charts/IngresosUnidadesChart";
import { VentasTrimestralChart } from "./charts/VentasTrimestralChart";
import { FestivosVsNormalesGrid } from "./charts/FestivosVsNormalesGrid";
import "./styles/SectionTendencias.css";

const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export function SectionTendencias({ filters }) {
  const { period, zona, temporada } = filters;
  // const d = DATA[period] || DATA["30d"];

  const yoyData = useVentasFetch(
    () => fetchYoY({ zona, temporada }),
    [zona, temporada],
  );

  const lineData = useVentasFetch(
    () => fetchPerformance({ period, zona, temporada }),
    [period, zona, temporada],
  );

  const trimestralData = useVentasFetch(
    () => fetchTrimestral({ zona }),
    [zona],
  );

  const festivosData = useVentasFetch(
    () => fetchFestivos({ period, zona, temporada }),
    [period, zona, temporada],
  );

  // Helper para no repetir el if loading/error/empty
  const render = ({ status, data, error, retry }, emptyCheck, children) => {
    if (status === "loading")
      return <div className="chart-loading">Cargando...</div>;
    if (status === "error" || status === "empty") {
      return <ChartStatus type={status} message={error} onRetry={retry} />;
    }
    return children(data);
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="section-tendencias">
      <SectionSep label="Tendencias Temporales" />

      <TwoCol>
        {render(yoyData, null, (data) => {
          const mapped = MESES.map((mes, i) => ({
            mes,
            2025: data.actual?.[i] ?? 0,
            2024: data.anterior?.[i] ?? 0,
          }));
          return <IngresosMensualesChart yoyData={mapped} />;
        })}
        {render(lineData, null, (data) => {
          const mapped = data.labels.map((label, i) => ({
            label:
              data.period === "7d" || data.period === "1y"
                ? label
                : `S${label}`,
            ingresos: data.revenue[i],
            unidades: +(data.units[i] / 10).toFixed(1),
          }));
          return <IngresosUnidadesChart lineData={mapped} />;
        })}
      </TwoCol>

      <TwoCol>
        {render(trimestralData, null, (data) => (
          <VentasTrimestralChart data={data} />
        ))}
        {render(festivosData, null, (data) => (
          <FestivosVsNormalesGrid data={data} />
        ))}
      </TwoCol>
    </div>
  );
}
