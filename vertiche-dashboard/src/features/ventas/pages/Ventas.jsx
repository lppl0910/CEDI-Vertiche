import { SectionPerformance } from './SectionPerformance';
import { SectionTendencias } from './SectionTendencias';
import { ChatFAB } from './ChatFAB';
import './styles/Ventas.css';
import { SectionProductos } from './SectionProductos';
import { SectionTiendas } from './SectionTiendas';

// eslint-disable-next-line react-refresh/only-export-components
export const SECTIONS = {
  tendencias: SectionTendencias,
  productos:  SectionProductos,
  tiendas:    SectionTiendas,
};

export default function Ventas({
  section = 'tendencias',
  filters = { period: '30d', zona: 'all', temporada: 'all' },
}) {
  const ActiveSection = SECTIONS[section] || SectionTendencias;

  return (
    <div className="ventas">
      <SectionPerformance filters={filters} />
      <ActiveSection filters={filters} />
      <ChatFAB />
    </div>
  );
}