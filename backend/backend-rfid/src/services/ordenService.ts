/**
 * Lógica de negocio para órdenes y prepacks RFID.
 * Incluye filtrado/ordenamiento optimizado en backend (#215 — Isaac Calderon Laflor).
 * Author: Adrian Proano Bernal
 */
import { ordenesPrueba, ordenesEnMemoria, normalizarEtapa} from '../data/generacionDatosEnMemoria.js';
import { subirScaneo } from '../data/prePackData.js';
import { OrdenModel, RfidEventModel } from '../models/PrepackModel.js';
import type { ProgresoOrden, Etapa, ProgresoEtapa, Prepack } from '../types/rfid.types.js';
import { agregarPrepackACaja } from '../Auditoria/Brother_printer/services/boxManager.js';
import { CajaModel } from '../models/CajaModel.js';

const ALL_ETAPAS: Etapa[] = ['Preregistro', 'QA', 'Registro', 'Sorter', 'Bahias', 'Auditoria', 'Envio'];

export function getProgresoOrden(orderId: string): ProgresoOrden | null {
    const prepacks = ordenesEnMemoria[orderId];
    if (!prepacks) return null;

    const contarPorEtapa = ALL_ETAPAS.reduce<Record<Etapa, number>>(
        (acc, s) => ({ ...acc, [s]: 0 }),
        {} as Record<Etapa, number>
    );

    prepacks.forEach((p) => contarPorEtapa[p.currentEtapa]++);

    const progresoEtapa: ProgresoEtapa[] = ALL_ETAPAS.map((etapa) => ({
        etapa,
        count: contarPorEtapa[etapa],
        total: prepacks.length,
        percentage: Math.round((contarPorEtapa[etapa] / prepacks.length) * 100),
    }));

    return { orderId, totalPrepacks: prepacks.length, progresoEtapa, prepacks };
}

/** Índice de avance: cuántas etapas tienen al menos un prepack */
function calcularAvance(orden: ProgresoOrden): number {
    return orden.progresoEtapa.filter(pe => pe.count > 0).length;
}

/** Timestamp mínimo (llegada) de una orden, calculado desde el historial */
function calcularLlegada(orden: ProgresoOrden): number {
    const ts = orden.prepacks
        .flatMap(pp => pp.historial.map(e => new Date(e.timestamp).getTime()))
        .filter(Boolean);
    return ts.length > 0 ? Math.min(...ts) : 0;
}

interface FiltroOrdenes {
    sort?:   string;
    etapa?:  string;
    search?: string;
    status?: string;
}

/**
 * Filtrado y ordenamiento en backend — queries optimizadas (#215).
 * Isaac Calderon Laflor
 */
export function getOrdenesConFiltro(filtros: FiltroOrdenes): ProgresoOrden[] {
    const { sort, etapa, search, status } = filtros;

    let ordenes = Object.keys(ordenesEnMemoria)
        .map(id => getProgresoOrden(id))
        .filter((o): o is ProgresoOrden => o !== null);

    // Buscar por orderId o prepackId
    if (search) {
        const q = search.toLowerCase();
        ordenes = ordenes.filter(o =>
            o.orderId.toLowerCase().includes(q) ||
            o.prepacks.some(pp => pp.id.toString().toLowerCase().includes(q))
        );
    }

    // Filtrar por etapa activa
    if (etapa) {
        ordenes = ordenes.filter(o =>
            o.prepacks.some(pp => pp.currentEtapa === etapa)
        );
    }

    // Filtrar por status
    if (status === 'completed') {
        ordenes = ordenes.filter(o => {
            const envio = o.progresoEtapa.find(pe => pe.etapa === 'Envio');
            return envio && envio.count >= envio.total && envio.total > 0;
        });
    } else if (status === 'active') {
        ordenes = ordenes.filter(o => {
            const envio = o.progresoEtapa.find(pe => pe.etapa === 'Envio');
            return !envio || envio.count < envio.total;
        });
    }

    // Ordenar
    switch (sort) {
        case 'id-asc':      ordenes.sort((a, b) => a.orderId.localeCompare(b.orderId)); break;
        case 'id-desc':     ordenes.sort((a, b) => b.orderId.localeCompare(a.orderId)); break;
        case 'arrival-asc': ordenes.sort((a, b) => calcularLlegada(a) - calcularLlegada(b)); break;
        case 'arrival-desc':ordenes.sort((a, b) => calcularLlegada(b) - calcularLlegada(a)); break;
        case 'adv-desc':    ordenes.sort((a, b) => calcularAvance(b) - calcularAvance(a)); break;
        case 'adv-asc':     ordenes.sort((a, b) => calcularAvance(a) - calcularAvance(b)); break;
        default:            ordenes.sort((a, b) => a.orderId.localeCompare(b.orderId));
    }

    return ordenes;
}

/**
 * Registra una falla de lectura RFID en un prepack sin avanzarlo de etapa.
 * Marca hasFalla=true para que el frontend lo muestre como error en la etapa.
 * Isaac Calderon Laflor
 */
export function registrarFallaPrepack(tagId: string, etapa: Etapa) {
    for (const [orderId, prepacks] of Object.entries(ordenesEnMemoria)) {
        const prepack = prepacks.find(p => p.id === tagId);
        if (prepack) {
            prepack.hasFalla  = true;
            prepack.fallaEtapa = etapa;
            console.log(`[FALLA] Prepack ${prepack.id} de orden ${orderId} — error lectura en ${etapa}`);
            return { orderId, progreso: getProgresoOrden(orderId) };
        }
    }
    return null;
}

/**
 * Simula recibir un escaneo RFID y avanza un prepack de etapa.
 * Author: Adrian Proano Bernal
 */
export async function procesoEscaneoRFID(
  tagId: string,
  readerId: string,
  newEtapa: Etapa
): Promise<{ prepack: Prepack; orderId: string; progreso: ProgresoOrden | null } | null> {
  for (const [orderId, prepacks] of Object.entries(ordenesEnMemoria)) {
    const prepack = prepacks.find((p) => p.id === tagId);
    if (prepack) {
      const evento = {
        etapa: newEtapa,
        timestamp: new Date(),
        readerId,
      };

      prepack.historial.push(evento);
      prepack.currentEtapa = newEtapa;

      await subirScaneo(tagId, orderId, newEtapa, evento);

      if (newEtapa === 'Bahias') {
        const ordenMongo = await OrdenModel.findOne({ id_orden: orderId });
        const prepackMongo = ordenMongo?.prepacks.find((p) => p.id_prepack === tagId);

        if (ordenMongo && prepackMongo) {
          await agregarPrepackACaja(ordenMongo, prepackMongo);
        }
      }
      
      console.log(`Prepack ${prepack.id} de orden ${orderId} avanzado a etapa ${newEtapa}`);
      return { prepack, orderId, progreso: getProgresoOrden(orderId) };
    }
  }

  return null;
}

export async function getDetallePrepack(orderId: string, prepackId: string) {
      const orden = await OrdenModel.findOne(
    { id_orden: orderId, 'prepacks.id_prepack': prepackId },
    {
      id_orden: 1,
      id_tienda: 1,
      prepacks: { $elemMatch: { id_prepack: prepackId } },
    }
  ).lean();

  if (!orden || !orden.prepacks || orden.prepacks.length === 0) {
    return null;
  }

  const prepack = orden?.prepacks?.[0];
  if (!prepack) {
    return null;
  }

  const eventos = await RfidEventModel.find({ id_prepack: prepackId }).sort({ timestamp: 1 }).lean();

  return {
    orderId: orden.id_orden,
    id_tienda: orden.id_tienda,
    prepack: {
      id: prepack.id_prepack,
      orderId: orden.id_orden,
      modelo: prepack.modelo,
      cantidad_total: prepack.cantidad_total,
      bahia_asignada: prepack.bahia_asignada,
      distribucion_color: prepack.distribucion_color,
      distribucion_talla: prepack.distribucion_talla,
      currentEtapa: normalizarEtapa(prepack.estado_actual),
      historial: eventos.map(e => ({
        etapa: e.etapa,
        timestamp: e.timestamp,
        readerId: '',
      })),
    },
  }
}

export async function procesarEnvioCaja(readerId: string): Promise<{ orderId: string; progreso: ProgresoOrden | null }[]> {
  const caja = await CajaModel.findOne({ estado: { $ne: 'Enviada' } })
    .sort({ fechaCreacion: 1 })
    .lean();

  if (!caja) {
    console.log('[ENVIO] No hay cajas pendientes de envío');
    return [];
  }

  const resultados = [];

  for (const prepack of caja.prepacks) {
    // Avanzar el prepack directamente en memoria y subir el scaneo a DB
    // sin pasar por procesoEscaneoRFID para evitar el loop
    for (const [orderId, prepacks] of Object.entries(ordenesEnMemoria)) {
      const p = prepacks.find(p => p.id === prepack.id_prepack);
      if (p) {
        const evento = { etapa: 'Envio' as Etapa, timestamp: new Date(), readerId };
        p.historial.push(evento);
        p.currentEtapa = 'Envio';
        await subirScaneo(prepack.id_prepack, orderId, 'Envio', evento);
        resultados.push({ orderId, progreso: getProgresoOrden(orderId) });
        console.log(`Prepack ${p.id} de orden ${orderId} avanzado a etapa ${'Envio'} por procesoEnvioCaja()`);
        break;
      }
    }
  }

  await CajaModel.findOneAndUpdate(
    { boxId: caja.boxId },
    { $set: { estado: 'Enviada' } }
  );

  console.log(`[ENVIO] Caja ${caja.boxId} marcada como Enviada`);
  return resultados;
}