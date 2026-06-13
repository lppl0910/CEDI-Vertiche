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
import { useState } from 'react'

export default function AnalisisFlujo() {
  const [ventana, setVentana] = useState(5)
  const { flowData, performanceData, loading } = useFlujoPPMin(ventana);

  return (
    <main className="mon-page mon-page--overflow" style={{ flex: 1 }}>
      <div className="mon-page-header">
        <h1 className="mon-page-title">Análisis de flujo</h1>
        <p className="mon-page-subtitle">Monitoreo en tiempo real por etapa de proceso</p>
      </div>

      <div className="card mon-flow-card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <select value={ventana} onChange={(e) => setVentana(Number(e.target.value))}>
            <option value={1}>Último minuto</option>
            <option value={5}>Últimos 5 min</option>
            <option value={15}>Últimos 15 min</option>
            <option value={30}>Últimos 30 min</option>
            <option value={60}>Última hora</option>
            <option value={1440}>Último día</option>
            <option value={10080}>Última semana</option>
            <option value={43200}>Último mes</option>
          </select>
        </div>
        <FlowTable data={loading ? mockEquipos : flowData} />
      </div>

      <PerformanceChart data={loading || performanceData.length === 0 ? mockPerformance : performanceData} />
    </main>
  );
}
