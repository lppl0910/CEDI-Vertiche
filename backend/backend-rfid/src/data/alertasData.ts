import type { Alerta } from '../types/alertas.types';

// Simulamos una tabla en la base de datos para almacenar el historial de alertas
export let historialAlertasBD: Alerta[] = [];

export const agregarOActualizarAlerta = (alerta: Alerta) => {
    const index = historialAlertasBD.findIndex(a => a.id === alerta.id);
    if (index !== -1) {
        // Actualizamos
        historialAlertasBD[index] = { ...historialAlertasBD[index], ...alerta };
    } else {
        // Insertamos
        historialAlertasBD.push(alerta);
    }
};

export const obtenerHistorialAlertas = (): Alerta[] => {
    return historialAlertasBD;
};
