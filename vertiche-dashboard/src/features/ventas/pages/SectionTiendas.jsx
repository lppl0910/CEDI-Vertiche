import { useState, useEffect } from 'react';
import { fetchTicketZona, fetchRankingTiendas,fetchVentasEstado } from '../data/ventasApi';
import { SectionSep } from './SectionSep';
import { TwoCol } from './TwoCol';
import { TicketPromedioZonaChart } from './charts/TicketPromedioZonaChart';
import { DistribucionZonaTable } from './charts/DistribucionZonaTable';
import { RankingTiendasTable } from './charts/RankingTiendasTable';
import './styles/SectionTiendas.css';

import { MapaCalorMexico } from './charts/MapaCalorMexico';

export function SectionTiendas({ filters }) {
  const [ticketData, setTicketData]   = useState([]);
  const [tiendas, setTiendas]         = useState([]);
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [loadingTiendas, setLoadingTiendas] = useState(true);
  const [estadosData, setEstadosData] = useState([]);
  const [loadingMapa, setLoadingMapa] = useState(true);

  // Ticket Promedio — period y temporada (sin zona)
  useEffect(() => {
    setLoadingTicket(true);
    fetchTicketZona({ period: filters.period, temporada: filters.temporada })
      .then(data => {
        const mapped = data.labels.map((mes, i) => ({
          mes,
          Norte: data.norte[i],
          Sur:   data.sur[i],
        }));
        setTicketData(mapped);
      })
      .catch(err => console.error('fetchTicketZona:', err))
      .finally(() => setLoadingTicket(false));
  }, [filters.period, filters.temporada]);

  // Ranking + Distribución — los 3 filtros
  useEffect(() => {
    setLoadingTiendas(true);
    fetchRankingTiendas(filters)
      .then(setTiendas)
      .catch(err => console.error('fetchRankingTiendas:', err))
      .finally(() => setLoadingTiendas(false));
  }, [filters.period, filters.zona, filters.temporada]);

  const loading = (
    <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Cargando...</div>
  );

  useEffect(() => {
    setLoadingMapa(true);
    fetchVentasEstado(filters)
      .then(setEstadosData)
      .catch(err => console.error('fetchVentasEstado:', err))
      .finally(() => setLoadingMapa(false));
  }, [filters.period, filters.zona, filters.temporada]);

  return (
    <div className="section-tiendas">
      <SectionSep label="Rendimiento por Tienda" />

      <TwoCol>
        {loadingTicket  ? loading : <TicketPromedioZonaChart ticketData={ticketData} />}
        {loadingTiendas ? loading : <DistribucionZonaTable tiendas={tiendas} />}
      </TwoCol>
      {loadingMapa
        ? <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Cargando mapa...</div>
        : <MapaCalorMexico data={estadosData} zona={filters.zona} />
      }
      {loadingTiendas ? loading : <RankingTiendasTable tiendas={tiendas} />}
    </div>
  );
}