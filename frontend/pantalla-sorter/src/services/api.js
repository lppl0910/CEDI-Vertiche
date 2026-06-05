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
