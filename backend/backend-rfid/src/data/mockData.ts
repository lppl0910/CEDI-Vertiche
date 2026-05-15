/*
    Datos de prueba — 20 órdenes de un día completo de operaciones CEDI.
    Todas las órdenes arrancan sin etapa asignada para poder ver el flujo
    completo en tiempo real con el simulador acelerado.

    Author: Adrian Proano Bernal
    Actualizado por: Isaac Calderon Laflor (#185 — simulación día completo)
*/

import type { Prepack } from '../types/rfid.types';

function generarPrepack(orderId: string, num: number): Prepack {
    return {
        id:           `PP-${orderId}-${String(num).padStart(3, '0')}`,
        orderId,
        currentEtapa: '',   // Sin etapa — el simulador las avanza
        historial:    [],
    };
}

function generarOrden(orderId: string, total: number): Prepack[] {
    return Array.from({ length: total }, (_, i) => generarPrepack(orderId, i + 1));
}

/*
    20 órdenes con tamaños variados para simular un día real de CEDI:
    · 5 órdenes grandes  (50–60 prepacks) — entregas de temporada
    · 8 órdenes medianas (30–45 prepacks) — reposición estándar
    · 7 órdenes pequeñas (12–25 prepacks) — urgentes / tiendas chicas
*/
export const ordenesPrueba: Record<string, Prepack[]> = {
    // — Órdenes grandes —
    'ORD-2891': generarOrden('ORD-2891', 58),
    'ORD-2892': generarOrden('ORD-2892', 54),
    'ORD-2893': generarOrden('ORD-2893', 60),
    'ORD-2894': generarOrden('ORD-2894', 50),
    'ORD-2895': generarOrden('ORD-2895', 56),

    // — Órdenes medianas —
    'ORD-2896': generarOrden('ORD-2896', 42),
    'ORD-2897': generarOrden('ORD-2897', 38),
    'ORD-2898': generarOrden('ORD-2898', 45),
    'ORD-2899': generarOrden('ORD-2899', 36),
    'ORD-2900': generarOrden('ORD-2900', 40),
    'ORD-2901': generarOrden('ORD-2901', 33),
    'ORD-2902': generarOrden('ORD-2902', 44),
    'ORD-2903': generarOrden('ORD-2903', 30),

    // — Órdenes pequeñas (urgentes) —
    'ORD-2904': generarOrden('ORD-2904', 22),
    'ORD-2905': generarOrden('ORD-2905', 18),
    'ORD-2906': generarOrden('ORD-2906', 25),
    'ORD-2907': generarOrden('ORD-2907', 15),
    'ORD-2908': generarOrden('ORD-2908', 20),
    'ORD-2909': generarOrden('ORD-2909', 12),
    'ORD-2910': generarOrden('ORD-2910', 24),
};
