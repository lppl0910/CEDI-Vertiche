import { DATA, yoy24, yoy23 } from '../data/ventasData';
import { SectionSep } from './SectionSep';
import { TwoCol } from './TwoCol';
import { IngresosMensualesChart } from './charts/IngresosMensualesChart';
import { IngresosUnidadesChart } from './charts/IngresosUnidadesChart';
import { VentasTrimestralChart } from './charts/VentasTrimestralChart';
import { FestivosVsNormalesGrid } from './charts/FestivosVsNormalesGrid';
import './styles/SectionTendencias.css';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function SectionTendencias({ filters }) {
  const d = DATA[filters.period] || DATA['30d'];

  const yoyData = MESES.map((mes, i) => ({
    mes,
    '2024': yoy24[i],
    '2023': yoy23[i],
  }));

  const lineData = d.labels.map((label, i) => ({
    label,
    ingresos: d.revenue[i],
    unidades: +(d.units[i] / 10).toFixed(1),
  }));

  return (
    <div className="section-tendencias">
      <SectionSep label="Tendencias Temporales" />

      <TwoCol>
        <IngresosMensualesChart yoyData={yoyData} />
        <IngresosUnidadesChart lineData={lineData} />
      </TwoCol>

      <TwoCol>
        <VentasTrimestralChart />
        <FestivosVsNormalesGrid />
      </TwoCol>
    </div>
  );
}
