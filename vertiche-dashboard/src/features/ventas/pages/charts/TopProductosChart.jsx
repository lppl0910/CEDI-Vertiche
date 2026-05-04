import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';
import { grid, ax, C } from '../CONSTANTES';

/**
 * TopProductosChart
 * Gráfica de barras horizontal con los 10 productos de mayor ingreso.
 * Los primeros 3 se resaltan en negro, los siguientes 3 en taupe,
 * el resto en beige.
 *
 * @param {{ name: string, rev: number, units: number }[]} products
 */
export function TopProductosChart({ products }) {
  return (
    <Card>
      <ChartTitle title="Top 10 Productos por Ingreso" />
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={products}
          layout="vertical"
          margin={{ top: 2, right: 20, bottom: 0, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" {...grid} horizontal={false} />
          <XAxis
            type="number" tick={ax} axisLine={false} tickLine={false}
            tickFormatter={v => `$${v}K`}
          />
          <YAxis
            type="category" dataKey="name"
            tick={{ ...ax, fontSize: 10 }} axisLine={false} tickLine={false}
            width={130}
            tickFormatter={v => v.length > 18 ? v.slice(0, 18) + '…' : v}
          />
          <Tooltip
            formatter={(v, _, p) => [
              `$${v}K · ${products[p.index]?.units?.toLocaleString()} uds`,
              'Ingreso',
            ]}
          />
          <Bar dataKey="rev" radius={[0, 4, 4, 0]}>
            {products.map((_, i) => (
              <Cell key={i} fill={i < 3 ? C.black : i < 6 ? C.taupe : C.beige} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
