import { useState, useMemo, useEffect } from 'react';
import SicatHeader from '../components/SicatHeader';
import AnalisisFlujo from '../components/SicatAnalisisFlujo';
import Historial from '../components/Historial';
import Incidencias from '../components/Incidencias';
import HistorialAlertas from '../components/HistorialAlertas';
import { useOrdenes } from '../hooks/useOrdenes';
import { useAlertas } from '../hooks/useAlertas';
import { SLA_POR_ETAPA } from '../utils/alertas';

// Maps real API etapa names to the original stage keys
const ETAPA_NAMES = ['Preregistro', 'QA', 'Registro', 'Sorter', 'Bahias', 'Auditoria', 'Envio'];
const STAGE_KEYS  = ['prereg', 'qa', 'reg', 'sorter', 'bahias', 'audit', 'envio'];
const ETAPA_TO_KEY = Object.fromEntries(ETAPA_NAMES.map((n, i) => [n, STAGE_KEYS[i]]));

function adaptOrden(orden) {
  const rawPP = orden.prepacks ?? [];
  const total = orden.totalPrepacks ?? rawPP.length;

  // Arrival = earliest timestamp in any prepack's historial
  const allTs = rawPP
    .flatMap(pp => (pp.historial ?? []).map(e => new Date(e.timestamp).getTime()))
    .filter(Boolean);
  const arrivalTs = allTs.length > 0 ? Math.min(...allTs) : Date.now();

  const stages = {};
  STAGE_KEYS.forEach((key, idx) => {
    const etapa = ETAPA_NAMES[idx];

    // Progreso ACUMULATIVO: cuenta prepacks que ya llegaron a esta etapa
    // o la superaron (currentEtapa index >= idx). Así los porcentajes
    // solo suben conforme el simulador avanza prepacks.
    const proc = rawPP.filter(pp => {
      const ppIdx = ETAPA_NAMES.indexOf(pp.currentEtapa ?? '');
      return ppIdx >= idx;
    }).length;

    if (proc === 0) {
      stages[key] = { proc: 0, total, startMin: 0, durMin: null, status: 'pending', sent: false };
      return;
    }

    // Timestamps: historial registra cuándo salió un prepack de una etapa
    // (el campo "etapa" del evento = etapa que estaba ABANDONANDO)
    const etapaTs = rawPP
      .flatMap(pp => (pp.historial ?? []).filter(e => e.etapa === etapa).map(e => new Date(e.timestamp).getTime()))
      .filter(Boolean);

    const minTs    = etapaTs.length > 0 ? Math.min(...etapaTs) : null;
    const maxTs    = etapaTs.length > 0 ? Math.max(...etapaTs) : null;
    const startMin = minTs ? Math.max(0, Math.round((minTs - arrivalTs) / 60000)) : 0;
    const durMin   = (minTs && maxTs && maxTs > minTs) ? Math.round((maxTs - minTs) / 60000) : null;

    const done = proc >= total;
    const anyHereNow = rawPP.some(pp => pp.currentEtapa === etapa);
    // Falla: algún prepack tiene error de lectura registrado en esta etapa
    const fallaCount = rawPP.filter(pp => pp.hasFalla && pp.fallaEtapa === etapa).length;
    const status = fallaCount > 0 ? 'falla'
      : done       ? 'done'
      : anyHereNow ? 'active'
      : proc > 0   ? 'active'
      : 'pending';

    stages[key] = { proc, total, startMin, durMin, status, fallaCount, sent: false };
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
    hasFalla: rawPP.some(pp => pp.hasFalla),
    colors: ['—'],
    sizes: ['—'],
    prepacks: adaptedPrepacks,
    ...stages,
  };
}

function buildIncidencias(prepacks) {
  const incidencias = [];

  // ── 1. Fallas registradas por el backend (errores RFID reales) ────────
  const conFalla = prepacks.filter(pp => pp.hasFalla);
  conFalla.forEach((pp, i) => {
    const etapa = pp.fallaEtapa ?? pp.currentEtapa;
    const stage = ETAPA_TO_KEY[etapa] ?? etapa;
    incidencias.push({
      id:         `INC-${String(i + 1).padStart(3, '0')}`,
      ppId:       pp.id,
      orderId:    pp.orderId ?? '',
      stage,
      desc:       `Error de lectura RFID en ${etapa} — prepack ${pp.id} no pudo ser escaneado`,
      status:     'open',
      causa:      '',
      ts:         Date.now(),
      resolvedAt: null,
    });
  });

  // ── 2. Prepacks detenidos más allá del SLA (detección por tiempo) ─────
  const offset = conFalla.length;
  const porSLA = prepacks.filter(pp => {
    if (pp.hasFalla) return false; // ya está arriba
    const sla = SLA_POR_ETAPA[pp.currentEtapa];
    if (!sla) return false;
    const events = (pp.historial ?? [])
      .filter(e => e.etapa === pp.currentEtapa)
      .map(e => new Date(e.timestamp).getTime());
    if (events.length === 0) return false;
    return (Date.now() - Math.max(...events)) / 60000 > sla;
  });

  porSLA.forEach((pp, i) => {
    const sla    = SLA_POR_ETAPA[pp.currentEtapa] ?? 0;
    const events = (pp.historial ?? [])
      .filter(e => e.etapa === pp.currentEtapa)
      .map(e => new Date(e.timestamp).getTime());
    const lastTs     = events.length > 0 ? Math.max(...events) : null;
    const elapsedMin = lastTs ? Math.round((Date.now() - lastTs) / 60000) : 0;
    const status     = elapsedMin >= sla * 2 ? 'escalated' : 'open';
    const stage      = ETAPA_TO_KEY[pp.currentEtapa] ?? pp.currentEtapa;
    incidencias.push({
      id:         `INC-${String(offset + i + 1).padStart(3, '0')}`,
      ppId:       pp.id,
      orderId:    pp.orderId ?? '',
      stage,
      desc:       elapsedMin >= sla * 2
        ? `Prepack crítico — detenido ${elapsedMin}min en ${pp.currentEtapa}, supera 2× SLA`
        : `Prepack detenido ${elapsedMin}min en ${pp.currentEtapa} — revisar lectora RFID`,
      status,
      causa:      '',
      ts:         lastTs,
      resolvedAt: null,
    });
  });

  return incidencias;
}

export default function SicatRfid({ onInterfaceChange, onProfileOpen }) {
  const [currentTab,      setCurrentTab]      = useState('flujo');
  const [incOverrides,    setIncOverrides]    = useState({}); // keyed by ppId
  // #217 — Filtros que se pasan al backend vía useOrdenes
  const [backendFilters,  setBackendFilters]  = useState({});
  const { ordenes, loading, error, connected } = useOrdenes(backendFilters);
  const { alertasBD, sendAlertas }            = useAlertas();

  const adaptedOrders = useMemo(() => ordenes.map(adaptOrden), [ordenes]);
  const allPrepacks   = useMemo(() => ordenes.flatMap(o => o.prepacks ?? []), [ordenes]);

  const baseIncidencias = useMemo(() => buildIncidencias(allPrepacks), [allPrepacks]);
  const incidencias     = useMemo(
    () => baseIncidencias.map(inc => ({ ...inc, ...(incOverrides[inc.ppId] || {}) })),
    [baseIncidencias, incOverrides],
  );

  // Sincronizar las incidencias detectadas dinámicamente con la BD
  useEffect(() => {
    if (baseIncidencias.length > 0) {
      sendAlertas(baseIncidencias);
    }
  }, [baseIncidencias, sendAlertas]);

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

      {/* Indicador de conexión en tiempo real */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 24px',
        background: connected ? 'rgba(110,139,107,.08)' : 'rgba(182,94,74,.07)',
        borderBottom: `1px solid ${connected ? 'rgba(110,139,107,.2)' : 'rgba(182,94,74,.2)'}`,
        fontSize: 11, fontWeight: 600,
        color: connected ? '#4A7A47' : '#B65E4A',
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: connected ? '#6E8B6B' : '#B65E4A',
          boxShadow: connected ? '0 0 0 2px rgba(110,139,107,.3)' : 'none',
          animation: connected ? 'pulse-live 2s infinite' : 'none',
          display: 'inline-block',
        }} />
        {connected ? 'RFID en tiempo real · conectado al servidor' : 'Sin conexión al servidor — los datos no se actualizan en tiempo real'}
        <style>{`@keyframes pulse-live { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      </div>

      {loading && (
        <main style={{ padding: '2rem', color: '#6B6B6B' }}>Cargando órdenes...</main>
      )}
      {error && (
        <main style={{ padding: '2rem', color: '#B65E4A' }}>Error al conectar con el backend: {error}</main>
      )}
      {!loading && !error && (
        <main>
          {currentTab === 'flujo' && (
            <AnalisisFlujo
              orders={adaptedOrders}
              onFiltersChange={setBackendFilters}
            />
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
          {currentTab === 'alertas' && (
            <HistorialAlertas alertas={alertasBD} />
          )}
        </main>
      )}
    </div>
  );
}
