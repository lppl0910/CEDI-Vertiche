import { useState, useEffect } from 'react';
import { DATA, yoy24, yoy23, QUARTERLY_REVENUE, FESTIVOS_DATA } from '../data/ventasData';
import { fetchYoY, fetchPerformance, fetchTrimestral, fetchFestivos } from '../data/ventasApi';
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

  // ── YoY — zona y temporada ─────────────────────────────────────
  const [yoyData, setYoyData] = useState(
    MESES.map((mes, i) => ({ mes, '2025': yoy24[i] ?? 0, '2024': yoy23[i] ?? 0 }))
  );
  const [loadingYoy, setLoadingYoy] = useState(true);

  // ── Performance — los 3 filtros ────────────────────────────────
  const [lineData, setLineData] = useState(
    d.labels.map((label, i) => ({
      label,
      ingresos: d.revenue[i],
      unidades: +(d.units[i] / 10).toFixed(1),
    }))
  );
  const [loadingPerf, setLoadingPerf] = useState(true);

  // ── Trimestral — solo zona ─────────────────────────────────────
  const [trimestralData, setTrimestralData] = useState(QUARTERLY_REVENUE);
  const [loadingTrim, setLoadingTrim] = useState(true);

  // ── Festivos — los 3 filtros ───────────────────────────────────
  const [festivosData, setFestivosData] = useState(FESTIVOS_DATA);
  const [loadingFest, setLoadingFest] = useState(true);

  // ── Effects ────────────────────────────────────────────────────

  // YoY: zona y temporada
  useEffect(() => {
    setLoadingYoy(true);
    fetchYoY({ zona: filters.zona, temporada: filters.temporada })
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
  }, [filters.zona, filters.temporada]);

  // Performance: los 3 filtros
  useEffect(() => {
    setLoadingPerf(true);
    fetchPerformance(filters)
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
  }, [filters.period, filters.zona, filters.temporada]);

  // Trimestral: solo zona
  useEffect(() => {
    setLoadingTrim(true);
    fetchTrimestral({ zona: filters.zona })
      .then(setTrimestralData)
      .catch(err => console.error('fetchTrimestral:', err))
      .finally(() => setLoadingTrim(false));
  }, [filters.zona]);

  // Festivos: los 3 filtros
  useEffect(() => {
    setLoadingFest(true);
    fetchFestivos(filters)
      .then(setFestivosData)
      .catch(err => console.error('fetchFestivos:', err))
      .finally(() => setLoadingFest(false));
  }, [filters.period, filters.zona, filters.temporada]);

  // ── Render ─────────────────────────────────────────────────────
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
        {loadingTrim
          ? <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Cargando...</div>
          : <VentasTrimestralChart data={trimestralData} />
        }
        {loadingFest
          ? <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Cargando...</div>
          : <FestivosVsNormalesGrid data={festivosData} />
        }
      </TwoCol>
    </div>
  );
}
