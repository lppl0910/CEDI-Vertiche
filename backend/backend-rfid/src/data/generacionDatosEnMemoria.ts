/*
    Datos de prueba — 20 órdenes de un día completo de operaciones CEDI.
    Todas las órdenes arrancan sin etapa asignada para poder ver el flujo
    completo en tiempo real con el simulador acelerado.

    Author: Adrian Proano Bernal
    Actualizado por: Isaac Calderon Laflor (#185 — simulación día completo)
*/

import { RfidEventModel, OrdenModel } from '../models/PrepackModel';
import type { Prepack, Etapa } from '../types/rfid.types';
import mongoose from 'mongoose';

/*
    Creacion de nuevo tipo para cargar las ordenes directamente desde la base de datos.
*/

interface PrepackMemoria extends Prepack {
    modelo?: string;
    cantidad_total?: number;
    bahia_asignada?: number;
    distribucion_color?: Array<{ color: string; num_color: number }>;
    distribucion_talla?: { CH: number; M: number; G: number; XG: number };
    categoria?: string;
}

//Funcion para normailizar las etapas leidas de la base de datos
export function normalizarEtapa(raw: string): Etapa {
    const map: Record<string, Etapa> = {
        preregistro: 'Preregistro',
        qa: 'QA',
        registro: 'Registro',
        sorter: 'Sorter',
        bahias: 'Bahias',
        auditoria: 'Auditoria',
        envio: 'Envio',
  };
  return map[raw.toLowerCase()] ?? '';
}

function generarPrepackPrueba(orderId: string, num: number): PrepackMemoria {
    return {
        id:           `PP-${orderId}-${String(num).padStart(3, '0')}`,
        orderId,
        currentEtapa: '',   // Sin etapa — el simulador las avanza
        historial:    [],
    };
}

function generarOrdenPrueba(orderId: string, total: number): Prepack[] {
    return Array.from({ length: total }, (_, i) => generarPrepackPrueba(orderId, i + 1));
}

/*
    20 órdenes con tamaños variados para simular un día real de CEDI:
    · 5 órdenes grandes  (50–60 prepacks) — entregas de temporada
    · 8 órdenes medianas (30–45 prepacks) — reposición estándar
    · 7 órdenes pequeñas (12–25 prepacks) — urgentes / tiendas chicas
*/
export const ordenesPrueba: Record<string, PrepackMemoria[]> = {
    // — Órdenes grandes —
    'ORD-2891': generarOrdenPrueba('ORD-2891', 58),
    'ORD-2892': generarOrdenPrueba('ORD-2892', 54),
    'ORD-2893': generarOrdenPrueba('ORD-2893', 60),
    'ORD-2894': generarOrdenPrueba('ORD-2894', 50),
    'ORD-2895': generarOrdenPrueba('ORD-2895', 56),

    // — Órdenes medianas —
    'ORD-2896': generarOrdenPrueba('ORD-2896', 42),
    'ORD-2897': generarOrdenPrueba('ORD-2897', 38),
    'ORD-2898': generarOrdenPrueba('ORD-2898', 45),
    'ORD-2899': generarOrdenPrueba('ORD-2899', 36),
    'ORD-2900': generarOrdenPrueba('ORD-2900', 40),
    'ORD-2901': generarOrdenPrueba('ORD-2901', 33),
    'ORD-2902': generarOrdenPrueba('ORD-2902', 44),
    'ORD-2903': generarOrdenPrueba('ORD-2903', 30),

    // — Órdenes pequeñas (urgentes) —
    'ORD-2904': generarOrdenPrueba('ORD-2904', 22),
    'ORD-2905': generarOrdenPrueba('ORD-2905', 18),
    'ORD-2906': generarOrdenPrueba('ORD-2906', 25),
    'ORD-2907': generarOrdenPrueba('ORD-2907', 15),
    'ORD-2908': generarOrdenPrueba('ORD-2908', 20),
    'ORD-2909': generarOrdenPrueba('ORD-2909', 12),
    'ORD-2910': generarOrdenPrueba('ORD-2910', 24),
};

export async function cargarOrdenesDesdeDB(): Promise<Record<string, PrepackMemoria[]>> {
    // Aquí se implementaría la lógica para cargar las órdenes desde la base de datos MongoDB
    const ordenes = await OrdenModel.find({}).lean();
    const mapaOrdenes: Record<string, PrepackMemoria[]> = {};
    const allPrepackIds = ordenes.flatMap(o => o.prepacks.map(p => p.id_prepack));

    const rfidEvents = await RfidEventModel
        .find({ id_prepack: { $in: allPrepackIds } })
        .sort({ timestamp: 1 })
        .lean();
    
    const eventosPorPrepack = new Map<string, Array<{ etapa: Etapa; timestamp: Date; readerId: string }>>();
    for (const event of rfidEvents) {
        const arr = eventosPorPrepack.get(event.id_prepack) ?? [];
        arr.push({ etapa: event.etapa as Etapa, timestamp: event.timestamp, readerId: '' });
        eventosPorPrepack.set(event.id_prepack, arr);
    }
    for (const orden of ordenes) {
        mapaOrdenes[orden.id_orden] = orden.prepacks.map(pp => ({
            id: pp.id_prepack,
            orderId: orden.id_orden,
            currentEtapa: normalizarEtapa(pp.estado_actual),
            historial: eventosPorPrepack.get(pp.id_prepack) ?? [],
            modelo: pp.modelo,
            cantidad_total: pp.cantidad_total,
            bahia_asignada: pp.bahia_asignada,
            distribucion_color: pp.distribucion_color,
            distribucion_talla: pp.distribucion_talla,
        }));
  }
  return mapaOrdenes;
}

export let ordenesEnMemoria: Record<string, PrepackMemoria[]> = ordenesPrueba; // Inicialmente cargamos las órdenes de prueba

export async function inicializarOrdenesDesdeDB(): Promise<void> {
  ordenesEnMemoria = await cargarOrdenesDesdeDB();
}