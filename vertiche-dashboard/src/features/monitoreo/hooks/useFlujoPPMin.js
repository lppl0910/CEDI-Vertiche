/**
 * Devuelve el flujo de pp/min en tiempo real para todas las etapas
 * (Preregistro, QA, Registro, Sorter, Bahías, Auditoría, Envío)
 * y los datos históricos de performance del turno actual.
 *
 * @param {number} [ventana=5] - Minutos de ventana de agregación para el cálculo de pp/min
 * @returns {{ flowData: Array, performanceData: Array, loading: boolean }}
 * @author Miguel Angel Argumedo
 */
import { useState, useEffect } from 'react'

const DEFAULT_ETAPAS = {
  prepack:   { status: 'success', ppMin: 0, ordenesRecibidas: 0, ordenesIncompletas: 0 },
  qa:        { status: 'success', ppMin: 0, porcentaje: 0, devolucionesPedidos: 0 },
  registro:  { status: 'success', ppMin: 0, ppCrossDock: 0, tiempoPromedioRegistro: '0 min' },
  sorter:    { status: 'success', ppMin: 0, fallas: 0, ppBahiaIncorrecta: 0, tiempoInactivo: '0 min' },
  bahias:    { status: 'success', ppMin: 0, bahiasSaturadas: 0, bahias: [], _ocupacion: 0 },
  auditoria: { status: 'success', ppMin: 0, valor: 0, fallasRechazadas: 0 },
  envio:     { status: 'success', ppMin: 0, tiempoPromedioRecorrido: '0 hrs', ordenesConRetraso: 0 },
}

export function useFlujoPPMin(ventana = 5) {
  const [flowData, setFlowData] = useState([{ etapas: DEFAULT_ETAPAS }])
  const [performanceData, setPerformanceData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      const [ppminRes, perfRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_MONITOREO_API_URL}/api/flujo/ppmin?ventana=${ventana}`),
        fetch(`${import.meta.env.VITE_MONITOREO_API_URL}/api/flujo/performance?period=today`),
      ])
      if (!ppminRes.ok || !perfRes.ok) throw new Error('Error en el servidor')
      const [ppminData, perfData] = await Promise.all([
        ppminRes.json(),
        perfRes.json(),
      ])
      setFlowData([{ etapas: ppminData.etapas }])
      setPerformanceData(perfData)
    } catch (err) {
      console.error('useFlujoPPMin:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 30000)
    return () => clearInterval(interval)
  }, [ventana])

  return { flowData, performanceData, loading }
}
