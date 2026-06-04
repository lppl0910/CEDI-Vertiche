import { useState, useEffect, useCallback } from 'react';
import { API_URLS } from '../../../config/api.js';

const API_URL = `${API_URLS.rfid}/api/alertas`;

export function useAlertas() {
  const [alertasBD, setAlertasBD] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlertas = useCallback(async () => {
    try {
      const response = await fetch(API_URL, {
        headers: { 'x-api-key': import.meta.env.VITE_API_KEY },
      });
      if (!response.ok) throw new Error('Error al obtener historial de alertas');
      const data = await response.json();
      setAlertasBD(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlertas();
  }, [fetchAlertas]);

  const sendAlertas = useCallback(async (nuevasAlertas) => {
    if (!nuevasAlertas || nuevasAlertas.length === 0) return;
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_API_KEY },
        body: JSON.stringify(nuevasAlertas),
      });
      // Recargar las alertas después de enviarlas
      fetchAlertas();
    } catch (err) {
      console.error('Error enviando alertas a la BD:', err);
    }
  }, [fetchAlertas]);

  return { alertasBD, loading, error, sendAlertas, fetchAlertas };
}
