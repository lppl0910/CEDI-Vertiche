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
        fetch('http://localhost:3001/api/sorter/kpis'),
        fetch('http://localhost:3001/api/sorter/por-bahia'),
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
