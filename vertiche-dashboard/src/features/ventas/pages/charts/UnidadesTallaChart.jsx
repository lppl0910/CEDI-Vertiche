import { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card } from '../Card';
import { ChartTitle } from '../ChartTitle';

const TALLA_COLORS = ['#93703E', '#86705B', '#AD6252', '#627C5F', '#6A7495', '#946D29', '#B65E4A'];

const TALLAS_LETRA  = ['XCH', 'CH', 'M', 'G', 'XG', 'Unitalla'];
const TALLAS_NUMERO = ['34', '36', '38', '40', '42'];

/**
 * Renderiza etiquetas fuera del pie con nombre y porcentaje.
 * La posición se calcula trigonométricamente a partir del ángulo medio (midAngle)
 * del segmento para que las etiquetas orbiten alrededor del pie sin superponerse.
 *
 * @param {Object} props - Props inyectadas automáticamente por Recharts Pie
 * @param {string} props.name
 * @param {number} props.value
 * @param {number} props.total       - Total de unidades del filtro activo (calculado en el padre)
 * @param {number} props.cx          - Centro X del pie en px
 * @param {number} props.cy          - Centro Y del pie en px
 * @param {number} props.midAngle    - Ángulo medio del segmento en grados
 * @param {number} props.outerRadius - Radio exterior del pie en px
 */
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

/**
 * Gráfica de pie para distribución de unidades vendidas por talla.
 * Permite alternar entre dos sistemas de tallas mediante un toggle en UI:
 *   letra:  XCH / CH / M / G / XG / Unitalla (tallas estándar MX)
 *   número: 34 / 36 / 38 / 40 / 42 (tallas numéricas, típicas en pantalón)
 *
 * El backend devuelve todos los tipos mezclados en un solo array.
 * El filtrado se hace en cliente — no genera un fetch adicional por toggle.
 *
 * @param {Object} props
 * @param {Array<{ name: string, value: number }>} props.tallas
 *   Array con todos los registros de talla (letra + número mezclados).
 */
export function UnidadesTallaChart({ tallas }) {
  const [filtro, setFiltro] = useState('letra');

  // Filtra en cliente según el sistema de tallas seleccionado por el usuario.
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
      <ResponsiveContainer width="100%" height={180} role="img" aria-label="Gráfica de pie: distribución de unidades vendidas por talla">
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