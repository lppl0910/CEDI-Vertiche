import {
  ResponsiveContainer, LineChart, CartesianGrid,
  XAxis, YAxis, Tooltip, Line, BarChart, Bar, Cell,
} from 'recharts';
import { DATA, yoy24, yoy23, QUARTERLY_REVENUE, FESTIVOS_DATA } from '../data/ventasData';
import { Card } from './Card';
import { ChartTitle } from './ChartTitle';
import { LegendDot } from './LegendDot';
import { SectionSep } from './SectionSep';
import { TwoCol } from './TwoCol';
import { grid, ax, C } from './CONSTANTES';
import './styles/SectionTendencias.css';

export function SectionTendencias({ filters }) {
  const d = DATA[filters.period] || DATA['30d'];
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const yoyData = meses.map((mes, i) => ({ mes, '2024': yoy24[i], '2023': yoy23[i] }));
  const lineData = d.labels.map((label, i) => ({
    label,
    ingresos: d.revenue[i],
    unidades: +(d.units[i] / 10).toFixed(1),
  }));

  return (
    <div className="section-tendencias">
      <SectionSep label="Tendencias Temporales" />

      <TwoCol>
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
              <Line type="monotone" dataKey="2024" stroke={C.black} strokeWidth={2} dot={{ r: 2.5, fill: C.black }} />
              <Line type="monotone" dataKey="2023" stroke={C.taupe} strokeWidth={1.5} strokeDasharray="4 3" dot={{ r: 2.5, fill: C.taupe }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

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
              <YAxis yAxisId="l" tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
              <YAxis yAxisId="r" orientation="right" tick={{ ...ax, fill: C.taupe }} axisLine={false} tickLine={false} tickFormatter={v => `${(v * 10).toFixed(0)}`} />
              <Tooltip formatter={(v, n) => n === 'ingresos' ? [`$${v}K`, 'Ingresos'] : [`${(v * 10).toFixed(0)} uds`, 'Unidades']} />
              <Line yAxisId="l" type="monotone" dataKey="ingresos" stroke={C.black} strokeWidth={2} dot={{ r: 2.5, fill: C.black }} />
              <Line yAxisId="r" type="monotone" dataKey="unidades" stroke={C.taupe} strokeWidth={1.5} strokeDasharray="4 3" dot={{ r: 2.5, fill: C.taupe }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </TwoCol>

      <TwoCol>
        <Card>
          <ChartTitle title="Ventas por Trimestre" sub="Ingreso total" />
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={QUARTERLY_REVENUE} margin={{ top: 2, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" {...grid} />
              <XAxis dataKey="season" tick={ax} axisLine={false} tickLine={false} />
              <YAxis tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
              <Tooltip formatter={v => [`$${v}K`, 'Ingresos']} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {QUARTERLY_REVENUE.map((_, i) => (
                  <Cell key={i} fill={[C.black, '#8E9AAF', C.beige, '#080808'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle
            title="Días Festivos vs Días Normales"
            sub="Ticket promedio · ingresos promedio diario"
          />
          <div className="section-tendencias__festivos-grid">
            {FESTIVOS_DATA.map((f, i) => (
              <div key={i} className="section-tendencias__festivo-card">
                <div className="section-tendencias__festivo-label">{f.label}</div>
                {/* color dinámico por dato */}
                <div className="section-tendencias__festivo-value" style={{ color: f.color }}>
                  {f.val}
                </div>
                <div className="section-tendencias__festivo-sub">{f.sub}</div>
              </div>
            ))}
          </div>
        </Card>
      </TwoCol>
    </div>
  );
}
