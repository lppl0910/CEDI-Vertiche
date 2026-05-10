import { useState, useEffect } from 'react';
import { fetchTicketZona, fetchRankingTiendas, fetchVentasEstado } from '../data/ventasApi';
import { SectionSep } from './SectionSep';
import { TwoCol } from './TwoCol';
import { TicketPromedioZonaChart } from './charts/TicketPromedioZonaChart';
import { DistribucionZonaTable } from './charts/DistribucionZonaTable';
import { RankingTiendasTable } from './charts/RankingTiendasTable';
import { MapaCalorMexico } from './charts/MapaCalorMexico';
import './styles/SectionTiendas.css';

export function SectionTiendas({ filters }) {
  const { period, zona, temporada } = filters;

  const [ticketData, setTicketData]         = useState([]);
  const [tiendas, setTiendas]               = useState([]);
  const [estadosData, setEstadosData]       = useState([]);
  const [loadingTicket, setLoadingTicket]   = useState(true);
  const [loadingTiendas, setLoadingTiendas] = useState(true);
  const [loadingMapa, setLoadingMapa]       = useState(true);

  // Ticket Promedio — period y temporada (sin zona)
  useEffect(() => {
    fetchTicketZona({ period, temporada })
      .then(data => {
        const mapped = data.labels.map((label, i) => ({
          mes:   label,
          Norte: data.norte[i],
          Sur:   data.sur[i],
        }));
        setTicketData(mapped);
        setLoadingTicket(false);
      })
      .catch(err => {
        console.error('fetchTicketZona:', err);
        setLoadingTicket(false);
      });
  }, [period, temporada]);

  // Ranking + Distribución — los 3 filtros
  useEffect(() => {
    fetchRankingTiendas({ period, zona, temporada })
      .then(data => {
        setTiendas(data);
        setLoadingTiendas(false);
      })
      .catch(err => {
        console.error('fetchRankingTiendas:', err);
        setLoadingTiendas(false);
      });
  }, [period, zona, temporada]);

  // Mapa de calor — los 3 filtros
  useEffect(() => {
    fetchVentasEstado({ period, zona, temporada })
      .then(data => {
        setEstadosData(data);
        setLoadingMapa(false);
      })
      .catch(err => {
        console.error('fetchVentasEstado:', err);
        setLoadingMapa(false);
      });
  }, [period, zona, temporada]);

  const loading = (
    <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Cargando...</div>
  );

  return (
    <div className="section-tiendas">
      <SectionSep label="Rendimiento por Tienda" />

      <TwoCol>
        {loadingTicket  ? loading : <TicketPromedioZonaChart ticketData={ticketData} />}
        {loadingTiendas ? loading : <DistribucionZonaTable tiendas={tiendas} />}
      </TwoCol>

      {loadingMapa
        ? <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Cargando mapa...</div>
        : <MapaCalorMexico data={estadosData} zona={zona} />
      }

      {loadingTiendas ? loading : <RankingTiendasTable tiendas={tiendas} />}
    </div>
  );
}
