import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const BASE_URL = 'http://localhost:3000';

export function useOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${BASE_URL}/api/ordenes`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!cancelled) {
          setOrdenes(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    const socket = io(BASE_URL);

    socket.on('orden:progreso:actualizado', ({ orderId, progreso }) => {
      setOrdenes(prev =>
        prev.map(o => o.orderId === orderId ? progreso : o)
      );
    });

    return () => {
      cancelled = true;
      socket.disconnect();
    };
  }, []);

  return { ordenes, loading, error };
}
