import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';
import { grid, ax, C } from '../CONSTANTES';

/**
 * TopProductosChart
 * Gráfica de barras horizontal con los 10 productos de mayor ingreso.
 *
 * @param {{ name: string, rev: number, units: number }[]} products
 */
export function TopProductosChart({ products }) {
  if (!products || products.length === 0) {
    return (
      <Card>
        <ChartTitle title="Top 10 Productos por Ingreso" />
        <div style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: 12 }}>Cargando...</div>
      </Card>
    );
  }

  // Calcula el ancho necesario para el nombre más largo (aprox. 6.5px por carácter a font-size 10)
  const maxLabelLength = Math.max(...products.map(p => p.name.length));
  const yAxisWidth = Math.min(Math.max(maxLabelLength * 6.5, 100), 220);

  // Altura dinámica: 32px por barra + márgenes
  const chartHeight = products.length * 32 + 20;

  return (
    <Card>
      <ChartTitle title="Top 10 Productos por Ingreso" />
      <ResponsiveContainer width="100%" height={chartHeight}>
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
            width={yAxisWidth}
            tickFormatter={v => v.length > 18 ? v.slice(0, 18) + '…' : v}
          />
          <Tooltip
           formatter={(v, _, p) => [
              `$${v}K · ${p.payload?.units?.toLocaleString() ?? 0} uds`,
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