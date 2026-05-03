import { SECTIONS } from './CONSTANTES';
import { SectionPerformance } from './SectionPerformance';
import { SectionTendencias } from './SectionTendencias';
import { ChatFAB } from './ChatFAB';
import ComponenteEsquina from './components/ComponenteEsquina';
import './styles/Ventas.css';

export default function Ventas({
  section  = 'tendencias',
  filters  = { period: '30d', zona: 'all', temporada: 'all' },
}) {
  const objFechaHoy     = new Date();
  const CurrentDateInMs = objFechaHoy.getTime();
  const msPerDay        = 8.64e7;
  const ActiveSection   = SECTIONS[section] || SectionTendencias;

  const periodDays = { '7d': 7, '30d': 30, '90d': 90 };
  const periodo    = periodDays[filters.period] ?? 365;

  const locale = 'es-MX';
  const dateOpts = { year: 'numeric', month: 'long', day: 'numeric' };
  const strFechaPeriodo = new Date(CurrentDateInMs - msPerDay * periodo).toLocaleDateString(locale, dateOpts);
  const strFechaHoy     = objFechaHoy.toLocaleDateString(locale, dateOpts);

  console.log("Componente actualizado!")

  return (
    <div className="ventas">
      <ComponenteEsquina fechaPeriodo={strFechaPeriodo} fechaHoy={strFechaHoy} />
      <SectionPerformance filters={filters} />
      <ActiveSection filters={filters} />
      <ChatFAB />
    </div>
  );
}
