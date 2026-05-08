import { useState, useEffect } from 'react';
import { DATA, yoy24, yoy23 } from '../data/ventasData';
import { fetchYoY, fetchPerformance } from '../data/ventasApi';
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

  // ── YoY desde backend ──────────────────────────────────────────
  const [yoyData, setYoyData] = useState(
    MESES.map((mes, i) => ({ mes, '2024': yoy24[i], '2023': yoy23[i] }))
  );
  const [loadingYoy, setLoadingYoy] = useState(true);

  // ── Performance desde backend ──────────────────────────────────
  const [lineData, setLineData] = useState(
    d.labels.map((label, i) => ({
      label,
      ingresos: d.revenue[i],
      unidades: +(d.units[i] / 10).toFixed(1),
    }))
  );
  const [loadingPerf, setLoadingPerf] = useState(true);

  useEffect(() => {
    fetchYoY(filters.period, filters.zona)
      .then(data => {
        const mapped = MESES.map((mes, i) => ({
          mes,
          '2025': data.actual[i]   ?? 0,
          '2024': data.anterior[i] ?? 0,
        }));
        setYoyData(mapped);
      })
      .catch(err => console.error('fetchYoY:', err))
      .finally(() => setLoadingYoy(false));
  }, [filters]);

  useEffect(() => {
    fetchPerformance(filters.period, filters.zona)
      .then(data => {
        const mapped = data.labels.map((label, i) => ({
          label: data.period === '7d' ? label : `S${label}`,
          ingresos: data.revenue[i],
          unidades: +(data.units[i] / 10).toFixed(1),
        }));
        setLineData(mapped);
      })
      .catch(err => console.error('fetchPerformance:', err))
      .finally(() => setLoadingPerf(false));
  }, [filters]);

  return (
    <div className="section-tendencias">
      <SectionSep label="Tendencias Temporales" />

      <TwoCol>
        {loadingYoy
          ? <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Cargando...</div>
          : <IngresosMensualesChart yoyData={yoyData} />
        }
        {loadingPerf
          ? <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Cargando...</div>
          : <IngresosUnidadesChart lineData={lineData} />
        }
      </TwoCol>

      <TwoCol>
        <VentasTrimestralChart filters={filters} />
        <FestivosVsNormalesGrid filters={filters} />
      </TwoCol>
    </div>
  );
}
