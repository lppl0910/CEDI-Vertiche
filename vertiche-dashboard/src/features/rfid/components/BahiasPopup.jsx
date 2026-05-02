import { useEffect, useRef } from 'react';
import { BAHIA_STORES } from '../data/sicatMockData';

export default function BahiasPopup({ order, triggerRect, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = () => onClose();
    const t = setTimeout(() => document.addEventListener('click', handler), 50);
    return () => { clearTimeout(t); document.removeEventListener('click', handler); };
  }, [onClose]);

  const dist  = order?.bahias?.dist || [];
  const sumPP = dist.reduce((a, b) => a + b, 0);

  const pw   = 236;
  const left = triggerRect
    ? Math.max(8, Math.min(triggerRect.left + triggerRect.width / 2 - pw / 2, window.innerWidth - pw - 8))
    : 8;
  const top  = triggerRect ? triggerRect.bottom + 6 : 100;

  return (
    <div
      ref={ref}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'fixed', left, top, width: pw, zIndex: 500,
        background: '#FFFFFF', border: '1px solid #E7E2DC', borderRadius: 10,
        boxShadow: '0 6px 24px rgba(17,17,17,.13)', padding: '12px 14px',
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#6B6B6B', marginBottom: 8 }}>
        Distribución {order?.id} ({sumPP} pp)
      </div>
      {dist.map((pp, i) => {
        const pct = sumPP > 0 ? Math.round(pp / sumPP * 100) : 0;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: '#6B6B6B', width: 56, flexShrink: 0 }}>
              B{i + 1}·{BAHIA_STORES[i]}
            </span>
            <div style={{ flex: 1, height: 5, background: '#E7E2DC', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: '#C9963B', borderRadius: 999 }} />
            </div>
            <span style={{ fontSize: 9, fontWeight: 600, color: '#1F1F1F', width: 40, textAlign: 'right', flexShrink: 0 }}>
              {pp > 0 ? pp + ' pp' : '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
