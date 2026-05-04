import { TICKET_ZONA, TIENDAS } from '../data/ventasData';
import { SectionSep } from './SectionSep';
import { TwoCol } from './TwoCol';
import { TicketPromedioZonaChart } from './charts/TicketPromedioZonaChart';
import { DistribucionZonaTable } from './charts/DistribucionZonaTable';
import { RankingTiendasTable } from './charts/RankingTiendasTable';
import './styles/SectionTiendas.css';

export function SectionTiendas() {
  const ticketData = TICKET_ZONA.labels.map((mes, i) => ({
    mes,
    Norte: TICKET_ZONA.norte[i],
    Sur:   TICKET_ZONA.sur[i],
  }));

  return (
    <div className="section-tiendas">
      <SectionSep label="Rendimiento por Tienda" />

      <TwoCol>
        <TicketPromedioZonaChart ticketData={ticketData} />
        <DistribucionZonaTable tiendas={TIENDAS} />
      </TwoCol>

      <RankingTiendasTable tiendas={TIENDAS} />
    </div>
  );
}
