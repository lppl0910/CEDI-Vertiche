// hooks/useVentasFetch.js
import { useState, useEffect, useCallback, useRef } from 'react';

export function useVentasFetch(fetchFn, deps = []) {
  const [data, setData]     = useState(null);
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'empty' | 'error'
  const [error, setError]   = useState(null);

  const fetchRef = useRef(fetchFn);
  useEffect(() => {
    fetchRef.current = fetchFn;
  });

  const run = useCallback(() => {
    setStatus('loading');
    setError(null);
    fetchRef.current()
      .then(result => {
        const isEmpty =
          result === null ||
          result === undefined ||
          (Array.isArray(result) && result.length === 0) ||
          (result?.data && Array.isArray(result.data) && result.data.length === 0);
        setData(result);
        setStatus(isEmpty ? 'empty' : 'success');
      })
      .catch(err => {
        setError(err.message ? `${err.message} ${err.status ?? ''}` : 'Error desconocido');
        setStatus('error');
      });
  }, []);

  // Este effect solo corre cuando cambian las deps del fetch (period, zona, etc.)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { run(); }, deps);

  return { data, status, error, retry: run };
}