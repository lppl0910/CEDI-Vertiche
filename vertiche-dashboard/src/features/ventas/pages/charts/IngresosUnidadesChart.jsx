import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';
import { LegendDot } from '../LegendDot';
import { grid, ax, C } from '../CONSTANTES';

/**
 * Gráfica de doble eje: ingresos ($K) en eje izquierdo, unidades en eje derecho.
 * Las unidades se dividen entre 10 en SectionTendencias para que la escala sea
 * comparable visualmente con la de ingresos. El tooltip invierte la división
 * para mostrar el valor real al usuario.
 *
 * @param {Array<{ label: string, ingresos: number, unidades: number }>} lineData
 *   Acumulado por período. `unidades` ya viene dividido entre 10 del caller.
 */
export function IngresosUnidadesChart({ lineData }) {
  return (
    <Card>
      <ChartTitle title="Ingresos y Unidades Vendidas" sub="Acumulado por período" />
      <div className="section-tendencias__legend">
        <LegendDot color={C.black} />Ingresos &nbsp;
        <LegendDot color={C.taupe} />Unidades /10
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={lineData} margin={{ top: 2, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" {...grid} />
          <XAxis dataKey="label" tick={ax} axisLine={false} tickLine={false} />
          <YAxis
            yAxisId="l" tick={ax} axisLine={false} tickLine={false}
            tickFormatter={v => `$${v}K`}
          />
          <YAxis
            yAxisId="r" orientation="right"
            tick={{ ...ax, fill: C.taupe }} axisLine={false} tickLine={false}
            tickFormatter={v => `${(v * 10).toFixed(0)}`}
          />
          <Tooltip
            formatter={(v, n) =>
              n === 'ingresos'
                ? [`$${v}K`, 'Ingresos']
                : [`${(v * 10).toFixed(0)} uds`, 'Unidades']
            }
          />
          <Line
            yAxisId="l" type="monotone" dataKey="ingresos"
            stroke={C.black} strokeWidth={2}
            dot={{ r: 2.5, fill: C.black }}
          />
          <Line
            yAxisId="r" type="monotone" dataKey="unidades"
            stroke={C.taupe} strokeWidth={1.5} strokeDasharray="4 3"
            dot={{ r: 2.5, fill: C.taupe }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
