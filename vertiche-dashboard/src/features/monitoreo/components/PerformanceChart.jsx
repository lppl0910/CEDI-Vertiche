import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import '../monitoreo.css';

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
    <div className="mon-tooltip mon-tooltip--dark">
      <div className="mon-tooltip__label">{label}</div>
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
      <div className="mon-perf-header">
        <h2 className="mon-perf-title">Performance por etapa</h2>
        <p className="mon-perf-subtitle">
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
