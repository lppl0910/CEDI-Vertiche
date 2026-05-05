import { useState, useEffect } from 'react';
import { QUARTERLY_REVENUE } from '../../data/ventasData';
import { fetchTrimestral } from '../../data/ventasApi';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';
import { grid, ax, C } from '../CONSTANTES';

const QUARTER_COLORS = [C.black, '#8E9AAF', C.beige, '#080808'];

export function VentasTrimestralChart() {
  const [data, setData] = useState(QUARTERLY_REVENUE);

  useEffect(() => {
    fetchTrimestral()
      .then(setData)
      .catch(err => console.error('fetchTrimestral:', err));
  }, []);

  return (
    <Card>
      <ChartTitle title="Ventas por Trimestre" sub="Ingreso total" />
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} margin={{ top: 2, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" {...grid} />
          <XAxis dataKey="season" tick={ax} axisLine={false} tickLine={false} />
          <YAxis tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}M`}/>
          <Tooltip formatter={v => [`$${(v/1000).toFixed(1)}M`, 'Ingresos']} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={QUARTER_COLORS[i % QUARTER_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}