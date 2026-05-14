import {
  ResponsiveContainer, ComposedChart, CartesianGrid,
  XAxis, YAxis, Tooltip, Bar, Cell, Line,
} from 'recharts';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';
import { LegendDot } from '../LegendDot';
import { grid, ax, C } from '../CONSTANTES';

/**
 * ParetoSKUChart
 * Análisis de Pareto: barras de ingreso por SKU + línea de porcentaje
 * acumulado. Colorea las barras según el segmento A/B/C.
 *
 * @param {{ name: string, rev: number, pct: number }[]} paretoData
 *   pct = porcentaje acumulado de ingresos hasta ese SKU
 */
export function ParetoSKUChart({ paretoData }) {
  // Calcula el ancho necesario para el nombre más largo (aprox. 6.5px por carácter a font-size 10)
  const maxLabelLength = Math.max(...paretoData.map(p => p.name.length));
  const labelWidth = Math.min(Math.max(maxLabelLength * 4, 100), 80);

  return (
    <Card>
      <ChartTitle
        title="Análisis Pareto — Concentración por SKU"
        sub="¿Cuántos modelos generan el 80% del ingreso?"
      />
      <div className="section-productos__legend">
        <LegendDot color={C.black} />A — 80% &nbsp;
        <LegendDot color={C.taupe} />B — 15% &nbsp;
        <LegendDot color={C.beige} />C — 5%
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={paretoData} margin={{ top: 2, right: 5, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" {...grid} />
          <XAxis
            dataKey="name"
            tick={{ ...ax, fontSize: 9 }} axisLine={false} tickLine={false}
            angle={-20} textAnchor="end" height={labelWidth}
          />
          <YAxis
            yAxisId="l" tick={ax} axisLine={false} tickLine={false}
            tickFormatter={v => `$${v}K`}
          />
          <YAxis
            yAxisId="r" orientation="right" domain={[0, 100]}
            tick={{ ...ax, fill: C.blush }} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip
            formatter={(v, n) =>
              n === 'pct' ? [`${v}%`, '% acumulado'] : [`$${v}K`, 'Ingreso']
            }
          />
          <Bar yAxisId="l" dataKey="rev" radius={[3, 3, 0, 0]}>
            {paretoData.map((p, i) => (
              <Cell key={i} fill={p.pct <= 80 ? C.black : p.pct <= 95 ? C.taupe : C.beige} />
            ))}
          </Bar>
          <Line
            yAxisId="r" type="monotone" dataKey="pct"
            stroke={C.blush} strokeWidth={1.5}
            dot={{ r: 2.5, fill: C.blush }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
