/**
 * Página de Análisis de Flujo del módulo de monitoreo.
 * Muestra la tabla de throughput por minuto (FlowTable) y la gráfica
 * de rendimiento por etapa (PerformanceChart), consumiendo datos en
 * tiempo real a través de useFlujoPPMin.
 *
 * @returns {JSX.Element}
 * @author Miguel Angel Argumedo
 */
import '../monitoreo.css';
import FlowTable from '../components/FlowTable';
import PerformanceChart from '../components/PerformanceChart';
import { equipos as mockEquipos, performanceData as mockPerformance } from '../data/mockData';
import { useFlujoPPMin } from '../hooks/useFlujoPPMin';

export default function AnalisisFlujo() {
  const { flowData, performanceData, loading } = useFlujoPPMin(5);

  return (
    <main className="mon-page mon-page--overflow" style={{ flex: 1 }}>
      <div className="mon-page-header">
        <h1 className="mon-page-title">Análisis de flujo</h1>
        <p className="mon-page-subtitle">Monitoreo en tiempo real por etapa de proceso</p>
      </div>

      <div className="card mon-flow-card">
        <FlowTable data={loading ? mockEquipos : flowData} />
      </div>

      <PerformanceChart data={loading || performanceData.length === 0 ? mockPerformance : performanceData} />
    </main>
  );
}
