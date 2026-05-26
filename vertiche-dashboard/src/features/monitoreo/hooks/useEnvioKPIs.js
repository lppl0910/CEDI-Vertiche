import { useState, useEffect } from 'react'

const DEFAULT_KPIS = {
  ordenes_enviadas: 0,
  ordenes_backlog: 0,
  alertas_criticas: 0,
  prepacks_transito: 0,
  tiempo_promedio: 0,
}

export function useEnvioKPIs() {
  const [kpis, setKpis] = useState(DEFAULT_KPIS)
  const [porTurno, setPorTurno] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      const [kpisRes, turnoRes] = await Promise.all([
        fetch('http://localhost:3002/api/envio/kpis'),
        fetch('http://localhost:3002/api/envio/por-turno'),
      ])
      const [kpisData, turnoData] = await Promise.all([
        kpisRes.json(),
        turnoRes.json(),
      ])
      setKpis(kpisData)
      setPorTurno(turnoData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 30000)
    return () => clearInterval(interval)
  }, [])

  return { kpis, porTurno, loading }
}
