import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';

/**
 * FestivosVsNormalesGrid
 * Grid de 4 KPIs: ingreso festivo, ingreso normal, ratio y ticket promedio.
 * Filtros que aplican: period, zona, temporada (el fetch lo maneja SectionTendencias).
 *
 * @param {{ label: string, val: string, color: string, sub: string }[]} data
 */
export function FestivosVsNormalesGrid({ data = [] }) {
  return (
    <Card>
      <ChartTitle
        title="Días Festivos vs Días Normales"
        sub="Ticket promedio · ingresos promedio diario"
      />
      <div className="section-tendencias__festivos-grid">
        {data.map((f, i) => (
          <div key={i} className="section-tendencias__festivo-card">
            <div className="section-tendencias__festivo-label">{f.label}</div>
            <div className="section-tendencias__festivo-value" style={{ color: f.color }}>
              {f.val}
            </div>
            <div className="section-tendencias__festivo-sub">{f.sub}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
