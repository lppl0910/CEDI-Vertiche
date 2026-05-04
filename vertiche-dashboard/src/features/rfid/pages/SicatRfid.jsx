import { useState } from 'react';
import SicatHeader from '../components/SicatHeader';
import AnalisisFlujo from '../components/SicatAnalisisFlujo';
import Historial from '../components/Historial';
import Incidencias from '../components/Incidencias';
import { useOrdenes } from '../hooks/useOrdenes';

export default function SicatRfid({ onInterfaceChange, onProfileOpen }) {
  const [currentTab, setCurrentTab] = useState('flujo');
  const { ordenes, loading, error } = useOrdenes();

  const allPrepacks = ordenes.flatMap(o => o.prepacks ?? []);

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F3', fontFamily: 'var(--font)' }}>
      <SicatHeader
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        incBadgeCount={0}
        activeOrderCount={ordenes.length}
        onInterfaceChange={onInterfaceChange}
        onProfileOpen={onProfileOpen}
      />

      {loading && (
        <main style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Cargando ordenes...</main>
      )}
      {error && (
        <main style={{ padding: '2rem', color: 'var(--error)' }}>Error al conectar con el backend: {error}</main>
      )}
      {!loading && !error && (
        <main>
          {currentTab === 'flujo' && (
            <AnalisisFlujo ordenes={ordenes} />
          )}
          {currentTab === 'historial' && (
            <Historial ordenes={ordenes} />
          )}
          {currentTab === 'incidencias' && (
            <Incidencias prepacks={allPrepacks} />
          )}
        </main>
      )}
    </div>
  );
}
