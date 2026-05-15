/**
 * Capa de persistencia para alertas.
 * — Si MONGODB_URI está configurado: guarda en MongoDB (AlertaModel).
 * — Si no: usa array en memoria como fallback.
 * Guardar logs en la base de datos — Isaac Calderon Laflor (#187)
 */
import type { Alerta } from '../types/alertas.types';
import { isDBConnected } from '../config/database.js';
import { AlertaModel } from '../models/AlertaModel.js';

// Fallback en memoria (se pierde al reiniciar si no hay DB)
export let historialAlertasBD: Alerta[] = [];

export const agregarOActualizarAlerta = async (alerta: Alerta): Promise<void> => {
    if (isDBConnected()) {
        await AlertaModel.findOneAndUpdate(
            { id: alerta.id },
            alerta,
            { upsert: true, new: true }
        );
    } else {
        const index = historialAlertasBD.findIndex(a => a.id === alerta.id);
        if (index !== -1) {
            historialAlertasBD[index] = { ...historialAlertasBD[index], ...alerta };
        } else {
            historialAlertasBD.push(alerta);
        }
    }
};

export const obtenerHistorialAlertas = async (): Promise<Alerta[]> => {
    if (isDBConnected()) {
        return AlertaModel.find().sort({ ts: -1 }).lean() as unknown as Alerta[];
    }
    return historialAlertasBD;
};
