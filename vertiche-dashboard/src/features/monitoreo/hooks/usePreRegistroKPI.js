import { useState, useEffect } from 'react';

export function usePreregistroKPIs() {
  const [kpis, setKpis] = useState({
    ordenes_recibidas: 0,
    ordenes_incompletas: 0,
    tasa_completas: 0,
    proveedores_con_incidencias: 0,
    semana_en_curso: '-',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKPIs = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/preregistro/kpis');
      if (!res.ok) throw new Error('Error en el servidor');
      const data = await res.json();
      setKpis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
    // Refresco automático cada 30 segundos
    const interval = setInterval(fetchKPIs, 30000);
    return () => clearInterval(interval);
  }, []);

  return { kpis, loading, error };
}