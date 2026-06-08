import { useState, useEffect } from 'react'

const DEFAULT_KPIS = {
  ocupacion_promedio: 0,
  bahias_saturadas: 0,
  capacidad_total: 0,
  bahia_mas_descargada: 'B09',
  bahia_mas_descargada_procesando: 0,
}

export function useBahiasKPIs() {
  const [kpis, setKpis] = useState(DEFAULT_KPIS)
  const [ocupacion, setOcupacion] = useState([])
  const [tendencia, setTendencia] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      const [kpisRes, ocupRes, tendRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_MONITOREO_API_URL}/api/bahias/kpis`),
        fetch(`${import.meta.env.VITE_MONITOREO_API_URL}/api/bahias/ocupacion`),
        fetch(`${import.meta.env.VITE_MONITOREO_API_URL}/api/bahias/tendencia`),
      ])
      const [kpisData, ocupData, tendData] = await Promise.all([
        kpisRes.json(),
        ocupRes.json(),
        tendRes.json(),
      ])
      setKpis(kpisData)
      setOcupacion(ocupData)
      setTendencia(tendData)
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

  return { kpis, ocupacion, tendencia, loading }
}
