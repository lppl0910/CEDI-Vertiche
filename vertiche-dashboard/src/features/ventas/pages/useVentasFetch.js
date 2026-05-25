// hooks/useVentasFetch.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook genérico de fetch con ciclo de vida de estado estandarizado.
 *
 * Ciclo: 'loading' → 'success' | 'empty' | 'error'. Cada cambio en `deps` reinicia desde 'loading'.
 *
 * Criterio de "vacío": resultado null/undefined, array vacío, u objeto con `{ data: [] }`.
 * Este caso ocurre cuando el backend responde 200 pero no hay datos para los filtros dados.
 *
 * El patrón fetchRef (useRef + useEffect sin deps) actualiza la referencia a `fetchFn`
 * en cada render sin recrear el callback `run`. Esto permite que el caller pase lambdas
 * inline que cierren sobre filtros cambiantes sin necesidad de useMemo/useCallback,
 * y sin causar el bucle: recrear run → disparar effect → run infinito.
 *
 * @param {() => Promise<any>} fetchFn
 *   Lambda sin parámetros que devuelve la Promise del fetch.
 *   Puede cerrar sobre filtros cambiantes — se captura via ref en cada render.
 * @param {any[]} [deps=[]]
 *   Dependencias que disparan un nuevo fetch. Seguir las mismas reglas que useEffect.
 *   Debe incluir todos los valores capturados por fetchFn (period, zona, temporada).
 * @returns {{
 *   data:   any,
 *   status: 'loading' | 'success' | 'empty' | 'error',
 *   error:  string | null,
 *   retry:  () => void
 * }}
 */
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

  // Este effect viola exhaustive-deps intencionalmente: solo debe reaccionar
  // a los filtros (deps), no a `run`. Agregar `run` causaría un bucle infinito.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { run(); }, deps);

  return { data, status, error, retry: run };
}