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
