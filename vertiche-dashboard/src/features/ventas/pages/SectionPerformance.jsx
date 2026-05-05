import { useState, useEffect } from 'react';
import { DATA } from '../data/ventasData';
import { fetchPerformance } from '../data/ventasApi';
import { SectionSep } from './SectionSep';
import { C } from './CONSTANTES';
import { VentasKPI } from './VentasKPI';
import './styles/SectionPerformance.css';

export function SectionPerformance({ filters }) {
  const fallback = DATA[filters.period] || DATA['30d'];
  const [kpis, setKpis] = useState(fallback.kpis);
  const insightBorderColor = fallback.insight?.type === 'warn' ? C.warning : C.success;

  useEffect(() => {
    fetchPerformance(filters.period)
      .then(data => { if (data.kpis) setKpis(data.kpis); })
      .catch(err => console.error('fetchPerformance KPIs:', err));
  }, [filters.period]);

  return (
    <div className="section-performance">
      <SectionSep label="Performance General" />
      <div className="section-performance__kpi-grid">
        {kpis.map((kpi, i) => (
          <VentasKPI key={i} kpi={kpi} />
        ))}
      </div>
      {fallback.insight && (
        <div
          className="section-performance__insight"
          style={{ borderLeft: `3px solid ${insightBorderColor}` }}
        >
          <div className="section-performance__insight-title">{fallback.insight.title}</div>
          <div className="section-performance__insight-body">{fallback.insight.text}</div>
        </div>
      )}
    </div>
  );
}