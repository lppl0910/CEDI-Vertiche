import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';
import { LegendDot } from '../LegendDot';
import { grid, ax, C } from '../CONSTANTES';

/**
 * TicketPromedioZonaChart
 * Precio promedio por ticket de venta, comparando Zona Norte vs Zona Sur
 * a lo largo del período.
 *
 * @param {{ mes: string, Norte: number, Sur: number }[]} ticketData
 */
export function TicketPromedioZonaChart({ ticketData }) {
  return (
    <Card>
      <ChartTitle
        title="Ticket Promedio — Norte vs Sur"
        sub="Precio promedio por ticket de venta"
      />
      <div className="section-tiendas__legend">
        <LegendDot color={C.black} />Norte &nbsp;
        <LegendDot color={C.taupe} />Sur
      </div>
      <ResponsiveContainer width="100%" height={350} role="img" aria-label="Gráfica de barras agrupadas: ticket promedio por mes comparando zonas Norte y Sur">
        <BarChart data={ticketData} margin={{ top: 2, right: 8, bottom: 0, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" {...grid} />
          <XAxis dataKey="mes" tick={ax} axisLine={false} tickLine={false} />
          <YAxis
            tick={ax} axisLine={false} tickLine={false}
            tickFormatter={v => `$${v.toLocaleString()}`}
          />
          <Tooltip formatter={(v, n) => [`$${v.toLocaleString()}`, n]} />
          <Bar dataKey="Norte" fill={C.black} radius={[3, 3, 0, 0]} barSize={8} />
          <Bar dataKey="Sur"   fill={C.taupe} radius={[3, 3, 0, 0]} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
