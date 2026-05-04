import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { SEASON_DATA } from '../../data/ventasData';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';
import { LegendDot } from '../LegendDot';
import { grid, ax } from '../CONSTANTES';

/**
 * VentasTemporadaChart
 * Barras apiladas de ventas por temporada (Primavera/Verano/Otoño/Invierno),
 * desagregadas por categoría de producto.
 *
 * @param {{ season: string, [cat: string]: number }[]} stackedData
 *   Cada objeto tiene la temporada como key y las categorías como keys dinámicas.
 */
export function VentasTemporadaChart({ stackedData }) {
  return (
    <Card>
      <ChartTitle
        title="Ventas por Temporada y Categoría"
        sub="Primavera / Verano / Otoño / Invierno"
      />
      <div className="section-productos__legend">
        {SEASON_DATA.cats.map((c, i) => (
          <span key={i} className="section-productos__legend-item">
            <LegendDot color={SEASON_DATA.colors[i]} />{c}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={stackedData} margin={{ top: 2, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" {...grid} />
          <XAxis dataKey="season" tick={ax} axisLine={false} tickLine={false} />
          <YAxis tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
          <Tooltip />
          {SEASON_DATA.cats.map((cat, i) => (
            <Bar
              key={cat} dataKey={cat} stackId="s"
              fill={SEASON_DATA.colors[i]}
              radius={i === SEASON_DATA.cats.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
