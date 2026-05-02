import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { mockChartData, kpiData } from '../../data/mockData';

const COLORS = ['#111111', '#A48F7A', '#D8C3A5'];

const axisStyle = { fontSize: 12, fill: '#6B6B6B', fontFamily: 'Inter' };
const gridStyle = { stroke: '#E7E2DC', strokeDasharray: '3 3' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E7E2DC', borderRadius: 8,
      padding: '8px 12px', fontSize: 12, fontFamily: 'Inter',
    }}>
      <div style={{ color: '#6B6B6B', marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#1F1F1F', fontWeight: 500 }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 200, gap: 8 }}>
      <div style={{ fontSize: 12, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{info.label}</div>
      <div style={{ fontSize: 48, fontWeight: 600, color: '#1F1F1F' }}>
        {info.valor}
        <span style={{ fontSize: 18, fontWeight: 400, color: '#6B6B6B', marginLeft: 6 }}>{info.unidad}</span>
      </div>
      <div style={{ fontSize: 14, color: deltaColor }}>{arrow} {Math.abs(info.delta)} {info.unidad}</div>
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
