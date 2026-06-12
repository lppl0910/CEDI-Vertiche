import { STAGE_KEYS, STAGE_LABELS, fmtTs, fmtMin } from '../data/sicatMockData';

const CK_ICON  = { ok:'✓', fail:'✗', act:'⟳', pend:'—' };
const CK_COLOR = { ok:'#6E8B6B', fail:'#B65E4A', act:'#C9963B', pend:'#7C8A96' };

export default function PrepPackModal({ order, prepack, loading, error, onClose }) {
  if (!order || !prepack) return null;

  const seed   = prepack.id.charCodeAt(3) + prepack.id.charCodeAt(4);
  const pzas   = prepack.cantidad_total ?? (6 + (seed % 7));
  const colChips = (prepack.distribucion_color?.length
    ? prepack.distribucion_color.map(d => `${d.color}: ${d.num_color} pzas`)
    : (prepack.color && prepack.color !== '—' ? [prepack.color] : [])
  );
  const szChips = prepack.distribucion_talla
    ? Object.entries(prepack.distribucion_talla)
        .filter(([, v]) => Number(v) > 0)
        .map(([k, v]) => `T-${k}: ${v} pzas`)
    : (prepack.size && prepack.size !== '—' ? [prepack.size] : []);

  const tlRows = STAGE_KEYS.map((k, si) => {
    const s   = order[k];
    const res = prepack.stageResults[si];
    let tStr = '—', dStr = '—';
    if (s && s.status !== 'pending') {
      const st = order.arrivalTs + s.startMin * 60000;
      const et = s.durMin ? st + s.durMin * 60000 : null;
      tStr = fmtTs(st) + ' → ' + (et ? fmtTs(et) : '···');
      if (s.durMin) dStr = fmtMin(s.durMin);
    }
    const nota = res === 'fail' && s?.fallaDesc
      ? s.fallaDesc.slice(0, 40)
      : null;
    return { label: STAGE_LABELS[si], tStr, dStr, res, nota };
  });

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(17,17,17,.38)', backdropFilter: 'blur(2px)',
        zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        background: '#FFFFFF', borderRadius: 14, boxShadow: '0 8px 40px rgba(17,17,17,.2)',
        width: 'min(580px, 94vw)', maxHeight: '88vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #E7E2DC', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{prepack.id}</div>
            <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>{order.id} — {order.product}</div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E7E2DC', background: 'transparent', cursor: 'pointer', fontSize: 14, color: '#6B6B6B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' }}>✕</button>
        </div>
        {/* Loader */}
        {loading && (
          <div style={{ padding: '12px 18px', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{
              width: 14, height: 14, borderRadius: '50%',
              border: '2px solid #E7E2DC', borderTopColor: '#6E8B6B',
              display: 'inline-block', animation: 'spin 1s linear infinite',
            }} />
            <span style={{ fontSize: 11, color: '#6B6B6B' }}>Cargando detalle…</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {error && (
          <div style={{ padding: '0 18px 12px', fontSize: 11, color: '#B65E4A' }}>
            {error}
          </div>
        )}
        {/* Body */}
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Info grid */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#6B6B6B', marginBottom: 7 }}>Información del prepack</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[
                ['Modelo',        order.product],
                ['Tienda destino',prepack.store],
                ['Total piezas',  `${pzas} pzas`],
                ['Bahía destino', `Bahía ${prepack.bahiaIdx + 1}`],
                ['Orden padre',   order.id],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.4px', color: '#6B6B6B' }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Color chips */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#6B6B6B', marginBottom: 7 }}>Composición por color</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {colChips.map(c => <span key={c} style={{ padding: '3px 9px', background: '#F8F6F3', border: '1px solid #E7E2DC', borderRadius: 6, fontSize: 11 }}>{c}</span>)}
            </div>
          </div>

          {/* Size chips */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#6B6B6B', marginBottom: 7 }}>Composición por talla</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {szChips.map(s => <span key={s} style={{ padding: '3px 9px', background: '#F8F6F3', border: '1px solid #E7E2DC', borderRadius: 6, fontSize: 11 }}>{s}</span>)}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', color: '#6B6B6B', marginBottom: 7 }}>Recorrido en el CEDI</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {tlRows.map((row, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < tlRows.length - 1 ? '1px solid #F5F2EE' : 'none' }}>
                  <span style={{ flex: '0 0 88px', fontWeight: 600, fontSize: 11 }}>{row.label}</span>
                  <span style={{ flex: '0 0 118px', color: '#6B6B6B', fontSize: 10, fontVariantNumeric: 'tabular-nums' }}>{row.tStr}</span>
                  <span style={{ flex: '0 0 18px', fontSize: 12, fontWeight: 700, color: CK_COLOR[row.res] }}>{CK_ICON[row.res]}</span>
                  <span style={{ fontSize: 10, color: '#6B6B6B' }}>{row.dStr}</span>
                  {row.nota && <span style={{ fontSize: 9, color: '#B65E4A', marginLeft: 6 }}>⚠ {row.nota}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
