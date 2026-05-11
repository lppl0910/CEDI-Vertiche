import { useState } from 'react';

export default function KPICard({ label, value, delta, unit, description }) {
  const [isHovered, setIsHovered] = useState(false);
  const deltaUp = delta > 0;
  // For "rechazo", "fallo", "tiempo" higher delta is bad
  const isBad = label?.toLowerCase().includes('rechazo') || label?.toLowerCase().includes('fallo');
  const isGood = isBad ? !deltaUp : deltaUp;

  const deltaColor = delta === 0 ? '#6B6B6B' : (isGood ? '#6E8B6B' : '#B65E4A');
  const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
  const fallbackDescription = description?.trim()
    ? description
    : `${label}: ${value}${unit ? ` ${unit}` : ''}`;

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E7E2DC',
      borderRadius: 14,
      padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      minWidth: 160,
      flex: 1,
      position: 'relative',
    }}
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    >
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
      <div style={{
        position: 'absolute',
        left: 16,
        right: 16,
        top: '100%',
        marginTop: 10,
        padding: '10px 12px',
        background: '#111111',
        color: '#FFFFFF',
        borderRadius: 10,
        fontSize: 12,
        lineHeight: 1.4,
        boxShadow: '0 12px 24px rgba(0,0,0,0.18)',
        opacity: isHovered ? 1 : 0,
        transform: isHovered ? 'translateY(0)' : 'translateY(4px)',
        transition: 'opacity 140ms ease, transform 140ms ease',
        pointerEvents: 'none',
        zIndex: 5,
      }}>
        {fallbackDescription}
      </div>
    </div>
  );
}
