import { generateMockPackage } from "./mockGenerator";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === "true";

function resolveStoreNumber(storeStr, bayId) {
  if (!storeStr) return 0;
  
  let baseNumber = 0;

  // Si ya es numérico, lo convertimos directo
  if (!isNaN(storeStr)) {
    baseNumber = parseInt(storeStr, 10);
  } else {
    // Extraer los números finales de la cadena (ej: "SUC-Demo-001" -> 1)
    const match = String(storeStr).match(/\d+$/);
    baseNumber = match ? parseInt(match[0], 10) : 0;
  }

  // Si tenemos una bahía válida y el número base es de 1 a 12 (ej. un slot),
  // le sumamos el "offset" correspondiente a la bahía.
  // Bahía 1: (1-1)*12 + X = X (1 a 12)
  // Bahía 2: (2-1)*12 + X = 12 + X (13 a 24)
  // Bahía 3: (3-1)*12 + X = 24 + X (25 a 36)
  if (baseNumber > 0 && baseNumber <= 12 && bayId > 0) {
    return ((bayId - 1) * 12) + baseNumber;
  }

  return baseNumber;
}

function mapPackage(backendData, bayId) {
  if (!backendData) return null;
  const content = backendData.detallesContenido || {};

  const rawStore = backendData.detallesRuta?.tiendaDestino || backendData.informacionOperario?.tiendaAAsignar;
  const targetBayId = parseInt(bayId || backendData.detallesRuta?.bayId || backendData.detallesRuta?.bahiaDestino || 0);

  return {
    pkgId: backendData.id,
    status: backendData.estado,
    isError: backendData.isError || false,
    store: resolveStoreNumber(rawStore, targetBayId),
    bayId: targetBayId,
    intendedBay: parseInt(backendData.detallesRuta?.bahiaDestino || 0),
    intendedStore: resolveStoreNumber(backendData.detallesRuta?.tiendaDestino, targetBayId),
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
  mapPackage: function(backendData, bayId) {
    return mapPackage(backendData, bayId);
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
