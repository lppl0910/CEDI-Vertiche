import { useState, useRef, useEffect } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, ComposedChart,
  PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
  DATA, yoy23, yoy24, TOP_PRODS, TIENDAS, STOCK_ALERTS,
  SCATTER_DCTO, TICKET_ZONA, SEASON_DATA, TALLAS,
  INVENTORY_ROTATION, RECIBIDO_VENDIDO, DCTO_CAT,
  QUARTERLY_REVENUE, FESTIVOS_DATA, COVERAGE_KPIS,
} from '../data/ventasData';

// ── Design tokens ──────────────────────────────────────────────
const C = {
  black: '#111111', taupe: '#A48F7A', blush: '#D9B8B0',
  beige: '#D8C3A5', success: '#6E8B6B', warning: '#C9963B',
  error: '#B65E4A', muted: '#6B6B6B', border: '#E7E2DC',
  bg: '#F8F6F3', card: '#FFFFFF',
};
const ax = { fontSize: 11, fill: C.muted, fontFamily: 'Inter, sans-serif' };
const grid = { stroke: 'rgba(0,0,0,0.04)' };

// ── Shared primitives ───────────────────────────────────────────
function Card({ children, style }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: '14px 16px', ...style,
    }}>
      {children}
    </div>
  );
}

function ChartTitle({ title, sub }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#1F1F1F' }}>{title}</div>
      {sub && <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function SectionSep({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: C.border }} />
    </div>
  );
}

function TwoCol({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {children}
    </div>
  );
}

function LegendDot({ color }) {
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, marginRight: 4 }} />;
}

// ── KPI card (performance) ──────────────────────────────────────
const KPI_COLORS = { c1: C.black, c2: C.taupe, c3: C.blush, c4: C.success, c5: C.error };

function VentasKPI({ kpi }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: '12px 14px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: KPI_COLORS[kpi.cl] || C.black }} />
      <div style={{ fontSize: 9, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
        {kpi.label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, lineHeight: 1, marginBottom: 5 }}>{kpi.value}</div>
      {kpi.sub && <div style={{ fontSize: 9, color: C.muted, marginBottom: 4 }}>{kpi.sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 500, color: kpi.pos ? C.success : C.error, display: 'flex', alignItems: 'center', gap: 3 }}>
        {kpi.pos ? '▲' : '▼'} {kpi.delta}
      </div>
    </div>
  );
}

// ── SECTION: Performance ────────────────────────────────────────
function SectionPerformance({ filters }) {
  const d = DATA[filters.period] || DATA['30d'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SectionSep label="Performance General" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        {d.kpis.map((kpi, i) => <VentasKPI key={i} kpi={kpi} />)}
      </div>
      {d.insight && (
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${d.insight.type === 'warn' ? C.warning : C.success}`,
          borderRadius: 10, padding: '10px 14px',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{d.insight.title}</div>
          <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{d.insight.text}</div>
        </div>
      )}
    </div>
  );
}

// ── SECTION: Tendencias ─────────────────────────────────────────
function SectionTendencias({ filters }) {
  const d = DATA[filters.period] || DATA['30d'];
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  const yoyData = meses.map((mes, i) => ({ mes, '2024': yoy24[i], '2023': yoy23[i] }));
  const lineData = d.labels.map((label, i) => ({ label, ingresos: d.revenue[i], unidades: +(d.units[i] / 10).toFixed(1) }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionSep label="Tendencias Temporales" />
      <TwoCol>
        <Card>
          <ChartTitle title="Ingresos Mensuales — Comparación Anual" sub="2024 vs 2023" />
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>
            <LegendDot color={C.black} />2024 &nbsp; <LegendDot color={C.taupe} />2023
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
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>
            <LegendDot color={C.black} />Ingresos &nbsp; <LegendDot color={C.taupe} />Unidades /10
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
          <ChartTitle title="Días Festivos vs Días Normales" sub="Ticket promedio · ingresos promedio diario" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
            {FESTIVOS_DATA.map((f, i) => (
              <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: f.color }}>{f.val}</div>
                <div style={{ fontSize: 9, color: C.muted, marginTop: 3 }}>{f.sub}</div>
              </div>
            ))}
          </div>
        </Card>
      </TwoCol>
    </div>
  );
}

// ── SECTION: Productos ──────────────────────────────────────────
function SectionProductos() {
  const sorted = [...TOP_PRODS].sort((a, b) => b.rev - a.rev);
  const tot = sorted.reduce((s, p) => s + p.rev, 0);
  let cum = 0;
  const paretoData = sorted.map(p => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                {TOP_PRODS.map((_, i) => <Cell key={i} fill={i < 3 ? C.black : i < 6 ? C.taupe : C.beige} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle title="Análisis Pareto — Concentración por SKU" sub="¿Cuántos modelos generan el 80% del ingreso?" />
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>
            <LegendDot color={C.black} />A — 80% &nbsp; <LegendDot color={C.taupe} />B — 15% &nbsp; <LegendDot color={C.beige} />C — 5%
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <ComposedChart data={paretoData} margin={{ top: 2, right: 30, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" {...grid} />
              <XAxis dataKey="name" tick={{ ...ax, fontSize: 9 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={36} />
              <YAxis yAxisId="l" tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
              <YAxis yAxisId="r" orientation="right" domain={[0, 100]} tick={{ ...ax, fill: C.blush }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip formatter={(v, n) => n === 'pct' ? [`${v}%`, '% acumulado'] : [`$${v}K`, 'Ingreso']} />
              <Bar yAxisId="l" dataKey="rev" radius={[3, 3, 0, 0]}>
                {paretoData.map((p, i) => <Cell key={i} fill={p.pct <= 80 ? C.black : p.pct <= 95 ? C.taupe : C.beige} />)}
              </Bar>
              <Line yAxisId="r" type="monotone" dataKey="pct" stroke={C.blush} strokeWidth={1.5} dot={{ r: 2.5, fill: C.blush }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      </TwoCol>

      <TwoCol>
        <Card>
          <ChartTitle title="Ventas por Temporada y Categoría" sub="Primavera / Verano / Otoño / Invierno" />
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>
            {SEASON_DATA.cats.map((c, i) => (
              <span key={i} style={{ marginRight: 10 }}><LegendDot color={SEASON_DATA.colors[i]} />{c}</span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={stackedData} margin={{ top: 2, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" {...grid} />
              <XAxis dataKey="season" tick={ax} axisLine={false} tickLine={false} />
              <YAxis tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
              <Tooltip />
              {SEASON_DATA.cats.map((cat, i) => (
                <Bar key={cat} dataKey={cat} stackId="s" fill={SEASON_DATA.colors[i]} radius={i === SEASON_DATA.cats.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle title="Unidades por Talla" />
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={TALLAS} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, value }) => `${name}: ${((value / totalTallas) * 100).toFixed(0)}%`} labelLine={false}>
                {TALLAS.map((_, i) => <Cell key={i} fill={[C.beige, C.black, C.taupe, C.blush, C.border][i]} />)}
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

// ── SECTION: Tiendas ────────────────────────────────────────────
function SectionTiendas() {
  const ticketData = TICKET_ZONA.labels.map((mes, i) => ({ mes, Norte: TICKET_ZONA.norte[i], Sur: TICKET_ZONA.sur[i] }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionSep label="Rendimiento por Tienda" />

      <TwoCol>
        <Card>
          <ChartTitle title="Ticket Promedio — Norte vs Sur" sub="Precio promedio por ticket de venta" />
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>
            <LegendDot color={C.black} />Norte &nbsp; <LegendDot color={C.taupe} />Sur
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ticketData} margin={{ top: 2, right: 8, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" {...grid} />
              <XAxis dataKey="mes" tick={ax} axisLine={false} tickLine={false} />
              <YAxis tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toLocaleString()}`} />
              <Tooltip formatter={(v, n) => [`$${v.toLocaleString()}`, n]} />
              <Bar dataKey="Norte" fill={C.black} radius={[3, 3, 0, 0]} barSize={8} />
              <Bar dataKey="Sur" fill={C.taupe} radius={[3, 3, 0, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle title="Distribución por Zona" sub="Tiendas activas — Zona Norte y Sur" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr>
                  {['ID', 'Sucursal', 'Zona', 'Ingresos', 'Ticket', 'Uds.'].map(h => (
                    <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIENDAS.map(t => (
                  <tr key={t.id}>
                    <td style={{ padding: '7px 8px', fontFamily: 'monospace', fontSize: 10, color: C.muted }}>{t.id}</td>
                    <td style={{ padding: '7px 8px', fontWeight: 500 }}>{t.nombre}</td>
                    <td style={{ padding: '7px 8px' }}>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: t.zona === 'Norte' ? 'rgba(17,17,17,.08)' : 'rgba(164,143,122,.15)', color: t.zona === 'Norte' ? C.black : C.taupe, fontWeight: 500 }}>
                        {t.zona}
                      </span>
                    </td>
                    <td style={{ padding: '7px 8px', fontWeight: 600 }}>${t.ingresos}K</td>
                    <td style={{ padding: '7px 8px' }}>${t.ticket.toLocaleString()}</td>
                    <td style={{ padding: '7px 8px', color: C.muted }}>{t.uds.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </TwoCol>

      <Card>
        <ChartTitle title="Ranking de Tiendas" sub="Ingreso · Ticket · Unidades · Variación vs período anterior" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                {['ID', 'Sucursal', 'Zona', 'Ingresos ($K)', 'Ticket / Folio', 'Unidades', 'Δ vs ant.'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIENDAS.map(t => (
                <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontSize: 10, color: C.muted }}>{t.id}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 500 }}>{t.nombre}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: t.zona === 'Norte' ? 'rgba(17,17,17,.08)' : 'rgba(164,143,122,.15)', color: t.zona === 'Norte' ? C.black : C.taupe, fontWeight: 500 }}>
                      {t.zona}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', fontWeight: 600 }}>${t.ingresos}K</td>
                  <td style={{ padding: '8px 10px' }}>${t.ticket.toLocaleString()}</td>
                  <td style={{ padding: '8px 10px', color: C.muted }}>{t.uds.toLocaleString()}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{ fontSize: 11, fontWeight: 500, color: t.deltaPos ? C.success : C.error }}>
                      {t.deltaPos ? '▲' : '▼'} {t.delta}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── SECTION: Descuentos ─────────────────────────────────────────
function SectionDescuentos() {
  const scatterFmt = SCATTER_DCTO.map(d => ({ x: d.dcto, y: d.uds, cat: d.cat }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionSep label="Análisis de Descuentos" />
      <TwoCol>
        <Card>
          <ChartTitle title="Descuento Promedio por Categoría" sub="Ordenado de mayor a menor descuento" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={DCTO_CAT} layout="vertical" margin={{ top: 2, right: 20, bottom: 0, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" {...grid} horizontal={false} />
              <XAxis type="number" tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 28]} />
              <YAxis type="category" dataKey="cat" tick={ax} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [`${v}%`, 'Dcto. promedio']} />
              <Bar dataKey="dcto" radius={[0, 4, 4, 0]}>
                {DCTO_CAT.map((d, i) => <Cell key={i} fill={d.dcto >= 20 ? C.error : d.dcto >= 14 ? C.warning : d.dcto >= 10 ? C.taupe : C.black} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
            {[
              { lbl: 'Dcto. promedio',   val: '14.2%', color: C.warning },
              { lbl: 'Piezas con dcto.', val: '62%',   color: '#1F1F1F' },
            ].map((s, i) => (
              <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.lbl}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <ChartTitle title="Descuento % vs Unidades por Categoría" sub="Cuadrante derecho-abajo = descuento ineficiente" />
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" {...grid} />
              <XAxis type="number" dataKey="x" name="Descuento %" tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} label={{ value: 'Descuento %', position: 'insideBottom', offset: -12, style: { fontSize: 10, fill: C.muted } }} />
              <YAxis type="number" dataKey="y" name="Unidades" tick={ax} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
                if (!payload?.length) return null;
                const d = SCATTER_DCTO[payload[0]?.payload?._index] || SCATTER_DCTO.find(s => s.dcto === payload[0]?.payload?.x && s.uds === payload[0]?.payload?.y);
                return (
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 11 }}>
                    <strong>{payload[0]?.payload?.cat || '—'}</strong><br />
                    {`${payload[0]?.payload?.x}% dcto → ${payload[0]?.payload?.y?.toLocaleString()} uds`}
                  </div>
                );
              }} />
              <Scatter data={scatterFmt} fill={C.taupe}>
                {scatterFmt.map((d, i) => <Cell key={i} fill={d.x >= 18 ? C.error : d.x >= 10 ? C.warning : C.black} fillOpacity={0.8} />)}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      </TwoCol>
    </div>
  );
}

// ── SECTION: Inventario ─────────────────────────────────────────
function SectionInventario() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SectionSep label="Inventario y Cobertura" />

      <TwoCol>
        <Card>
          <ChartTitle title="Rotación de Inventario por Categoría" sub="Unidades vendidas / disponibles · veces por temporada" />
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={INVENTORY_ROTATION} margin={{ top: 2, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" {...grid} />
              <XAxis dataKey="cat" tick={ax} axisLine={false} tickLine={false} />
              <YAxis tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `${v}x`} domain={[0, 12]} />
              <Tooltip formatter={v => [`${v}x`, 'Rotación']} />
              <Bar dataKey="rot" radius={[4, 4, 0, 0]}>
                {INVENTORY_ROTATION.map((d, i) => <Cell key={i} fill={d.rot < 4 ? C.error : d.rot < 6 ? C.taupe : C.black} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle title="Cobertura de Stock" sub="Días hasta agotamiento" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
            {COVERAGE_KPIS.map((k, i) => (
              <div key={i} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px' }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{k.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: k.color }}>{k.val}</div>
              </div>
            ))}
          </div>
        </Card>
      </TwoCol>

      <TwoCol>
        <Card>
          <ChartTitle title="Volumen Recibido vs Vendido" sub="Por categoría · surtidos Martes y Viernes" />
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>
            <LegendDot color={C.black} />Recibido &nbsp; <LegendDot color={C.taupe} />Vendido
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={RECIBIDO_VENDIDO} margin={{ top: 2, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" {...grid} />
              <XAxis dataKey="cat" tick={ax} axisLine={false} tickLine={false} />
              <YAxis tick={ax} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v, n) => [v.toLocaleString(), n === 'recibido' ? 'Recibido' : 'Vendido']} />
              <Bar dataKey="recibido" fill={C.black} radius={[3, 3, 0, 0]} barSize={8} />
              <Bar dataKey="vendido"  fill={C.taupe} radius={[3, 3, 0, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <ChartTitle title="Alertas de Inventario — SKUs en Riesgo" />
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr>
                  {['', 'Modelo', 'Talla', 'Tienda', 'Días'].map(h => (
                    <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STOCK_ALERTS.map((a, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '6px 8px' }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: a.nivel === 'err' ? C.error : C.warning }} />
                    </td>
                    <td style={{ padding: '6px 8px', fontWeight: 500, fontSize: 10 }}>{a.modelo}</td>
                    <td style={{ padding: '6px 8px', fontWeight: 600 }}>{a.talla}</td>
                    <td style={{ padding: '6px 8px', color: C.muted, fontSize: 10 }}>{a.tienda}</td>
                    <td style={{ padding: '6px 8px' }}>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500, background: a.nivel === 'err' ? 'rgba(182,94,74,.1)' : 'rgba(201,150,59,.1)', color: a.nivel === 'err' ? C.error : C.warning }}>
                        {a.dias}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </TwoCol>
    </div>
  );
}

// ── Chat FAB ────────────────────────────────────────────────────
function ChatFAB() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: '¡Hola! Soy tu asistente de Vertiche. Puedo ayudarte con preguntas sobre ventas, inventario, descuentos y rendimiento por tienda.', time: 'Ahora' },
  ]);
  const [input, setInput] = useState('');
  const messagesRef = useRef(null);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(m => [...m, { role: 'user', text, time: 'Ahora' }]);
    setInput('');
    setTimeout(() => {
      setMessages(m => [...m, { role: 'bot', text: 'Estoy procesando tu consulta. Esta es una demostración — en producción conectaría con los datos reales de ventas.', time: 'Ahora' }]);
    }, 800);
  };

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 88, right: 24,
          width: 340, maxHeight: '60vh',
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          zIndex: 1000,
          animation: 'chatFadeIn 0.18s ease',
        }}>
          <style>{`@keyframes chatFadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }`}</style>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, background: C.black, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 5.58 2 10c0 2.39 1.36 4.52 3.5 6.04V20l3.1-1.7c1.08.3 2.23.46 3.4.46 5.52 0 10-3.58 10-8s-4.48-8-10-8z" stroke="#D8C3A5" strokeWidth="1.5" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Asistente Vertiche</div>
                <div style={{ fontSize: 10, color: C.success, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: C.success }} />
                  En línea
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
          </div>
          {/* Messages */}
          <div ref={messagesRef} style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '86%', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: 10, fontWeight: 500, color: C.muted, padding: '0 4px' }}>{m.role === 'bot' ? 'Asistente' : 'Tú'}</div>
                <div style={{ padding: '8px 12px', borderRadius: 12, fontSize: 12, lineHeight: 1.5, background: m.role === 'bot' ? C.bg : C.black, color: m.role === 'bot' ? '#1F1F1F' : '#fff', border: m.role === 'bot' ? `1px solid ${C.border}` : 'none', borderBottomLeftRadius: m.role === 'bot' ? 4 : 12, borderBottomRightRadius: m.role === 'user' ? 4 : 12 }}>
                  {m.text}
                </div>
                <div style={{ fontSize: 9, color: C.muted, padding: '0 4px' }}>{m.time}</div>
              </div>
            ))}
          </div>
          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: `1px solid ${C.border}`, display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0, background: C.card }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Escribe una pregunta…"
              rows={1}
              style={{ flex: 1, resize: 'none', border: `1px solid ${C.border}`, borderRadius: 10, padding: '7px 10px', fontSize: 12, fontFamily: 'var(--font)', outline: 'none', color: '#1F1F1F', background: C.bg, lineHeight: 1.4, maxHeight: 80, overflowY: 'auto' }}
            />
            <button
              onClick={send}
              style={{ width: 32, height: 32, borderRadius: 8, background: input.trim() ? C.black : C.border, border: 'none', cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 52, height: 52,
          background: open ? C.taupe : C.black,
          border: 'none', borderRadius: '50%',
          cursor: 'pointer', zIndex: 1001,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
          transition: 'background 0.2s, transform 0.2s',
          transform: open ? 'rotate(180deg) scale(0.92)' : 'rotate(0deg) scale(1)',
        }}
        title="Asistente Vertiche"
      >
        {open
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" /></svg>
          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 5.58 2 10c0 2.39 1.36 4.52 3.5 6.04V20l3.1-1.7c1.08.3 2.23.46 3.4.46 5.52 0 10-3.58 10-8s-4.48-8-10-8z" stroke="#fff" strokeWidth="1.6" /></svg>
        }
      </button>
    </>
  );
}

// ── Main export ─────────────────────────────────────────────────
const SECTIONS = {
  tendencias:  SectionTendencias,
  productos:   SectionProductos,
  tiendas:     SectionTiendas,
  descuentos:  SectionDescuentos,
  inventario:  SectionInventario,
};

export default function Ventas({ section = 'tendencias', filters = { period: '30d', zona: 'all', temporada: 'all' } }) {
  const ActiveSection = SECTIONS[section] || SectionTendencias;

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px 80px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SectionPerformance filters={filters} />
      <ActiveSection filters={filters} />
      <ChatFAB />
    </div>
  );
}
