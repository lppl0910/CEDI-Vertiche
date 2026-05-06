/*
    Datos de prueba para el sistema RFID, que representan el progreso de una orden a través de las diferentes etapas del proceso de manejo de prepacks.
    Estos datos se utilizan para simular el comportamiento del sistema y probar la funcionalidad de la API y la interfaz de usuario.
    Este codigo sera eliminado una vez que se integre el script de generacion de datos reales.
    
    Author: Adrian Proano Bernal
*/

import type { Prepack } from '../types/rfid.types';

function generarPrepack(orderId: string, count: number): Prepack[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `PP-${orderId}-${String(i + 1).padStart(3, '0')}`,
        orderId,
        currentEtapa: '', // Inicialmente sin etapa asignada
        historial: []
    }));
}

//Generar Ordenes de prueba

/*
    Info de estructura:
        Record<string, Prepack[]> es un tipo de TypeScript que significa "un objeto cuyas llaves son strings y cuyos valores son arreglos de Prepack". 
        Es equivalente a { [key: string]: Prepack[] }.
    INFO: Estos datos se reinician cada vez que se reinicia el servidor. 

    Author: Adrian Proano Bernal
*/

export const ordenesPrueba: Record<string, Prepack[]> = {
    'ORD-001': generarPrepack('ORD-001', 2)
};