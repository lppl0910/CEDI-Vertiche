import { useState, useEffect } from 'react'

const DEFAULT_KPIS = {
  prepacks_en_auditoria: 0,
  cajas_auditadas_hoy: 0,
  cajas_con_error: 0,
  tasa_exito: 100,
  tiempo_promedio: 0,
}

export function useAuditoriaKPIs() {
  const [kpis, setKpis] = useState(DEFAULT_KPIS)
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_MONITOREO_API_URL}/api/auditoria/kpis`)
      if (!res.ok) throw new Error('Error en el servidor')
      const data = await res.json()
      setKpis(data)
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

  return { kpis, loading }
}
