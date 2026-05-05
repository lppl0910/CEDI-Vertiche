import { useState, useEffect } from 'react';
import { fetchTicketZona, fetchRankingTiendas } from '../data/ventasApi';
import { SectionSep } from './SectionSep';
import { TwoCol } from './TwoCol';
import { TicketPromedioZonaChart } from './charts/TicketPromedioZonaChart';
import { DistribucionZonaTable } from './charts/DistribucionZonaTable';
import { RankingTiendasTable } from './charts/RankingTiendasTable';
import './styles/SectionTiendas.css';

export function SectionTiendas() {
  const [ticketData, setTicketData] = useState([]);
  const [tiendas, setTiendas] = useState([]);

  useEffect(() => {
    fetchTicketZona()
      .then(data => {
        const mapped = data.labels.map((mes, i) => ({
          mes,
          Norte: data.norte[i],
          Sur:   data.sur[i],
        }));
        setTicketData(mapped);
      })
      .catch(err => console.error('fetchTicketZona:', err));

    fetchRankingTiendas()
      .then(setTiendas)
      .catch(err => console.error('fetchRankingTiendas:', err));
  }, []);

  return (
    <div className="section-tiendas">
      <SectionSep label="Rendimiento por Tienda" />

      <TwoCol>
        <TicketPromedioZonaChart ticketData={ticketData} />
        <DistribucionZonaTable tiendas={tiendas} />
      </TwoCol>

      <RankingTiendasTable tiendas={tiendas} />
    </div>
  );
}