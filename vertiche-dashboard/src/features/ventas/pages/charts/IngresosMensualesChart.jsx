import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';
import { LegendDot } from '../LegendDot';
import { grid, ax, C } from '../CONSTANTES';

/**
 * IngresosMensualesChart
 * Comparación año a año de ingresos mensuales.
 *
 * @param {{ mes: string, '2024': number, '2023': number }[]} yoyData
 */
export function IngresosMensualesChart({ yoyData }) {
  return (
    <Card>
      <ChartTitle title="Ingresos Mensuales — Comparación Anual" sub="2024 vs 2023" />
      <div className="section-tendencias__legend">
        <LegendDot color={C.black} />2024 &nbsp;
        <LegendDot color={C.taupe} />2023
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={yoyData} margin={{ top: 2, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" {...grid} />
          <XAxis dataKey="mes" tick={ax} axisLine={false} tickLine={false} />
          <YAxis tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
          <Tooltip formatter={(v, n) => [`$${v}K`, n]} />
          <Line
            type="monotone" dataKey="2024"
            stroke={C.black} strokeWidth={2}
            dot={{ r: 2.5, fill: C.black }}
          />
          <Line
            type="monotone" dataKey="2023"
            stroke={C.taupe} strokeWidth={1.5} strokeDasharray="4 3"
            dot={{ r: 2.5, fill: C.taupe }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
