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
  const [topProductos, setTopProductos] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [seasonData, setSeasonData] = useState({ cats: [], colors: [], stackedData: [] });

  useEffect(() => {
    fetchTallas(filters.period, filters.zona)
      .then(setTallas)
      .catch(err => console.error('fetchTallas:', err));

    fetchTemporadasCategoria(filters.period, filters.zona)
      .then(setSeasonData)
      .catch(err => console.error('fetchTemporadasCategoria:', err));

    fetchTopProductos(filters.period, filters.zona)
      .then(setTopProductos)
      .catch(err => console.error('fetchTopProductos:', err));
  }, [filters]);

  return (
    <div className="section-productos">
      <SectionSep label="Análisis de Producto" />

      <TwoCol>
        <TopProductosChart products={topProductos} />
        <ParetoSKUChart paretoData={buildParetoData(topProductos)} />
      </TwoCol>

      <TwoCol>
        <VentasTemporadaChart
          stackedData={seasonData.stackedData}
          cats={seasonData.cats}
          colors={seasonData.colors}
        />
        <UnidadesTallaChart tallas={tallas} />
      </TwoCol>
    </div>
  );
}