import { TOP_PRODS, SEASON_DATA, TALLAS } from '../data/ventasData';
import { SectionSep } from './SectionSep';
import { TwoCol } from './TwoCol';
import { TopProductosChart } from './charts/TopProductosChart';
import { ParetoSKUChart } from './charts/ParetoSKUChart';
import { VentasTemporadaChart } from './charts/VentasTemporadaChart';
import { UnidadesTallaChart } from './charts/UnidadesTallaChart';
import './styles/SectionProductos.css';

/** Calcula los datos del análisis de Pareto a partir de TOP_PRODS. */
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

/** Pivotea SEASON_DATA al formato { season, [cat]: value } que usa recharts. */
function buildStackedData() {
  const labels = ['Primavera', 'Verano', 'Otoño', 'Invierno'];
  return labels.map((season, si) => {
    const row = { season };
    SEASON_DATA.cats.forEach((cat, ci) => { row[cat] = SEASON_DATA.data[si][ci]; });
    return row;
  });
}

export function SectionProductos() {
  const paretoData   = buildParetoData(TOP_PRODS);
  const stackedData  = buildStackedData();
  const totalTallas  = TALLAS.reduce((sum, t) => sum + t.value, 0);

  return (
    <div className="section-productos">
      <SectionSep label="Análisis de Producto" />

      <TwoCol>
        <TopProductosChart products={TOP_PRODS} />
        <ParetoSKUChart paretoData={paretoData} />
      </TwoCol>

      <TwoCol>
        <VentasTemporadaChart stackedData={stackedData} />
        <UnidadesTallaChart tallas={TALLAS} totalUnidades={totalTallas} />
      </TwoCol>
    </div>
  );
}
