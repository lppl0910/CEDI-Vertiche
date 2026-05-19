import { agregarOActualizarAlerta } from '../data/alertasData';
import type { Etapa } from '../types/rfid.types';

/*
    Servicio de alertas — encapsula la lógica de negocio para generar y registrar alertas.
    Author: Adrian Proano Bernal
*/

/**
 * Trigger: tag RFID escaneado no existe en la BD.
 * Se invoca desde el endpoint /api/rfid/scan cuando procesoEscaneoRFID devuelve null.
 */
export function registrarTagDesconocido(tagId: string, readerId: string, etapa: Etapa): void {
    agregarOActualizarAlerta({
        id:         `TAG-DESCONOCIDO-${tagId}-${Date.now()}`,
        ppId:       tagId,
        orderId:    'N/A',
        stage:      etapa ?? 'Desconocida',
        desc:       `Tag RFID no registrado en el sistema — lector: ${readerId ?? 'desconocido'}`,
        status:     'open',
        causa:      '',
        ts:         Date.now(),
        resolvedAt: null,
    });
}
