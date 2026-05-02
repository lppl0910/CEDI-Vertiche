import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const STAGE_LINES = [
  { key: 'preregistro', label: 'Preregistro', color: '#6E8B6B' },
  { key: 'qa',          label: 'QA',          color: '#C9963B' },
  { key: 'registro',    label: 'Registro',    color: '#4A7FA5' },
  { key: 'sorter',      label: 'Sorter',      color: '#7B5EA7' },
  { key: 'bahias',      label: 'Bahías',      color: '#B65E4A' },
  { key: 'auditoria',   label: 'Auditoría',   color: '#3A8F8F' },
  { key: 'envio',       label: 'Envío',       color: '#9B8560' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1F1F1F', borderRadius: 8, padding: '10px 14px',
      fontSize: 12, fontFamily: 'var(--font)', lineHeight: 1.8,
      boxShadow: '0 2px 12px rgba(0,0,0,0.22)',
    }}>
      <div style={{ color: '#9B9590', marginBottom: 4, fontWeight: 500 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong style={{ color: '#FFFFFF' }}>{p.value} pp/min</strong>
        </div>
      ))}
    </div>
  );
}

export default function PerformanceChart({ data }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: '#1F1F1F', marginBottom: 2 }}>
          Performance por etapa
        </h2>
        <p style={{ fontSize: 12, color: '#6B6B6B' }}>
          pp/min a lo largo del turno · {data[0]?.tiempo} – {data[data.length - 1]?.tiempo}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E7E2DC" vertical={false} />
          <XAxis
            dataKey="tiempo"
            tick={{ fontSize: 11, fill: '#9B9590', fontFamily: 'var(--font)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9B9590', fontFamily: 'var(--font)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v}`}
            width={32}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, fontFamily: 'var(--font)', paddingTop: 12 }}
            iconType="circle"
            iconSize={8}
          />
          {STAGE_LINES.map(s => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
