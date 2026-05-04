import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';

const HEADERS = ['ID', 'Sucursal', 'Zona', 'Ingresos', 'Ticket', 'Uds.'];

/**
 * DistribucionZonaTable
 * Tabla de tiendas activas agrupadas por Zona Norte y Sur.
 *
 * @param {{ id, nombre, zona, ingresos, ticket, uds }[]} tiendas
 */
export function DistribucionZonaTable({ tiendas }) {
  return (
    <Card>
      <ChartTitle
        title="Distribución por Zona"
        sub="Tiendas activas — Zona Norte y Sur"
      />
      <div className="section-tiendas__table-overflow">
        <table className="section-tiendas__table">
          <thead>
            <tr>
              {HEADERS.map(h => (
                <th key={h} className="section-tiendas__th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tiendas.map(t => (
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
  );
}
