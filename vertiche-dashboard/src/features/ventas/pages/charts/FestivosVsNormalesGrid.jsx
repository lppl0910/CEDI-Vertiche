import { FESTIVOS_DATA } from '../../data/ventasData';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';

/**
 * FestivosVsNormalesGrid
 * Cuadrícula comparativa de ticket promedio e ingresos
 * en días festivos vs días normales.
 * Consume FESTIVOS_DATA directamente (dato estático).
 */
export function FestivosVsNormalesGrid() {
  return (
    <Card>
      <ChartTitle
        title="Días Festivos vs Días Normales"
        sub="Ticket promedio · ingresos promedio diario"
      />
      <div className="section-tendencias__festivos-grid">
        {FESTIVOS_DATA.map((f, i) => (
          <div key={i} className="section-tendencias__festivo-card">
            <div className="section-tendencias__festivo-label">{f.label}</div>
            {/* color proviene del dato: no puede resolverse con clase estática */}
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
