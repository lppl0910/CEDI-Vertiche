import { generateMockPackage } from "./mockGenerator";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";

function mapPackage(backendData, bayId) {
  if (!backendData) return null;
  const content = backendData.detallesContenido || {};

  return {
    pkgId: backendData.id,
    status: backendData.estado,
    isError: backendData.isError || false,
    store: parseInt(backendData.detallesRuta?.tiendaDestino || backendData.informacionOperario?.tiendaAAsignar || 0),
    bayId: parseInt(bayId || backendData.detallesRuta?.bayId || backendData.detallesRuta?.bahiaDestino || 0),
    intendedBay: parseInt(backendData.detallesRuta?.bahiaDestino || 0),
    intendedStore: parseInt(backendData.detallesRuta?.tiendaDestino || 0),
    garment: {
      name: content.articulo || "Caja Ropa",
      baseId: "CJ",
      icon: content.articulo?.toLowerCase().includes("pantal") ? "👖" : "👕"
    },
    rows: [
      {
        id: backendData.id + "-1",
        name: content.articulo || "Artículos",
        color: { name: content.color || "Mixto", hex: "#aaa" },
        size: "M",
        qty: content.cantidad || 10
      }
    ],
    ts: new Date(backendData.timestamp).getTime()
  };
}

export const apiService = {
  subscribeToEvents(channel, onMessage) {
    if (USE_MOCK) return () => {};

    const url = `${API_BASE_URL}/events/${channel}`;
    const source = new EventSource(url);

    const handleEvent = (e) => {
      try {
        const data = JSON.parse(e.data);
        // Extrae el ID de bahía del nombre del canal: "bahia-2" → 2
        const parts = channel.split("-");
        const detectedBay = parts.length > 1 ? parseInt(parts[1]) : null;
        const mapped = mapPackage(data, detectedBay);
        if (mapped) onMessage(mapped);
      } catch (err) {
        console.error("Error procesando evento SSE:", err);
      }
    };

    source.addEventListener("nuevo-prepack", handleEvent);
    source.addEventListener("paquete-llegando", handleEvent);
    source.onerror = (err) => {
      console.error(`Error SSE en canal ${channel}:`, err);
      source.close();
    };

    return () => source.close();
  },

  async getNextPackage(bayId) {
    if (USE_MOCK) {
      return new Promise(resolve => {
        setTimeout(() => resolve(generateMockPackage(bayId)), 100);
      });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/current/${bayId}`);
      if (!response.ok) throw new Error("Error en la red");
      const text = await response.text();
      if (!text || text === "null") return null;
      return mapPackage(JSON.parse(text), bayId);
    } catch (error) {
      console.error("Error fetching next package:", error);
      return null;
    }
  },

  async updatePackageStatus(pkgId, location) {
    if (USE_MOCK) {
      console.log(`[MOCK] Paquete ${pkgId} actualizado a ubicación: ${location}`);
      return { success: true, pkgId, location };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/bajada-bahia`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode: pkgId, bahiaActual: location.replace("bay", "") })
      });
      if (!response.ok) throw new Error("Error al actualizar estado");
      return await response.json();
    } catch (error) {
      console.error(`Error actualizando paquete ${pkgId}:`, error);
      return null;
    }
  }
};
