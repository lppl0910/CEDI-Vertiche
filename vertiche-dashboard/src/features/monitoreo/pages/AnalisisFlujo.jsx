import FlowTable from '../components/FlowTable';
import PerformanceChart from '../components/PerformanceChart';
import { equipos as mockEquipos, performanceData as mockPerformance } from '../data/mockData';
import { useFlujoPPMin } from '../hooks/useFlujoPPMin';

export default function AnalisisFlujo() {
  const { flowData, performanceData, loading } = useFlujoPPMin(5);

  return (
    <main style={{ flex: 1, padding: 24, background: '#F8F6F3', minHeight: 'calc(100vh - 56px)', overflowX: 'auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, color: '#1F1F1F', marginBottom: 2 }}>
          Análisis de flujo
        </h1>
        <p style={{ fontSize: 13, color: '#6B6B6B' }}>
          Monitoreo en tiempo real por etapa de proceso
        </p>
      </div>

      <div className="card" style={{ padding: 0, marginBottom: 20 }}>
        <FlowTable data={loading ? mockEquipos : flowData} />
      </div>

      <PerformanceChart data={loading || performanceData.length === 0 ? mockPerformance : performanceData} />
    </main>
  );
}
