import { useContext, useEffect } from "react";
import { ContextoFiltros } from "./Contexto";
import {
  fetchTicketZona,
  fetchRankingTiendas,
  fetchVentasEstado,
} from "../data/ventasApi";
import { useVentasFetch } from "./useVentasFetch";
import { useSectionStatus } from "../hooks/useSectionStatus.js";
import { ChartStatus } from "./components/ChartStatus";
import { SectionSep } from "./SectionSep";
import { TwoCol } from "./TwoCol";
import { TicketPromedioZonaChart } from "./charts/TicketPromedioZonaChart";
import { DistribucionZonaTable } from "./charts/DistribucionZonaTable";
import { RankingTiendasTable } from "./charts/RankingTiendasTable";
import { MapaCalorMexico } from "./charts/MapaCalorMexico";
import "./styles/SectionTiendas.css";

/**
 * Sección "Rendimiento por Tienda" — ticket, tabla de distribución, mapa y ranking.
 *
 * Fetches y filtros aplicados:
 *   ticket:  fetchTicketZona(period, temporada)            — zona OMITIDA intencionalmente
 *   tiendas: fetchRankingTiendas(period, zona, temporada)
 *   mapa:    fetchVentasEstado(period, zona, temporada)
 *
 * DECISIÓN: fetchTicketZona omite `zona` porque el propósito de TicketPromedioZonaChart
 * es comparar Norte vs Sur. Enviar zona=Norte eliminaría la columna Sur y rompería
 * esa comparación. El endpoint sí acepta `zona` — es una elección del caller, no del API.
 *
 * @param {Object} props
 * @param {{ period: string, zona: string, temporada: string }} props.filters
 * @param {(status: string) => void} [props.onStatusChange]
 */
export function SectionTiendas({ onStatusChange }) {
  const { period, zona, temporada } = useContext(ContextoFiltros);

  const ticket = useVentasFetch(
    () => fetchTicketZona({ period, temporada }),
    [period, temporada],
  );
  const tiendas = useVentasFetch(
    () => fetchRankingTiendas({ period, zona, temporada }),
    [period, zona, temporada],
  );
  const mapa = useVentasFetch(
    () => fetchVentasEstado({ period, zona, temporada }),
    [period, zona, temporada],
  );

  const { sectionStatus } = useSectionStatus(ticket, tiendas, mapa);

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
      <div className="section-tiendas">
        <SectionSep label="Rendimiento por Tienda" />
        <ChartStatus
          type={sectionStatus}
          message="No se pudieron cargar los datos de esta sección"
        />
      </div>
    );
  }

  // Transforma { labels[], norte[], sur[] } → [{ mes, Norte, Sur }]
  // para el formato de objeto que espera Recharts BarChart.
  const ticketMapped = ticket.data
    ? ticket.data.labels.map((label, i) => ({
        mes: label,
        Norte: ticket.data.norte[i],
        Sur: ticket.data.sur[i],
      }))
    : [];

  return (
    <div className="section-tiendas">
      <SectionSep label="Rendimiento por Tienda" />

      <TwoCol>
        {render(ticket, () => (
          <TicketPromedioZonaChart ticketData={ticketMapped} />
        ))}
        {render(mapa, (data) => (
          <MapaCalorMexico data={data} zona={zona} />
        ))}
      </TwoCol>

      {render(tiendas, (data) => (
        <RankingTiendasTable tiendas={data} />
      ))}
    </div>
  );
}
