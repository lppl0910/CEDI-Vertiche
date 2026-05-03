import {
  ResponsiveContainer, BarChart, CartesianGrid,
  XAxis, YAxis, Tooltip, Bar,
} from 'recharts';
import { TICKET_ZONA, TIENDAS } from '../data/ventasData';
import { Card } from './Card';
import { ChartTitle } from './ChartTitle';
import { C, grid, ax } from './CONSTANTES';
import { LegendDot } from './LegendDot';
import { SectionSep } from './SectionSep';
import { TwoCol } from './TwoCol';
import './styles/SectionTiendas.css';

const HEADERS_ZONA    = ['ID', 'Sucursal', 'Zona', 'Ingresos', 'Ticket', 'Uds.'];
const HEADERS_RANKING = ['ID', 'Sucursal', 'Zona', 'Ingresos ($K)', 'Ticket / Folio', 'Unidades', 'Δ vs ant.'];

export function SectionTiendas() {
  const ticketData = TICKET_ZONA.labels.map((mes, i) => ({
    mes,
    Norte: TICKET_ZONA.norte[i],
    Sur: TICKET_ZONA.sur[i],
  }));

  return (
    <div className="section-tiendas">
      <SectionSep label="Rendimiento por Tienda" />

      <TwoCol>
        {/* ── Ticket promedio Norte vs Sur ── */}
        <Card>
          <ChartTitle
            title="Ticket Promedio — Norte vs Sur"
            sub="Precio promedio por ticket de venta"
          />
          <div className="section-tiendas__legend">
            <LegendDot color={C.black} />Norte &nbsp;
            <LegendDot color={C.taupe} />Sur
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ticketData} margin={{ top: 2, right: 8, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" {...grid} />
              <XAxis dataKey="mes" tick={ax} axisLine={false} tickLine={false} />
              <YAxis tick={ax} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toLocaleString()}`} />
              <Tooltip formatter={(v, n) => [`$${v.toLocaleString()}`, n]} />
              <Bar dataKey="Norte" fill={C.black} radius={[3, 3, 0, 0]} barSize={8} />
              <Bar dataKey="Sur"   fill={C.taupe} radius={[3, 3, 0, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ── Distribución por zona ── */}
        <Card>
          <ChartTitle
            title="Distribución por Zona"
            sub="Tiendas activas — Zona Norte y Sur"
          />
          <div className="section-tiendas__table-overflow">
            <table className="section-tiendas__table">
              <thead>
                <tr>
                  {HEADERS_ZONA.map(h => (
                    <th key={h} className="section-tiendas__th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIENDAS.map(t => (
                  <tr key={t.id}>
                    <td className="section-tiendas__td section-tiendas__td--id">{t.id}</td>
                    <td className="section-tiendas__td section-tiendas__td--name">{t.nombre}</td>
                    <td className="section-tiendas__td">
                      <span className={`section-tiendas__zone-badge section-tiendas__zone-badge--${t.zona === 'Norte' ? 'norte' : 'sur'}`}>
                        {t.zona}
                      </span>
                    </td>
                    <td className="section-tiendas__td section-tiendas__td--revenue">${t.ingresos}K</td>
                    <td className="section-tiendas__td">${t.ticket.toLocaleString()}</td>
                    <td className="section-tiendas__td section-tiendas__td--units">{t.uds.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </TwoCol>

      {/* ── Ranking completo de tiendas ── */}
      <Card>
        <ChartTitle
          title="Ranking de Tiendas"
          sub="Ingreso · Ticket · Unidades · Variación vs período anterior"
        />
        <div className="section-tiendas__table-overflow">
          <table className="section-tiendas__table">
            <thead>
              <tr>
                {HEADERS_RANKING.map(h => (
                  <th key={h} className="section-tiendas__th section-tiendas__th--ranking">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIENDAS.map(t => (
                <tr key={t.id}>
                  <td className="section-tiendas__td--ranking section-tiendas__td--id">{t.id}</td>
                  <td className="section-tiendas__td--ranking section-tiendas__td--name">{t.nombre}</td>
                  <td className="section-tiendas__td--ranking">
                    <span className={`section-tiendas__zone-badge section-tiendas__zone-badge--${t.zona === 'Norte' ? 'norte' : 'sur'}`}>
                      {t.zona}
                    </span>
                  </td>
                  <td className="section-tiendas__td--ranking section-tiendas__td--revenue">${t.ingresos}K</td>
                  <td className="section-tiendas__td--ranking">${t.ticket.toLocaleString()}</td>
                  <td className="section-tiendas__td--ranking section-tiendas__td--units">{t.uds.toLocaleString()}</td>
                  <td className="section-tiendas__td--ranking">
                    <span className={`section-tiendas__delta ${t.deltaPos ? 'section-tiendas__delta--positive' : 'section-tiendas__delta--negative'}`}>
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
