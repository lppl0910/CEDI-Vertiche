export default function KPICard({ label, value, delta, unit }) {
  const deltaUp = delta > 0;
  // For "rechazo", "fallo", "tiempo" higher delta is bad
  const isBad = label?.toLowerCase().includes('rechazo') || label?.toLowerCase().includes('fallo');
  const isGood = isBad ? !deltaUp : deltaUp;

  const deltaColor = delta === 0 ? '#6B6B6B' : (isGood ? '#6E8B6B' : '#B65E4A');
  const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E7E2DC',
      borderRadius: 14,
      padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      minWidth: 160,
      flex: 1,
    }}>
      <div style={{
        fontSize: 11,
        color: '#6B6B6B',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 8,
        fontWeight: 500,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 600, color: '#1F1F1F', lineHeight: 1.1 }}>
        {value}
        <span style={{ fontSize: 14, fontWeight: 400, color: '#6B6B6B', marginLeft: 4 }}>
          {unit}
        </span>
      </div>
      {delta !== undefined && (
        <div style={{ fontSize: 13, color: deltaColor, marginTop: 6 }}>
          {arrow} {Math.abs(delta)} {unit}
        </div>
      )}
    </div>
  );
}
