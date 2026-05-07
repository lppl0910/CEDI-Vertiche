import { useState, useEffect } from 'react';
import { FESTIVOS_DATA } from '../../data/ventasData';
import { fetchFestivos } from '../../data/ventasApi';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';

export function FestivosVsNormalesGrid({ filters }) {
  const [data, setData] = useState(FESTIVOS_DATA);

  useEffect(() => {
    fetchFestivos(filters.period)
      .then(setData)
      .catch(err => console.error('fetchFestivos:', err));
  }, [filters]);

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