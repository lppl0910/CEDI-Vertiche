import { useEffect } from "react";
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

// filters contiene los parámetros de los filtros
// onStatusChange se usa para notificar a Ventas.jsx en caso de error global
export function SectionTiendas({ filters, onStatusChange }) {
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
        {render(tiendas, (data) => (
          <DistribucionZonaTable tiendas={data} />
        ))}
      </TwoCol>

      {render(mapa, (data) => (
        <MapaCalorMexico data={data} zona={zona} />
      ))}

      {render(tiendas, (data) => (
        <RankingTiendasTable tiendas={data} />
      ))}
    </div>
  );
}
