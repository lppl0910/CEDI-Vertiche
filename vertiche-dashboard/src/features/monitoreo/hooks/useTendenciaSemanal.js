/**
 * Devuelve la tendencia semanal de órdenes completas vs incompletas
 * en Preregistro para el gráfico de líneas del turno.
 *
 * @param {number} [semanas=8] - Número de semanas a consultar hacia atrás
 * @returns {{ data: Array, loading: boolean }}
 * @author Miguel Angel Argumedo
 */
import { API_URLS } from '../../../config/api.js';
import { useState, useEffect, useCallback } from 'react'

export function useTendenciaSemanal(semanas = 8) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_URLS.monitoreo}/api/preregistro/tendencia-semanal?semanas=${semanas}`)
      if (!res.ok) throw new Error('Error en el servidor')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [semanas])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  return { data, loading }
}
