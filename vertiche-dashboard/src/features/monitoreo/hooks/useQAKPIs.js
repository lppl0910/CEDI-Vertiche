/**
 * Devuelve los KPIs de QA, el detalle de errores por proveedor
 * y los prepacks actualmente en proceso de revisión.
 * Refresca automáticamente cada 30 s.
 *
 * @returns {{ kpis: Object, erroresPorProveedor: Array, prepacksActivos: Array, loading: boolean }}
 * @author Miguel Angel Argumedo
 */
import { useState, useEffect } from 'react'

const DEFAULT_KPIS = {
  total_prepacks: 0,
  prepacks_en_qa: 0,
  prepacks_procesados: 0,
  tasa_aceptacion: 0,
  total_retornados: 0,
  proveedores_con_rechazo: 0,
}

export function useQAKPIs() {
  const [kpis, setKpis] = useState(DEFAULT_KPIS)
  const [erroresPorProveedor, setErroresPorProveedor] = useState([])
  const [prepacksActivos, setPrepacksActivos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    try {
      const [kpisRes, erroresRes, prepacksRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_MONITOREO_API_URL}/api/qa/kpis`),
        fetch(`${import.meta.env.VITE_MONITOREO_API_URL}/api/qa/errores-por-proveedor`),
        fetch(`${import.meta.env.VITE_MONITOREO_API_URL}/api/qa/prepacks-activos`),
      ])
      const [kpisData, erroresData, prepacksData] = await Promise.all([
        kpisRes.json(),
        erroresRes.json(),
        prepacksRes.json(),
      ])
      setKpis(kpisData)
      setErroresPorProveedor(erroresData)
      setPrepacksActivos(prepacksData)
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

  return { kpis, erroresPorProveedor, prepacksActivos, loading }
}
