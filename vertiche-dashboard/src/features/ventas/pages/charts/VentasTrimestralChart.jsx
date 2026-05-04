import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';
import { QUARTERLY_REVENUE } from '../../data/ventasData';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';
import { grid, ax, C } from '../CONSTANTES';

const QUARTER_COLORS = [C.black, '#8E9AAF', C.beige, '#080808'];

/**
 * VentasTrimestralChart
 * Ingreso total agrupado por trimestre del año.
 * Consume QUARTERLY_REVENUE directamente (dato estático).
 */
export function VentasTrimestralChart() {
  return (
    <Card>
      <ChartTitle title="Ventas por Trimestre" sub="Ingreso total" />
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={QUARTERLY_REVENUE} margin={{ top: 2, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" {...grid} />
          <XAxis dataKey="season" tick={ax} axisLine={false} tickLine={false} />
          <YAxis tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
          <Tooltip formatter={v => [`$${v}K`, 'Ingresos']} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {QUARTERLY_REVENUE.map((_, i) => (
              <Cell key={i} fill={QUARTER_COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
