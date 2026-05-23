import { useEffect } from "react";
import { fetchTallas, fetchTemporadasCategoria, fetchTopProductos } from "../data/ventasApi";
import { useVentasFetch } from "./useVentasFetch";
import { useSectionStatus } from "../hooks/useSectionStatus.js";
import { ChartStatus } from "./components/ChartStatus";
import { SectionSep } from "./SectionSep";
import { TwoCol } from "./TwoCol";
import { TopProductosChart } from "./charts/TopProductosChart";
import { ParetoSKUChart } from "./charts/ParetoSKUChart";
import { VentasTemporadaChart } from "./charts/VentasTemporadaChart";
import { UnidadesTallaChart } from "./charts/UnidadesTallaChart";
import "./styles/SectionProductos.css";

function buildParetoData(products) {
  const sorted = [...products].sort((a, b) => b.rev - a.rev);
  const total  = sorted.reduce((sum, p) => sum + p.rev, 0);
  let cumulative = 0;
  return sorted.map(p => {
    cumulative += p.rev;
    return {
      name: p.name.split(" ").slice(0, 2).join(" "),
      rev:  p.rev,
      pct:  +((cumulative / total) * 100).toFixed(1),
    };
  });
}

// filters contiene los parámetros de los filtros
// onStatusChange se usa para notificar a Ventas.jsx en caso de error global
export function SectionProductos({ filters, onStatusChange }) {
  const { period, zona, temporada } = filters;

  const topProductos = useVentasFetch(
    () => fetchTopProductos({ period, zona, temporada }),
    [period, zona, temporada],
  );
  const seasonData = useVentasFetch(
    () => fetchTemporadasCategoria({ zona }),
    [zona],
  );
  const tallas = useVentasFetch(
    () => fetchTallas({ period, zona, temporada }),
    [period, zona, temporada],
  );

  const { sectionStatus } = useSectionStatus(topProductos, seasonData, tallas);

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

  if (sectionStatus === "error" || sectionStatus === "empty") {
    return (
      <div className="section-productos">
        <SectionSep label="Análisis de Producto" />
        <ChartStatus
          type={sectionStatus}
          message="No se pudieron cargar los datos de esta sección"
        />
      </div>
    );
  }

  return (
    <div className="section-productos">
      <SectionSep label="Análisis de Producto" />

      <TwoCol>
        {render(topProductos, (data) => (
          <TopProductosChart products={data} />
        ))}
        {render(topProductos, (data) => (
          <ParetoSKUChart paretoData={buildParetoData(data)} />
        ))}
      </TwoCol>

      <TwoCol>
        {render(seasonData, (data) => (
          <VentasTemporadaChart
            stackedData={data.stackedData}
            cats={data.cats}
            colors={data.colors}
          />
        ))}
        {render(tallas, (data) => (
          <UnidadesTallaChart tallas={data} />
        ))}
      </TwoCol>
    </div>
  );
}
