import { useState, useMemo } from 'react';
import SicatHeader from '../components/SicatHeader';
import AnalisisFlujo from '../components/SicatAnalisisFlujo';
import Historial from '../components/Historial';
import Incidencias from '../components/Incidencias';
import { useOrdenes } from '../hooks/useOrdenes';
import { SLA_POR_ETAPA } from '../utils/alertas';

// Maps real API etapa names to the original stage keys
const ETAPA_NAMES = ['Preregistro', 'QA', 'Registro', 'Sorter', 'Bahias', 'Auditoria', 'Envio'];
const STAGE_KEYS  = ['prereg', 'qa', 'reg', 'sorter', 'bahias', 'audit', 'envio'];
const ETAPA_TO_KEY = Object.fromEntries(ETAPA_NAMES.map((n, i) => [n, STAGE_KEYS[i]]));

function adaptOrden(orden) {
  const rawPP = orden.prepacks ?? [];

  const allTs = rawPP
    .flatMap(pp => (pp.historial ?? []).map(e => new Date(e.timestamp).getTime()))
    .filter(Boolean);
  const arrivalTs = allTs.length > 0 ? Math.min(...allTs) : Date.now();

  const stages = {};
  STAGE_KEYS.forEach((key, idx) => {
    const etapa = ETAPA_NAMES[idx];
    const pe    = (orden.progresoEtapa ?? []).find(p => p.etapa === etapa);
    const total = orden.totalPrepacks ?? 0;

    if (!pe || pe.total === 0) {
      stages[key] = { proc: 0, total, startMin: 0, durMin: null, status: 'pending', sent: false };
      return;
    }

    const etapaTs = rawPP
      .flatMap(pp => (pp.historial ?? []).filter(e => e.etapa === etapa).map(e => new Date(e.timestamp).getTime()))
      .filter(Boolean);

    const minTs    = etapaTs.length > 0 ? Math.min(...etapaTs) : null;
    const maxTs    = etapaTs.length > 0 ? Math.max(...etapaTs) : null;
    const startMin = minTs ? Math.max(0, Math.round((minTs - arrivalTs) / 60000)) : 0;
    const durMin   = (minTs && maxTs && maxTs > minTs) ? Math.round((maxTs - minTs) / 60000) : null;

    const anyActiveInStage = rawPP.some(pp => pp.currentEtapa === etapa);
    let status;
    if (pe.count === 0) status = 'pending';
    else if (anyActiveInStage) status = 'active';
    else if (pe.count >= pe.total) status = 'done';
    else status = 'active';

    stages[key] = { proc: pe.count, total: pe.total, startMin, durMin, status, sent: false };
  });

  if (stages.envio) stages.envio.sent = stages.envio.status === 'done';

  const adaptedPrepacks = rawPP.map(pp => {
    const currentIdx = ETAPA_NAMES.indexOf(pp.currentEtapa ?? '');
    const stageResults = STAGE_KEYS.map((key, si) => {
      const etapa = ETAPA_NAMES[si];
      const s     = stages[key];
      if (pp.currentEtapa === etapa) return 'act';
      if (!s || s.status === 'pending') return 'pend';
      const ppEvents = (pp.historial ?? []).filter(e => e.etapa === etapa);
      if (ppEvents.length > 0) return 'ok';
      if (currentIdx >= 0 && si < currentIdx) return 'pend';
      return 'pend';
    });

    return { id: pp.id, color: '—', size: '—', store: '—', bahiaIdx: 0, stageResults };
  });

  return {
    id: orden.orderId,
    team: '',
    product: orden.orderId,
    pidx: 0,
    arrivalTs,
    hasFalla: false,
    colors: ['—'],
    sizes: ['—'],
    prepacks: adaptedPrepacks,
    ...stages,
  };
}

function buildIncidencias(prepacks) {
  const detected = prepacks.filter(pp => {
    const sla = SLA_POR_ETAPA[pp.currentEtapa];
    if (!sla) return false;
    const events = (pp.historial ?? [])
      .filter(e => e.etapa === pp.currentEtapa)
      .map(e => new Date(e.timestamp).getTime());
    if (events.length === 0) return false;
    return (Date.now() - Math.max(...events)) / 60000 > sla;
  });

  return detected.map((pp, i) => {
    const sla    = SLA_POR_ETAPA[pp.currentEtapa] ?? 0;
    const events = (pp.historial ?? [])
      .filter(e => e.etapa === pp.currentEtapa)
      .map(e => new Date(e.timestamp).getTime());
    const lastTs     = events.length > 0 ? Math.max(...events) : null;
    const elapsedMin = lastTs ? Math.round((Date.now() - lastTs) / 60000) : 0;
    const status     = elapsedMin >= sla * 2 ? 'escalated' : 'open';
    const stage      = ETAPA_TO_KEY[pp.currentEtapa] ?? pp.currentEtapa;
    const desc       = elapsedMin >= sla * 2
      ? `Prepack crítico — detenido ${elapsedMin}min en ${pp.currentEtapa}, supera 2x SLA`
      : `Prepack detenido ${elapsedMin}min en ${pp.currentEtapa} — revisar lectora RFID`;

    return {
      id:         `INC-${String(i + 1).padStart(3, '0')}`,
      ppId:       pp.id,
      orderId:    pp.orderId,
      stage,
      desc,
      status,
      causa:      '',
      ts:         lastTs,
      resolvedAt: null,
    };
  });
}

export default function SicatRfid({ onInterfaceChange, onProfileOpen }) {
  const [currentTab,   setCurrentTab]   = useState('flujo');
  const [incOverrides, setIncOverrides] = useState({}); // keyed by ppId
  const { ordenes, loading, error }     = useOrdenes();

  const adaptedOrders = useMemo(() => ordenes.map(adaptOrden), [ordenes]);
  const allPrepacks   = useMemo(() => ordenes.flatMap(o => o.prepacks ?? []), [ordenes]);

  const baseIncidencias = useMemo(() => buildIncidencias(allPrepacks), [allPrepacks]);
  const incidencias     = useMemo(
    () => baseIncidencias.map(inc => ({ ...inc, ...(incOverrides[inc.ppId] || {}) })),
    [baseIncidencias, incOverrides],
  );

  const handleUpdateIncidencia = (incId, changes) => {
    const inc = incidencias.find(i => i.id === incId);
    if (inc) setIncOverrides(prev => ({ ...prev, [inc.ppId]: { ...(prev[inc.ppId] || {}), ...changes } }));
  };

  const openIncCount   = incidencias.filter(i => i.status === 'open' || i.status === 'escalated').length;
  const activeOrdCount = adaptedOrders.filter(o => !o.envio?.sent).length;

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

      {loading && (
        <main style={{ padding: '2rem', color: '#6B6B6B' }}>Cargando órdenes...</main>
      )}
      {error && (
        <main style={{ padding: '2rem', color: '#B65E4A' }}>Error al conectar con el backend: {error}</main>
      )}
      {!loading && !error && (
        <main>
          {currentTab === 'flujo' && (
            <AnalisisFlujo orders={adaptedOrders} />
          )}
          {currentTab === 'historial' && (
            <Historial
              historicalOrders={[]}
              activeOrders={adaptedOrders}
            />
          )}
          {currentTab === 'incidencias' && (
            <Incidencias
              incidencias={incidencias}
              onUpdateIncidencia={handleUpdateIncidencia}
            />
          )}
        </main>
      )}
    </div>
  );
}
