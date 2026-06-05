import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { BAYS } from "../utils/constants";
import { apiService } from "../services/api";
import { useSorterContext } from "./SorterProvider";
import { useBaysContext } from "./BaysProvider";

export function SSEManager() {
  const { processEntry } = useSorterContext();
  const { processBay } = useBaysContext();

  const processEntryRef = useRef(processEntry);
  const processBayRef = useRef(processBay);

  useEffect(() => {
    processEntryRef.current = processEntry;
    processBayRef.current = processBay;
  }, [processEntry, processBay]);

  useEffect(() => {
    const processPackage = (pkg) => {
      if (!pkg) return;
      console.log("[WebSocket Event] Recibido:", pkg.status, pkg.pkgId, "en Bahía:", pkg.bayId, "Error:", pkg.isError);

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

    console.log("Iniciando conexión WebSocket...");
    let socketUrl = import.meta.env.VITE_API_BASE_URL;
    if (socketUrl && socketUrl.endsWith("/api")) {
      socketUrl = socketUrl.replace("/api", "");
    }
    
    // Si no está definido VITE_API_BASE_URL, asume que está en localhost:3000
    if (!socketUrl) {
       socketUrl = "http://localhost:3000";
    }

    const socket = io(socketUrl, { transports: ["websocket"] });

    socket.on("connect", () => console.log("Conectado a WebSocket Sorter"));
    
    socket.on("sorter:evento", (data) => {
        const mapped = apiService.mapPackage(data, data.detallesRuta?.bahiaDestino);
        if (mapped) processPackage(mapped);
    });

    socket.on("disconnect", () => console.log("Desconectado de WebSocket Sorter"));

    return () => {
      console.log("Cerrando conexión WebSocket...");
      socket.disconnect();
    };
  }, []);

  return null;
}
