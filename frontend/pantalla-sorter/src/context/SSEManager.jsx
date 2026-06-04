import { useEffect, useRef } from "react";
import { BAYS } from "../utils/constants";
import { apiService } from "../services/api";
import { useSorterContext } from "./SorterProvider";
import { useBaysContext } from "./BaysProvider";

export function SSEManager() {
  const { processEntry } = useSorterContext();
  const { processBay } = useBaysContext();

  // Las refs mantienen las últimas callbacks sin re-activar el efecto en cada render
  const processEntryRef = useRef(processEntry);
  const processBayRef = useRef(processBay);

  useEffect(() => {
    processEntryRef.current = processEntry;
    processBayRef.current = processBay;
  }, [processEntry, processBay]);

  useEffect(() => {
    const processPackage = (pkg) => {
      if (!pkg) return;
      console.log("[SSE Event] Recibido:", pkg.status, pkg.pkgId, "en Bahía:", pkg.bayId, "Error:", pkg.isError);

      if (pkg.status === "ENTRADA_SORTER") {
        processEntryRef.current(pkg);
      } else if (pkg.status === "LLEGADA_BAHIA") {
        processBayRef.current(pkg);
      }
    };

    if (import.meta.env.VITE_USE_MOCK_API === "true") {
      const tick = async () => {
        const bayId = BAYS[Math.floor(Math.random() * BAYS.length)].id;
        const pkg = await apiService.getNextPackage(bayId);
        processPackage(pkg);
      };
      tick();
      const itv = setInterval(tick, 2000);
      return () => clearInterval(itv);
    }

    console.log("Iniciando suscripciones SSE...");
    const channels = ["entrada", "bahia-1", "bahia-2", "bahia-3"];
    const unsubs = channels.map(channel =>
      apiService.subscribeToEvents(channel, processPackage)
    );

    return () => {
      console.log("Limpiando suscripciones SSE...");
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  return null;
}
