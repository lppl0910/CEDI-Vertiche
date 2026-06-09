import { useState } from 'react';
import { clasificarAlerta } from '../utils/alertas';

const ETAPAS = ['Preregistro', 'QA', 'Registro', 'Sorter', 'Bahias', 'Auditoria', 'Envio'];
const ETAPA_INIT = { Preregistro: 'P', QA: 'Q', Registro: 'R', Sorter: 'S', Bahias: 'B', Auditoria: 'A', Envio: 'E' };

const STATUS_COLOR = {
  success: 'var(--success)',
  warning: 'var(--warning)',
  error:   'var(--error)',
};

function nodeStatus(etapa, orden) {
  const pe = orden.progresoEtapa?.find(p => p.etapa === etapa);
  if (!pe || pe.count === 0) return null;

  const prepacks = orden.prepacks ?? [];
  const etapaEvents = prepacks
    .flatMap(pp => (pp.historial ?? []).filter(e => e.etapa === etapa))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Si no hay eventos reales en el historial, no pintar el nodo
  if (etapaEvents.length === 0) return null;

  return clasificarAlerta(etapa, etapaEvents[0].timestamp);
}

function fmtElapsed(ms) {
  const min = ms / 60000;
  if (min >= 60) return `${Math.floor(min / 60)}h ${Math.round(min % 60)}m`;
  return `${Math.round(min)} min`;
}

function Tooltip({ etapa, orden }) {
  const pe = orden.progresoEtapa?.find(p => p.etapa === etapa);
  const count = pe?.count ?? 0;
  const total = pe?.total ?? orden.totalPrepacks ?? 0;

  const prepacks = orden.prepacks ?? [];
  const etapaEvents = prepacks
    .flatMap(pp => (pp.historial ?? []).filter(e => e.etapa === etapa))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const elapsed = etapaEvents.length > 0
    ? fmtElapsed(Date.now() - new Date(etapaEvents[0].timestamp).getTime())
    : '—';

  return (
    <div style={{
      position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
      marginBottom: 6, background: '#1F1F1F', color: '#FFFFFF', borderRadius: 6,
      padding: '5px 9px', fontSize: 10, whiteSpace: 'nowrap', zIndex: 50,
      pointerEvents: 'none',
    }}>
      <div style={{ fontWeight: 700 }}>{etapa}</div>
      <div>{count} / {total} prepacks</div>
      <div style={{ color: '#CCC6BE' }}>Ultimo: {elapsed}</div>
    </div>
  );
}

export default function OrdenTimeline({ orden }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '8px 0' }}>
      {ETAPAS.map((etapa, i) => {
        const status = nodeStatus(etapa, orden);
        const color  = status ? STATUS_COLOR[status] : 'var(--border)';
        const isLast = i === ETAPAS.length - 1;

        return (
          <div key={etapa} style={{ display: 'flex', alignItems: 'center', flex: isLast ? 'none' : 1, position: 'relative' }}>
            <div
              onMouseEnter={() => setHovered(etapa)}
              onMouseLeave={() => setHovered(null)}
              style={{ position: 'relative' }}
            >
              {hovered === etapa && <Tooltip etapa={etapa} orden={orden} />}
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: color, color: status ? '#FFFFFF' : '#6B6B6B',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, flexShrink: 0, cursor: 'default',
                border: status ? 'none' : '1.5px solid #CCC6BE',
              }}>
                {ETAPA_INIT[etapa]}
              </div>
            </div>
            {!isLast && (
              <div style={{ flex: 1, height: 2, background: 'var(--border)', minWidth: 6 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
