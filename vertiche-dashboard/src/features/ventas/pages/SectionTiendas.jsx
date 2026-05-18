// SectionTiendas.jsx — diff mínimo
import { useVentasFetch } from "./useVentasFetch.js";
import { ChartStatus } from "./components/ChartStatus.jsx";
import {
  fetchTicketZona,
  fetchRankingTiendas,
  fetchVentasEstado,
} from "../data/ventasApi";
import { SectionSep } from "./SectionSep";
import { TwoCol } from "./TwoCol";
import { TicketPromedioZonaChart } from "./charts/TicketPromedioZonaChart";
import { DistribucionZonaTable } from "./charts/DistribucionZonaTable";
import { RankingTiendasTable } from "./charts/RankingTiendasTable";
import { MapaCalorMexico } from "./charts/MapaCalorMexico";
import "./styles/SectionTiendas.css";

export function SectionTiendas({ filters }) {
  const { period, zona, temporada } = filters;

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

  // Helper para no repetir el if loading/error/empty
  const render = ({ status, data, error, retry }, emptyCheck, children) => {
    if (status === "loading")
      return <div className="chart-loading">Cargando...</div>;
    if (status === "error" || status === "empty"){
      return <ChartStatus type={status} message={error} onRetry={retry} />;}
    return children(data);
  };

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
        {render(ticket, null, () => (
          <TicketPromedioZonaChart ticketData={ticketMapped} />
        ))}
        {render(tiendas, null, () => (
          <DistribucionZonaTable tiendas={tiendas.data} />
        ))}
      </TwoCol>
      {render(mapa, null, () => (
        <MapaCalorMexico data={mapa.data} zona={zona} />
      ))}
      {render(tiendas, null, () => (
        <RankingTiendasTable tiendas={tiendas.data} />
      ))}
    </div>
  );
}
