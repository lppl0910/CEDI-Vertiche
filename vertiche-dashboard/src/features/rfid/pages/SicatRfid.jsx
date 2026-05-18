import { useState, useMemo, useEffect } from 'react';
import SicatHeader from '../components/SicatHeader';
import AnalisisFlujo from '../components/SicatAnalisisFlujo';
import Historial from '../components/Historial';
import Incidencias from '../components/Incidencias';
import { useOrdenes } from '../hooks/useOrdenes';
import { SLA_POR_ETAPA } from '../utils/alertas';

// Maps real API etapa names to the original stage keys
const ETAPA_NAMES  = ['Preregistro', 'QA', 'Registro', 'Sorter', 'Bahias', 'Auditoria', 'Envio'];
const STAGE_KEYS   = ['prereg', 'qa', 'reg', 'sorter', 'bahias', 'audit', 'envio'];
const ETAPA_TO_KEY = Object.fromEntries(ETAPA_NAMES.map((n, i) => [n, STAGE_KEYS[i]]));
const QA_IDX       = 1; // índice de QA en STAGE_KEYS / ETAPA_NAMES

/**
 * Convierte una ProgresoOrden del backend al formato interno del dashboard.
 *
 * Optimizaciones (#task — Isaac Calderon Laflor):
 *  - ppEtapaIdx   pre-computa el índice de etapa de cada prepack una sola vez (O(n))
 *                 eliminando O(7n) llamadas a indexOf dentro de los loops.
 *  - ocupadas     Set para lookup O(1) de etapas actualmente ocupadas.
 *  - fallaPerEtapa Map construida en O(n) en lugar de 7 filtros O(n) separados.
 *  - tsPerEtapa   min/max de timestamps en un solo recorrido de historial.
 *  - effectiveTotal total efectivo post-QA: descuenta rechazados de QA para que
 *                 el porcentaje en etapas siguientes pueda llegar a 100%
 *                 manteniendo el display original (49/50).
 */
function adaptOrden(orden) {
  const rawPP = orden.prepacks ?? [];
  const total = orden.totalPrepacks ?? rawPP.length;
  const now   = Date.now();

  // ── Pre-computaciones O(n) ──────────────────────────────────────────
  // 1. Índice de etapa de cada prepack (reutilizado en todos los loops)
  const ppEtapaIdx = rawPP.map(pp => ETAPA_NAMES.indexOf(pp.currentEtapa ?? ''));

  // 2. Set de etapas con al menos un prepack → O(1) lookup en lugar de .some()
  const ocupadas = new Set(rawPP.map(pp => pp.currentEtapa));

  // 3. Fallas por etapa y min/max de timestamps en un único recorrido
  const fallaPerEtapa = new Map();  // etapa → count
  const tsPerEtapa    = new Map();  // etapa → { min, max }
  let arrivalTs = Infinity;

  for (let i = 0; i < rawPP.length; i++) {
    const pp = rawPP[i];
    if (pp.hasFalla && pp.fallaEtapa) {
      const fallaIdx = ETAPA_NAMES.indexOf(pp.fallaEtapa);
      // Falla ACTIVA: solo si el prepack sigue en la etapa donde ocurrió o antes.
      // Si ya avanzó más allá, la falla es histórica → va a Incidencias, no al panel.
      if (fallaIdx >= 0 && ppEtapaIdx[i] <= fallaIdx) {
        fallaPerEtapa.set(pp.fallaEtapa, (fallaPerEtapa.get(pp.fallaEtapa) ?? 0) + 1);
      }
    }
    for (const e of pp.historial ?? []) {
      const t = new Date(e.timestamp).getTime();
      if (!t) continue;
      if (t < arrivalTs) arrivalTs = t;
      const cur = tsPerEtapa.get(e.etapa);
      if (!cur) tsPerEtapa.set(e.etapa, { min: t, max: t });
      else {
        if (t < cur.min) cur.min = t;
        if (t > cur.max) cur.max = t;
      }
    }
  }
  if (!isFinite(arrivalTs)) arrivalTs = now;

  // 4. Prepacks GENUINAMENTE rechazados en QA (siguen atascados en QA o antes).
  //    Si un prepack tuvo hasFalla='QA' pero luego reanudó y avanzó más allá de QA,
  //    NO se descuenta: su falla fue transitoria y SÍ contribuye al flujo posterior.
  //    Solo contar prepacks que están en índice <= QA_IDX para no inflar proc > effectiveTotal.
  //    Display:    49/50  (total original visible — info relevante)
  //    Porcentaje: 49/49 = 100% (sobre los que sí deben avanzar)
  const failedQACount = rawPP.reduce((count, pp, i) =>
    (pp.hasFalla && pp.fallaEtapa === 'QA' && ppEtapaIdx[i] <= QA_IDX) ? count + 1 : count
  , 0);

  // ── Construcción de etapas ──────────────────────────────────────────
  const stages = {};
  STAGE_KEYS.forEach((key, idx) => {
    const etapa = ETAPA_NAMES[idx];

    // Progreso acumulativo: prepacks en esta etapa o más allá
    let proc = 0;
    for (const pIdx of ppEtapaIdx) if (pIdx >= idx) proc++;

    if (proc === 0) {
      stages[key] = { proc: 0, total, effectiveTotal: total, startMin: 0, durMin: null, status: 'pending', sent: false };
      return;
    }

    const ts       = tsPerEtapa.get(etapa);
    const minTs    = ts?.min ?? null;
    const maxTs    = ts?.max ?? null;
    const startMin = minTs ? Math.max(0, Math.round((minTs - arrivalTs) / 60000)) : 0;
    const durMin   = (minTs && maxTs && maxTs > minTs) ? Math.round((maxTs - minTs) / 60000) : null;

    const fallaCount = fallaPerEtapa.get(etapa) ?? 0;
    const anyHereNow = ocupadas.has(etapa);

    // Total efectivo: etapas tras QA descuentan los rechazados en QA
    const effectiveTotal = idx > QA_IDX ? Math.max(1, total - failedQACount) : total;
    const done           = proc >= effectiveTotal;

    const status = fallaCount > 0 ? 'falla'
      : done       ? 'done'
      : anyHereNow ? 'active'
      : proc > 0   ? 'active'
      : 'pending';

    stages[key] = { proc, total, effectiveTotal, startMin, durMin, status, fallaCount, sent: false };
  });

  if (stages.envio) stages.envio.sent = stages.envio.status === 'done';

  // ── Prepacks adaptados ──────────────────────────────────────────────
  // Pre-agrupa historial por etapa → O(1) lookup en el map interno
  const adaptedPrepacks = rawPP.map((pp, i) => {
    const currentIdx    = ppEtapaIdx[i];
    const histEtapaSet  = new Set((pp.historial ?? []).map(e => e.etapa));
    const stageResults  = STAGE_KEYS.map((key, si) => {
      const etapa = ETAPA_NAMES[si];
      const s     = stages[key];
      // Prepack rechazado en esta etapa → rojo en fila individual, coherente con el rojo de la columna
      if (pp.currentEtapa === etapa) return (pp.hasFalla && pp.fallaEtapa === etapa) ? 'fail' : 'act';
      if (!s || s.status === 'pending') return 'pend';
      if (histEtapaSet.has(etapa))      return 'ok';
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
    // hasFalla a nivel de orden: solo si hay fallas ACTIVAS (prepack aún atascado).
    // Las fallas resueltas quedan en Incidencias como historial, no en el panel.
    hasFalla: rawPP.some((pp, i) => {
      if (!pp.hasFalla || !pp.fallaEtapa) return false;
      const fallaIdx = ETAPA_NAMES.indexOf(pp.fallaEtapa);
      return fallaIdx >= 0 && ppEtapaIdx[i] <= fallaIdx;
    }),
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

export default function SicatRfid({ onInterfaceChange, onProfileOpen, onAdminOpen, allowedPanels, user }) {
  const [currentTab,      setCurrentTab]      = useState('flujo');
  const [incOverrides,    setIncOverrides]    = useState({}); // keyed by ppId
  // #217 — Filtros que se pasan al backend vía useOrdenes
  const [backendFilters,  setBackendFilters]  = useState({});
  const { ordenes, loading, error, connected } = useOrdenes(backendFilters);

  const adaptedOrders = useMemo(() => ordenes.map(adaptOrden), [ordenes]);
  const allPrepacks   = useMemo(() => ordenes.flatMap(o => o.prepacks ?? []), [ordenes]);

  const baseIncidencias = useMemo(() => buildIncidencias(allPrepacks), [allPrepacks]);
  const incidencias     = useMemo(
    () => baseIncidencias.map(inc => ({ ...inc, ...(incOverrides[inc.ppId] || {}) })),
    [baseIncidencias, incOverrides],
  );

  const handleUpdateIncidencia = (incId, changes) => {
    const inc = incidencias.find(i => i.id === incId);
    if (!inc) return;
    setIncOverrides(prev => ({ ...prev, [inc.ppId]: { ...(prev[inc.ppId] || {}), ...changes } }));
    // Persistir cambio al backend (best-effort — no bloquea UI si falla)
    fetch('http://localhost:3001/api/alertas', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ...inc, ...changes }),
    }).catch(err => console.warn('[RFID] No se pudo persistir incidencia:', err.message));
  };

  const openIncCount   = incidencias.filter(i => i.status === 'open' || i.status === 'escalated').length;
  const activeOrdCount = adaptedOrders.filter(o => !o.envio?.sent).length;

  // Conecta la búsqueda del header con los filtros del backend
  const handleSearch = (q) => setBackendFilters(prev => ({ ...prev, search: q || undefined }));

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F3', fontFamily: 'var(--font)' }}>
      <SicatHeader
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        incBadgeCount={openIncCount}
        activeOrderCount={activeOrdCount}
        onSearch={handleSearch}
        onInterfaceChange={onInterfaceChange}
        onProfileOpen={onProfileOpen}
        onAdminOpen={onAdminOpen}
        allowedPanels={allowedPanels}
        user={user}
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
            />
          )}
        </main>
      )}
    </div>
  );
}
