import { API_URLS } from '../../../config/api.js';
import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Devuelve el ranking de clasificación de proveedores estrella.
 * @param {number} semanas - 0 = todos los datos; >0 = últimas N semanas
 *
 * Actualización automática:
 *  - Cada 60 s (polling regular)
 *  - Al inicio de cada turno (Matutino 06:00 h · Vespertino 14:00 h)
 */
export function useProveedoresEstrella(semanas = 0) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const turnoTimeoutRef = useRef(null)

  const fetchData = useCallback(async () => {
    try {
      const params = semanas > 0 ? `?semanas=${semanas}` : ''
      const res = await fetch(
        `${API_URLS.monitoreo}/api/preregistro/proveedores-estrella${params}`
      )
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

    // Polling cada 60 s
    const interval = setInterval(fetchData, 60_000)

    // Refresh al inicio de cada turno (06:00 y 14:00)
    const scheduleTurno = () => {
      const now = new Date()
      const h = now.getHours()
      const next = new Date(now)

      if (h < 6) {
        next.setHours(6, 0, 0, 0)
      } else if (h < 14) {
        next.setHours(14, 0, 0, 0)
      } else {
        next.setDate(next.getDate() + 1)
        next.setHours(6, 0, 0, 0)
      }

      const delay = next.getTime() - now.getTime()
      turnoTimeoutRef.current = setTimeout(() => {
        fetchData()
        scheduleTurno()
      }, delay)
    }

    scheduleTurno()

    return () => {
      clearInterval(interval)
      clearTimeout(turnoTimeoutRef.current)
    }
  }, [fetchData])

  return { data, loading }
}