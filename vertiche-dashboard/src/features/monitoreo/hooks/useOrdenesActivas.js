import { useState, useEffect } from 'react'

export function useOrdenesActivas() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/envio/ordenes-activas')
      if (!res.ok) throw new Error('Error en el servidor')
      setData(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  return { data, loading }
}
