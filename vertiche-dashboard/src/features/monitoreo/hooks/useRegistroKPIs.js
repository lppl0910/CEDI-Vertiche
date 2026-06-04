import { useState, useEffect } from 'react'

const DEFAULT_KPIS = {
  prepacks_en_registro: 0,
  prepacks_procesados: 0,
  total_prepacks: 0,
  backlog_count: 0,
}

export function useRegistroKPIs() {
  const [kpis, setKpis] = useState(DEFAULT_KPIS)
  const [equipos, setEquipos] = useState([])
  const [backlog, setBacklog] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      const [kpisRes, equiposRes, backlogRes] = await Promise.all([
        fetch('http://localhost:3001/api/registro/kpis'),
        fetch('http://localhost:3001/api/registro/por-equipo'),
        fetch('http://localhost:3001/api/registro/backlog'),
      ])
      const [kpisData, equiposData, backlogData] = await Promise.all([
        kpisRes.json(),
        equiposRes.json(),
        backlogRes.json(),
      ])
      setKpis(kpisData)
      setEquipos(equiposData)
      setBacklog(backlogData)
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

  return { kpis, equipos, backlog, loading }
}
