import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

import { API_URLS } from '../../../config/api.js';

const BASE_URL = API_URLS.rfid;

/**
 * Construye el query string a partir de un objeto de filtros.
 * #217 — Isaac Calderon Laflor
 */
function buildQuery(filters = {}) {
  const params = new URLSearchParams();
  if (filters.sort)   params.set('sort',   filters.sort);
  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', filters.status);
  if (filters.etapa)  params.set('etapa',  filters.etapa);
  const q = params.toString();
  return q ? `?${q}` : '';
}

/**
 * Hook que obtiene las órdenes del backend y las mantiene actualizadas
 * en tiempo real vía Socket.io.
 *
 * @param {object} filters  Filtros opcionales: sort, search, status, etapa.
 *                          Se envían como query params al backend (#217).
 */
export function useOrdenes(filters = {}) {
  const [ordenes,   setOrdenes]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [connected, setConnected] = useState(false); // socket live

  // Ref para que el socket siempre lea los filtros actuales
  // sin necesitar reconectarse cuando cambian.
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const sortKey   = filters.sort   ?? '';
  const searchKey = filters.search ?? '';
  const statusKey = filters.status ?? '';
  const etapaKey  = filters.etapa  ?? '';

  // ── Fetch inicial y re-fetch cuando cambian filtros ───────────────────
  // Modificacion: Ahora sera una funcion y se utilizara en un useEffect, esto para lograr obtener ordenes sin necesidad de recargar la pagina, ademas de que se actualizara cada vez que se cambien los filtros.
  const fetchOrdenes = () => {
    const f = {...filtersRef.current};
    setLoading(true);
    setError(null);

    return fetch(`${BASE_URL}/api/ordenes${buildQuery(f)}`, {
      headers: { 'x-api-key': import.meta.env.VITE_API_KEY },
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setOrdenes(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };
  useEffect(() => {
    let cancelled = false;
    fetchOrdenes({
      sort: filters.sort ?? '',
      search: filters.search ?? '',
      status: filters.status ?? '',
      etapa: filters.etapa ?? '',
    }).catch(err => {}); // El error ya se maneja internamente en fetchOrdenes
    
    return () => { cancelled = true; };
    }, [filters.sort, filters.search, filters.status, filters.etapa])

  // ── Socket.io — actualizaciones en tiempo real ────────────────────────
  // El socket se crea una sola vez. Cuando llega un evento RFID, se
  // actualiza la orden afectada directamente desde el payload del evento
  // (sin hacer un re-fetch extra, que podría llegar tarde o fallar).
  useEffect(() => {
    const socket = io(BASE_URL, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      console.log('[WS] Conectado al servidor RFID en tiempo real');
      setConnected(true);
      fetchOrdenes();
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[WS] Error de conexión Socket.io:', err.message);
      setConnected(false);
    });

    socket.on('orden:progreso:actualizado', ({ orderId, progreso }) => {
      // Reemplazar la orden actualizada en el estado local.
      // Si la orden está en la lista actual (pudo haber sido filtrada fuera),
      // la actualizamos; si no, hacemos un re-fetch completo con filtros actuales.
      setOrdenes(prev => {
        const idx = prev.findIndex(o => o.orderId === orderId);
        if (idx === -1) {
          // La orden no está visible con el filtro actual — no tocar nada.
          fetchOrdenes(); // Pero sí re-fetch para actualizar la lista (pudo haber entrado o salido por filtros)
          return prev;
        }
        const next = [...prev];
        next[idx] = progreso;
        return next;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []); // Solo una vez — filtersRef.current se usa por referencia

  return { ordenes, loading, error, connected };
}
