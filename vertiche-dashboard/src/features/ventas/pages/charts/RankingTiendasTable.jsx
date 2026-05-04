import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';

const HEADERS = ['ID', 'Sucursal', 'Zona', 'Ingresos ($K)', 'Ticket / Folio', 'Unidades', 'Δ vs ant.'];

/**
 * RankingTiendasTable
 * Ranking completo de tiendas: ingreso, ticket, unidades
 * y variación vs período anterior.
 *
 * @param {{ id, nombre, zona, ingresos, ticket, uds, delta, deltaPos }[]} tiendas
 */
export function RankingTiendasTable({ tiendas }) {
  return (
    <Card>
      <ChartTitle
        title="Ranking de Tiendas"
        sub="Ingreso · Ticket · Unidades · Variación vs período anterior"
      />
      <div className="section-tiendas__table-overflow">
        <table className="section-tiendas__table">
          <thead>
            <tr>
              {HEADERS.map(h => (
                <th key={h} className="section-tiendas__th section-tiendas__th--ranking">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tiendas.map(t => (
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
  );
}
