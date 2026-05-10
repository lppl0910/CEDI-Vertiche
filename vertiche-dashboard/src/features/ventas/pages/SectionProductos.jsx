import { useState, useEffect } from 'react';
import { fetchTallas, fetchTemporadasCategoria, fetchTopProductos } from '../data/ventasApi';
import { SectionSep } from './SectionSep';
import { TwoCol } from './TwoCol';
import { TopProductosChart } from './charts/TopProductosChart';
import { ParetoSKUChart } from './charts/ParetoSKUChart';
import { VentasTemporadaChart } from './charts/VentasTemporadaChart';
import { UnidadesTallaChart } from './charts/UnidadesTallaChart';
import './styles/SectionProductos.css';

function buildParetoData(products) {
  const sorted = [...products].sort((a, b) => b.rev - a.rev);
  const total  = sorted.reduce((sum, p) => sum + p.rev, 0);
  let cumulative = 0;
  return sorted.map(p => {
    cumulative += p.rev;
    return {
      name: p.name.split(' ').slice(0, 2).join(' '),
      rev:  p.rev,
      pct:  +((cumulative / total) * 100).toFixed(1),
    };
  });
}

export function SectionProductos({ filters }) {
  const { period, zona, temporada } = filters;

  const [topProductos, setTopProductos]   = useState([]);
  const [tallas, setTallas]               = useState([]);
  const [seasonData, setSeasonData]       = useState({ cats: [], colors: [], stackedData: [] });
  const [loadingTop, setLoadingTop]       = useState(true);
  const [loadingTallas, setLoadingTallas] = useState(true);
  const [loadingSeason, setLoadingSeason] = useState(true);

  // Top Productos + Pareto — los 3 filtros
  useEffect(() => {
    fetchTopProductos({ period, zona, temporada })
      .then(data => {
        setTopProductos(data);
        setLoadingTop(false);
      })
      .catch(err => {
        console.error('fetchTopProductos:', err);
        setLoadingTop(false);
      });
  }, [period, zona, temporada]);

  // Temporada × Categoría — solo zona
  useEffect(() => {
    fetchTemporadasCategoria({ zona })
      .then(data => {
        setSeasonData(data);
        setLoadingSeason(false);
      })
      .catch(err => {
        console.error('fetchTemporadasCategoria:', err);
        setLoadingSeason(false);
      });
  }, [zona]);

  // Tallas — los 3 filtros
  useEffect(() => {
    fetchTallas({ period, zona, temporada })
      .then(data => {
        setTallas(data);
        setLoadingTallas(false);
      })
      .catch(err => {
        console.error('fetchTallas:', err);
        setLoadingTallas(false);
      });
  }, [period, zona, temporada]);

  const loading = <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Cargando...</div>;

  return (
    <div className="section-productos">
      <SectionSep label="Análisis de Producto" />

      <TwoCol>
        {loadingTop ? loading : <TopProductosChart products={topProductos} />}
        {loadingTop ? loading : <ParetoSKUChart paretoData={buildParetoData(topProductos)} />}
      </TwoCol>

      <TwoCol>
        {loadingSeason
          ? loading
          : <VentasTemporadaChart
              stackedData={seasonData.stackedData}
              cats={seasonData.cats}
              colors={seasonData.colors}
            />
        }
        {loadingTallas ? loading : <UnidadesTallaChart tallas={tallas} />}
      </TwoCol>
    </div>
  );
}
