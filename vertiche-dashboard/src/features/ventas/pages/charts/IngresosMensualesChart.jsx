import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';
import { LegendDot } from '../LegendDot';
import { grid, ax, C } from '../CONSTANTES';

/**
 * Gráfica de líneas para comparación interanual de ingresos mensuales.
 * SectionTendencias transforma la respuesta del API { actual[], anterior[] }
 * a objetos con claves de año (e.g. '2025', '2024') antes de pasarlos aquí.
 *
 * @param {Array<{ mes: string, '2025': number, '2024': number }>} yoyData
 *   12 puntos (uno por mes). Los valores son ingresos en $K.
 */
export function IngresosMensualesChart({ yoyData }) {
  return (
    <Card>
      <ChartTitle title="Ingresos Mensuales — Comparación Anual" sub="2025 vs 2024" />
      <div className="section-tendencias__legend">
        <LegendDot color={C.black} />2025 &nbsp;
        <LegendDot color={C.taupe} />2024
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={yoyData} margin={{ top: 2, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" {...grid} />
          <XAxis dataKey="mes" tick={ax} axisLine={false} tickLine={false} />
          <YAxis tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
          <Tooltip formatter={(v, n) => [`$${v}K`, n]} />
          <Line
            type="monotone" dataKey="2025"
            stroke={C.black} strokeWidth={2}
            dot={{ r: 2.5, fill: C.black }}
          />
          <Line
            type="monotone" dataKey="2024"
            stroke={C.taupe} strokeWidth={1.5} strokeDasharray="4 3"
            dot={{ r: 2.5, fill: C.taupe }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
