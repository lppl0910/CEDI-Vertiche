import { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';

const TALLA_COLORS = ['#D8C3A5', '#A48F7A', '#D9B8B0', '#6E8B6B', '#8E9AAF', '#C9963B', '#B65E4A'];

const TALLAS_LETRA  = ['XCH', 'CH', 'M', 'G', 'XG', 'Unitalla'];
const TALLAS_NUMERO = ['34', '36', '38', '40', '42'];

const renderLabel = ({ name, value, total, cx, cy, midAngle, outerRadius }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const pct = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
  return (
    <text x={x} y={y} fill="var(--text-secondary)" textAnchor="middle" dominantBaseline="central" fontSize={8}>
      {`${name} ${pct}%`}
    </text>
  );
};

export function UnidadesTallaChart({ tallas }) {
  const [filtro, setFiltro] = useState('letra');

  const tallasFiltradas = tallas.filter(t =>
    filtro === 'letra'
      ? TALLAS_LETRA.includes(t.name)
      : TALLAS_NUMERO.includes(t.name)
  );

  const total = tallasFiltradas.reduce((sum, t) => sum + t.value, 0);

  return (
    <Card>
      <ChartTitle title="Unidades por Talla" />
      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFiltro('letra')}
          style={{
            fontSize: 9, padding: '2px 7px', borderRadius: 4, cursor: 'pointer',
            background: filtro === 'letra' ? 'var(--accent-black)' : 'transparent',
            color: filtro === 'letra' ? '#fff' : 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          XCH · CH · M · G · XG · Unitalla
        </button>
        <button
          onClick={() => setFiltro('numero')}
          style={{
            fontSize: 9, padding: '2px 7px', borderRadius: 4, cursor: 'pointer',
            background: filtro === 'numero' ? 'var(--accent-black)' : 'transparent',
            color: filtro === 'numero' ? '#fff' : 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
        >
          34 · 36 · 38 · 40 · 42
        </button>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={tallasFiltradas}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="48%"
            outerRadius={52}
            label={(props) => renderLabel({ ...props, total })}
            labelLine={{ stroke: '#A48F7A', strokeWidth: 0.6 }}
          >
            {tallasFiltradas.map((_, i) => (
              <Cell key={i} fill={TALLA_COLORS[i % TALLA_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={v => [v.toLocaleString(), 'Unidades']} />
          <Legend
            iconType="circle"
            iconSize={6}
            wrapperStyle={{ fontSize: 8, paddingTop: 2 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}