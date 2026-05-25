/**
 * Agrega el estado de múltiples resultados de useVentasFetch en un estado único de sección.
 *
 * Prioridad (de mayor a menor):
 *   'loading' — si CUALQUIER fetch sigue cargando
 *   'error'   — si TODOS los fetches fallaron
 *   'empty'   — si TODOS los fetches están vacíos
 *   'partial' — en cualquier otro caso (mezcla de success/error/empty)
 *
 * 'partial' es el caso más común en producción: es raro que todos los endpoints
 * fallen o estén vacíos simultáneamente. En 'partial', las secciones muestran
 * los charts que sí cargaron y ChartStatus individuales para los que no.
 *
 * @param {...{ status: 'loading' | 'success' | 'empty' | 'error' }} fetchResults
 *   Objetos retornados por useVentasFetch. Se pasan como argumentos individuales.
 * @returns {{ sectionStatus: 'loading' | 'error' | 'empty' | 'partial', allDone: boolean }}
 */
export function useSectionStatus(...fetchResults) {
  const statuses = fetchResults.map((r) => r.status);

  const allError = statuses.every((s) => s === "error");
  const allEmpty = statuses.every((s) => s === "empty");
  const allDone = statuses.every((s) => s !== "loading");

  // El tipo global de la sección
  const sectionStatus = !allDone
    ? "loading"
    : allError
      ? "error"
      : allEmpty
        ? "empty"
        : "partial"; // hay mezcla de success/error/empty

  return { sectionStatus, allDone };
}
