import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#FFFFFF',
          border: '1px solid #E7E2DC',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 13,
          color: selected ? '#1F1F1F' : '#6B6B6B',
          cursor: 'pointer',
          width: '100%',
          justifyContent: 'space-between',
          fontFamily: 'var(--font)',
        }}
      >
        {selected ? selected.label : label}
        <ChevronDown size={14} color="#6B6B6B" />
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: '#FFFFFF',
          border: '1px solid #E7E2DC',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          zIndex: 10,
          overflow: 'hidden',
        }}>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                fontSize: 13,
                color: opt.value === value ? '#111111' : '#1F1F1F',
                background: opt.value === value ? '#F8F6F3' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font)',
                fontWeight: opt.value === value ? 500 : 400,
              }}
              onMouseEnter={e => e.target.style.background = '#F8F6F3'}
              onMouseLeave={e => e.target.style.background = opt.value === value ? '#F8F6F3' : 'transparent'}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
