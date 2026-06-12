/**
 * Componente dinámico de gráficas para la feature de monitoreo.
 * Renderiza un gráfico de líneas, barras o pie según el tipo recibido,
 * e incluye KPIBig para métricas destacadas y CustomTooltip para tooltips
 * personalizados de Recharts.
 *
 * @param {Object} props
 * @param {'line'|'bar'|'pie'} props.tipo     - Tipo de gráfica a renderizar
 * @param {Array}              props.grafica   - Datos para el gráfico
 * @param {Object}             [props.dato]    - KPI adicional a mostrar sobre la gráfica
 * @returns {JSX.Element}
 * @author Miguel Angel Argumedo
 */
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { mockChartData, kpiData } from '../../data/mockData';
import '../monitoreo.css';

const COLORS = ['#111111', '#A48F7A', '#D8C3A5'];

const axisStyle = { fontSize: 12, fill: '#6B6B6B', fontFamily: 'Inter' };
const gridStyle = { stroke: '#E7E2DC', strokeDasharray: '3 3' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="mon-tooltip">
      <div className="mon-tooltip__label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="mon-tooltip__row" style={{ color: p.color || '#1F1F1F' }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

function KPIBig({ dato }) {
  const kpiMap = {
    'Prepacks procesados': { label: 'Prepacks', ...kpiData.prepacksMin },
    '% Rechazo QA':        { label: '% Rechazo QA', ...kpiData.rechazoQA },
    '% Fallo Sorter':      { label: '% Fallo Sorter', ...kpiData.falloSorter },
    'Tiempo promedio carga': { label: 'T. promedio carga', ...kpiData.tiempoCarga },
  };
  const info = kpiMap[dato] || { label: dato, valor: '—', delta: 0, unidad: '' };
  const arrow = info.delta > 0 ? '↑' : info.delta < 0 ? '↓' : '→';
  const deltaColor = info.delta === 0 ? '#6B6B6B' : info.delta > 0 ? '#6E8B6B' : '#B65E4A';
  return (
    <div className="mon-kpi-big">
      <div className="mon-kpi-big__label">{info.label}</div>
      <div className="mon-kpi-big__value">
        {info.valor}
        <span className="mon-kpi-big__unit">{info.unidad}</span>
      </div>
      <div className="mon-kpi-big__delta" style={{ color: deltaColor }}>{arrow} {Math.abs(info.delta)} {info.unidad}</div>
    </div>
  );
}

export default function DynamicChart({ tipo, grafica, dato }) {
  const rawData = mockChartData[dato] || [];

  if (tipo === 'kpi') return <KPIBig dato={dato} />;

  const xKey = rawData.length > 0
    ? Object.keys(rawData[0]).find(k => typeof rawData[0][k] === 'string') || 'nombre'
    : 'nombre';

  const numericKeys = rawData.length > 0
    ? Object.keys(rawData[0]).filter(k => k !== xKey && typeof rawData[0][k] === 'number')
    : ['valor'];

  if (grafica === 'line') {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={rawData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid {...gridStyle} />
          <XAxis dataKey={xKey} tick={axisStyle} />
          <YAxis tick={axisStyle} />
          <Tooltip content={<CustomTooltip />} />
          {numericKeys.length > 1 && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontFamily: 'Inter' }} />}
          {numericKeys.map((k, i) => (
            <Line key={k} type="monotone" dataKey={k} stroke={COLORS[i % COLORS.length]}
              strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (grafica === 'bar-v') {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={rawData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid {...gridStyle} />
          <XAxis dataKey={xKey} tick={axisStyle} />
          <YAxis tick={axisStyle} />
          <Tooltip content={<CustomTooltip />} />
          {numericKeys.length > 1 && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />}
          {numericKeys.map((k, i) => (
            <Bar key={k} dataKey={k} fill={COLORS[i % COLORS.length]} radius={[3, 3, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (grafica === 'bar-h') {
    const valueKey = numericKeys[0] || 'valor';
    return (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={rawData} layout="vertical" margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
          <CartesianGrid {...gridStyle} horizontal={false} />
          <XAxis type="number" tick={axisStyle} />
          <YAxis dataKey={xKey} type="category" tick={axisStyle} width={70} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={valueKey} fill={COLORS[0]} radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (grafica === 'donut') {
    const valueKey = numericKeys[0] || 'valor';
    return (
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={rawData.slice(0, 5)}
            dataKey={valueKey}
            nameKey={xKey}
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
          >
            {rawData.slice(0, 5).map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontFamily: 'Inter' }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return <div style={{ color: '#6B6B6B', textAlign: 'center', padding: 40 }}>Tipo de gráfica no soportado</div>;
}
