import { useState, useEffect } from 'react'

export function useBacklogEnvio() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/envio/backlog')
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
    // Refresh from server every 60s to pick up new/resolved orders
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  return { data, loading }
}
