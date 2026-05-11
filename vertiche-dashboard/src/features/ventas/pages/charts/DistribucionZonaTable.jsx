import { useState, useMemo } from 'react';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';
import "../styles/DistribucionZonaTable.css";

const HEADERS = ['ID', 'Sucursal', 'Zona', 'Ingresos', 'Ticket', 'Uds.'];
const PAGE_SIZE = 10;

export function DistribucionZonaTable({ tiendas }) {
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return q
      ? tiendas.filter(t => t.nombre.toLowerCase().includes(q))
      : tiendas;
  }, [tiendas, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const slice = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <Card>
      <div className="section-tiendas__table-header">
        <ChartTitle
          title="Distribución por Zona"
          sub="Tiendas activas — Zona Norte y Sur"
        />
        <input
          type="text"
          placeholder="Buscar tienda..."
          value={search}
          onChange={handleSearch}
          className="section-tiendas__search"
        />
      </div>

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
            {slice.length > 0
              ? slice.map(t => (
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
                ))
              : (
                <tr>
                  <td colSpan={6} className="section-tiendas__td" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Sin resultados
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>

      <div className="section-tiendas__pagination">
        <span className="section-tiendas__pagination-info">
          {filtered.length === 0
            ? 'Sin resultados'
            : `Mostrando ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} de ${filtered.length} tiendas`
          }
        </span>
        <div className="section-tiendas__pagination-controls">
          <button
            className="section-tiendas__page-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          <span className="section-tiendas__page-current">
            {currentPage} / {totalPages}
          </span>
          <button
            className="section-tiendas__page-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
        </div>
      </div>
    </Card>
  );
}