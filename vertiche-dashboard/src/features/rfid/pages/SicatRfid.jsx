import { useState, useEffect } from 'react';
import SicatHeader from '../components/SicatHeader';
import AnalisisFlujo from '../components/SicatAnalisisFlujo';
import Historial from '../components/Historial';
import Incidencias from '../components/Incidencias';
import {
  buildOrders, buildHistorical, initIncidencias, simulateStep,
} from '../data/sicatMockData';

export default function SicatRfid({ onInterfaceChange, onProfileOpen }) {
  const [currentTab, setCurrentTab] = useState('flujo');
  const [state, setState] = useState(() => {
    const orders           = buildOrders();
    const historicalOrders = buildHistorical();
    const incidencias      = initIncidencias(orders, historicalOrders);
    return { orders, historicalOrders, incidencias };
  });

  useEffect(() => {
    const id = setInterval(() => {
      setState(prev => {
        const { orders, incidencias } = simulateStep(prev.orders, prev.incidencias);
        return { ...prev, orders, incidencias };
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const handleUpdateIncidencia = (incId, changes) => {
    setState(prev => ({
      ...prev,
      incidencias: prev.incidencias.map(i => i.id === incId ? { ...i, ...changes } : i),
    }));
  };

  const { orders, historicalOrders, incidencias } = state;

  const openIncCount    = incidencias.filter(i => i.status === 'open' || i.status === 'escalated').length;
  const activeOrdCount  = orders.filter(o => !o.envio?.sent).length;

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F3', fontFamily: 'var(--font)' }}>
      <SicatHeader
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        incBadgeCount={openIncCount}
        activeOrderCount={activeOrdCount}
        onInterfaceChange={onInterfaceChange}
        onProfileOpen={onProfileOpen}
      />

      <main>
        {currentTab === 'flujo' && (
          <AnalisisFlujo orders={orders} />
        )}
        {currentTab === 'historial' && (
          <Historial
            historicalOrders={historicalOrders}
            activeOrders={orders}
          />
        )}
        {currentTab === 'incidencias' && (
          <Incidencias
            incidencias={incidencias}
            onUpdateIncidencia={handleUpdateIncidencia}
          />
        )}
      </main>
    </div>
  );
}
