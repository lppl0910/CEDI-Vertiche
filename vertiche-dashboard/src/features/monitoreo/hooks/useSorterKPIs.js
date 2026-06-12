/**
 * Devuelve los KPIs de Sorter y la distribución de paquetes por bahía.
 * Incluye total clasificado, paquetes en bahía incorrecta y tiempo promedio.
 * Refresca automáticamente cada 30 s.
 *
 * @returns {{ kpis: Object, paquetesPorBahia: Array, loading: boolean }}
 * @author Miguel Angel Argumedo
 */
import { useState, useEffect } from 'react'

const DEFAULT_KPIS = {
  total_clasificados: 0,
  prepacks_en_sorter: 0,
  bahia_mas_cargada: 'B01',
  bahia_mas_cargada_paquetes: 0,
  tiempo_promedio_seg: 0,
}

export function useSorterKPIs() {
  const [kpis, setKpis] = useState(DEFAULT_KPIS)
  const [paquetesPorBahia, setPaquetesPorBahia] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      const [kpisRes, bahiaRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_MONITOREO_API_URL}/api/sorter/kpis`),
        fetch(`${import.meta.env.VITE_MONITOREO_API_URL}/api/sorter/por-bahia`),
      ])
      const [kpisData, bahiaData] = await Promise.all([
        kpisRes.json(),
        bahiaRes.json(),
      ])
      setKpis(kpisData)
      setPaquetesPorBahia(bahiaData)
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

  return { kpis, paquetesPorBahia, loading }
}
