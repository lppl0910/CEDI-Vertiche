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
  const { period, zona, temporada } = filters;
  const d = DATA[period] || DATA['30d'];

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
    fetchYoY({ zona, temporada })
      .then(data => {
        const mapped = MESES.map((mes, i) => ({
          mes,
          '2025': data.actual[i] ?? 0,
          '2024': data.anterior[i] ?? 0,
        }));
        setYoyData(mapped);
        setLoadingYoy(false);
      })
      .catch(err => {
        console.error('fetchYoY:', err);
        setLoadingYoy(false);
      });
  }, [zona, temporada]);

  // Performance: los 3 filtros
  useEffect(() => {
    fetchPerformance({ period, zona, temporada })
      .then(data => {
        const mapped = data.labels.map((label, i) => ({
          label: data.period === '7d' || data.period === '1y'
            ? label
            : `S${label}`,
          ingresos: data.revenue[i],
          unidades: +(data.units[i] / 10).toFixed(1),
        }));
        setLineData(mapped);
        setLoadingPerf(false);
      })
      .catch(err => {
        console.error('fetchPerformance:', err);
        setLoadingPerf(false);
      });
  }, [period, zona, temporada]);

  // Trimestral: solo zona
  useEffect(() => {
    fetchTrimestral({ zona })
      .then(data => {
        setTrimestralData(data);
        setLoadingTrim(false);
      })
      .catch(err => {
        console.error('fetchTrimestral:', err);
        setLoadingTrim(false);
      });
  }, [zona]);

  // Festivos: los 3 filtros
  useEffect(() => {
    fetchFestivos({ period, zona, temporada })
      .then(data => {
        setFestivosData(data);
        setLoadingFest(false);
      })
      .catch(err => {
        console.error('fetchFestivos:', err);
        setLoadingFest(false);
      });
  }, [period, zona, temporada]);

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
