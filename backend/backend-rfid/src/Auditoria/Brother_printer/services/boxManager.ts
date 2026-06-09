import { CajaModel } from '../../../models/CajaModel.js';

const CAPACIDAD_CAJA = 5;

interface Caja {
    boxId: string;
    ordenId: string;
    tiendaId: string;
    capacidadObjetivo: number;
    prepacks: any[];
    impresa: boolean;
    enImpresion: boolean;
}

const cajasActivas = new Map<string, Caja>();

function calcularCapacidadCaja(
    totalPrepacks: number,
    indiceCaja: number
) {
    const cajasTotales =
        Math.ceil(totalPrepacks / CAPACIDAD_CAJA);

    const sobrante =
        totalPrepacks % CAPACIDAD_CAJA;

    if (
        indiceCaja === cajasTotales &&
        sobrante > 0
    ) {
        return sobrante;
    }

    return CAPACIDAD_CAJA;
}

export async function agregarPrepackACaja(
    orden: any,
    prepack: any
) {
    const orderId = orden?.id_orden ? String(orden.id_orden) : undefined;
    const tiendaId = orden?.id_tienda ? String(orden.id_tienda) : 'TIENDA_DESCONOCIDA';
    const totalPrepacks = Number(orden?.total_prepacks || 0);

    console.log('[BOX] agregarPrepackACaja llamado', { orderId, tiendaId, prepackId: prepack?.id_prepack, totalPrepacks, activeBoxes: cajasActivas.size });

    if (!orderId) {
        console.error('[BOX] orden sin id_orden — ignorando', { orden });
        return;
    }

    const key = orderId;
    let caja = cajasActivas.get(key);

    if (!caja) {
        // Consultar MongoDB para saber qué número de caja corresponde
        const ultimaCaja = await CajaModel.findOne({ ordenId: orderId })
            .sort({ fechaCreacion: -1 })
            .lean();

        const siguienteNumero = ultimaCaja
            ? Number(ultimaCaja.boxId.split('-BOX-')[1]) + 1
            : 1;

        console.log('[BOX] Creando nueva caja para orden', { orderId, totalPrepacks, siguienteNumero });

        caja = {
            boxId: `${orderId}-BOX-${siguienteNumero}`,
            ordenId: orderId,
            tiendaId,
            capacidadObjetivo: calcularCapacidadCaja(totalPrepacks, siguienteNumero),
            prepacks: [],
            impresa: false,
            enImpresion: false
        };

        cajasActivas.set(key, caja);
        console.log('[BOX] Claves activas ahora:', Array.from(cajasActivas.keys()).join(', '));
    } else {
        console.log('[BOX] Usando caja existente', { boxId: caja.boxId, currentCount: caja.prepacks.length });
    }

    if (!caja) return;
    const cajaActual = caja;

    cajaActual.prepacks.push(prepack);

    console.log(`[BOX] ${cajaActual.boxId}: ${cajaActual.prepacks.length}/${cajaActual.capacidadObjetivo}`);

    if (cajaActual.prepacks.length >= cajaActual.capacidadObjetivo && !cajaActual.enImpresion) {
        cajaActual.enImpresion = true;
        try {
            console.log('[BOX] [BOX COMPLETA] Llamando impresora para', { boxId: cajaActual.boxId, orderId });
            await CajaModel.create({
                boxId:         cajaActual.boxId,
                ordenId:       cajaActual.ordenId,
                sucursalId:    orden?.id_tienda ?? cajaActual.tiendaId,
                estado:        'Impresa',
                prepacks:      cajaActual.prepacks,
                fechaCreacion: new Date(),
            });
            console.log(`[BOX] Caja ${cajaActual.boxId} persistida en MongoDB`);
            await fetch(`${process.env.PRINTER_URL}/api/imprimir`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caja: cajaActual, orden })
            });
            cajaActual.impresa = true;
        } finally {
            cajaActual.enImpresion = false;
        }

        const siguienteNumero =
            Number(cajaActual.boxId.split('-BOX-')[1]) + 1;

        const capacidadNueva = calcularCapacidadCaja(
            totalPrepacks,
            siguienteNumero
        );

        const nuevaCaja: Caja = {
            boxId: `${orderId}-BOX-${siguienteNumero}`,
            ordenId: orderId,
            tiendaId,
            capacidadObjetivo: capacidadNueva,
            prepacks: [],
            impresa: false,
            enImpresion: false
        };

        cajasActivas.set(key, nuevaCaja);
        console.log('[BOX] Nueva caja creada', {
            boxId: nuevaCaja.boxId,
            capacidadObjetivo: nuevaCaja.capacidadObjetivo,
            activeBoxes: cajasActivas.size
        });
    }
}