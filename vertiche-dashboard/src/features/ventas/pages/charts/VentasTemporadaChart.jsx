import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { SEASON_DATA } from '../../data/ventasData';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';
import { LegendDot } from '../LegendDot';
import { grid, ax } from '../CONSTANTES';

/**
 * Gráfica de barras apiladas: ingresos por temporada de producto × categoría.
 * Las categorías y colores vienen del API (fetchTemporadasCategoria) pre-procesados.
 * Solo la última barra del stack recibe border-radius superior para que el "techo"
 * del grupo sea visualmente redondeado sin afectar las barras internas.
 *
 * @param {Array<{ season: string, [cat: string]: number }>} stackedData
 *   Cada objeto tiene 'season' más una clave por categoría con el ingreso ($K).
 * @param {string[]} cats   - Nombres de categorías en el mismo orden que `colors`
 * @param {string[]} colors - Hex por categoría, alineados con `cats[]`
 */
export function VentasTemporadaChart({ stackedData, cats, colors }) {
  return (
    <Card>
      <ChartTitle title="Ventas por Temporada y Categoría" sub="Primavera / Verano / Otoño / Invierno" />
      <div className="section-productos__legend">
        {cats.map((c, i) => (
          <span key={i} className="section-productos__legend-item">
            <LegendDot color={colors[i]} />{c}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={stackedData} margin={{ top: 2, right: 8, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" {...grid} />
          <XAxis dataKey="season" tick={ax} axisLine={false} tickLine={false} />
          <YAxis tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
          <Tooltip />
          {cats.map((cat, i) => (
            <Bar
              key={cat} dataKey={cat} stackId="s"
              fill={colors[i]}
              radius={i === cats.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}