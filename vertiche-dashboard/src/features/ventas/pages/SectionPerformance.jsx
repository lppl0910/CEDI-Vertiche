import { DATA } from '../data/ventasData';
import { SectionSep } from './SectionSep';
import { C } from './CONSTANTES';
import { VentasKPI } from './VentasKPI';
import './styles/SectionPerformance.css';

export function SectionPerformance({ filters }) {
  const d = DATA[filters.period] || DATA['30d'];
  const insightBorderColor = d.insight?.type === 'warn' ? C.warning : C.success;

  return (
    <div className="section-performance">
      <SectionSep label="Performance General" />

      <div className="section-performance__kpi-grid">
        {d.kpis.map((kpi, i) => (
          <VentasKPI key={i} kpi={kpi} />
        ))}
      </div>

      {d.insight && (
        /* borderLeft es dinámico según tipo de insight */
        <div
          className="section-performance__insight"
          style={{ borderLeft: `3px solid ${insightBorderColor}` }}
        >
          <div className="section-performance__insight-title">{d.insight.title}</div>
          <div className="section-performance__insight-body">{d.insight.text}</div>
        </div>
      )}
    </div>
  );
}
