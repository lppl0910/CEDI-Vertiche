import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { TOP_PRODS, SEASON_DATA, TALLAS } from '../data/ventasData';
import { Card } from './Card';
import { ChartTitle } from './ChartTitle';
import { LegendDot } from './LegendDot';
import { SectionSep } from './SectionSep';
import { TwoCol } from './TwoCol';
import { grid, ax, C } from './CONSTANTES';
import './styles/SectionProductos.css';

export function SectionProductos() {
  const sorted = [...TOP_PRODS].sort((a, b) => b.rev - a.rev);
  const tot = sorted.reduce((s, p) => s + p.rev, 0);
  let cum = 0;
  const paretoData = sorted.map((p) => {
    cum += p.rev;
    const pct = +((cum / tot) * 100).toFixed(1);
    return { name: p.name.split(' ').slice(0, 2).join(' '), rev: p.rev, pct };
  });

  const seasonLabels = ['Primavera', 'Verano', 'Otoño', 'Invierno'];
  const stackedData = seasonLabels.map((s, si) => {
    const row = { season: s };
    SEASON_DATA.cats.forEach((c, ci) => { row[c] = SEASON_DATA.data[si][ci]; });
    return row;
  });

  const totalTallas = TALLAS.reduce((s, t) => s + t.value, 0);

  return (
    <div className="section-productos">
      <SectionSep label="Análisis de Producto" />

      <TwoCol>
        <Card>
          <ChartTitle title="Top 10 Productos por Ingreso" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={TOP_PRODS} layout="vertical" margin={{ top: 2, right: 20, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" {...grid} horizontal={false} />
              <XAxis type="number" tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
              <YAxis type="category" dataKey="name" tick={{ ...ax, fontSize: 10 }} axisLine={false} tickLine={false} width={130} tickFormatter={v => v.length > 18 ? v.slice(0, 18) + '…' : v} />
              <Tooltip formatter={(v, _, p) => [`$${v}K · ${TOP_PRODS[p.index]?.units?.toLocaleString()} uds`, 'Ingreso']} />
              <Bar dataKey="rev" radius={[0, 4, 4, 0]}>
                {TOP_PRODS.map((_, i) => (
                  <Cell key={i} fill={i < 3 ? C.black : i < 6 ? C.taupe : C.beige} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

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
          <ResponsiveContainer width="100%" height={160}>
            <ComposedChart data={paretoData} margin={{ top: 2, right: 30, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" {...grid} />
              <XAxis dataKey="name" tick={{ ...ax, fontSize: 9 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={36} />
              <YAxis yAxisId="l" tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
              <YAxis yAxisId="r" orientation="right" domain={[0, 100]} tick={{ ...ax, fill: C.blush }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v, n) => n === 'pct' ? [`${v}%`, '% acumulado'] : [`$${v}K`, 'Ingreso']} />
              <Bar yAxisId="l" dataKey="rev" radius={[3, 3, 0, 0]}>
                {paretoData.map((p, i) => (
                  <Cell key={i} fill={p.pct <= 80 ? C.black : p.pct <= 95 ? C.taupe : C.beige} />
                ))}
              </Bar>
              <Line yAxisId="r" type="monotone" dataKey="pct" stroke={C.blush} strokeWidth={1.5} dot={{ r: 2.5, fill: C.blush }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      </TwoCol>

      <TwoCol>
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
                <Bar key={cat} dataKey={cat} stackId="s" fill={SEASON_DATA.colors[i]}
                  radius={i === SEASON_DATA.cats.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle title="Unidades por Talla" />
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={TALLAS}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label={({ name, value }) => `${name}: ${((value / totalTallas) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {TALLAS.map((_, i) => (
                  <Cell key={i} fill={[C.beige, C.black, C.taupe, C.blush, C.border][i]} />
                ))}
              </Pie>
              <Tooltip formatter={v => [v.toLocaleString(), 'Unidades']} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </TwoCol>
    </div>
  );
}
