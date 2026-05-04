import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';
import { C } from '../CONSTANTES';

const TALLA_COLORS = [C.beige, C.black, C.taupe, C.blush, C.border];

/**
 * UnidadesTallaChart
 * Gráfica de pastel con la distribución de unidades vendidas por talla.
 *
 * @param {{ name: string, value: number }[]} tallas
 * @param {number}                            totalUnidades  Suma total de unidades
 */
export function UnidadesTallaChart({ tallas, totalUnidades }) {
  return (
    <Card>
      <ChartTitle title="Unidades por Talla" />
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={tallas}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={60}
            label={({ name, value }) =>
              `${name}: ${((value / totalUnidades) * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {tallas.map((_, i) => (
              <Cell key={i} fill={TALLA_COLORS[i]} />
            ))}
          </Pie>
          <Tooltip formatter={v => [v.toLocaleString(), 'Unidades']} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
