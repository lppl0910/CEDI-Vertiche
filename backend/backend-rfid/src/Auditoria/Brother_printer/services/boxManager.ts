const CAPACIDAD_CAJA = 5;

interface Caja {
    boxId: string;
    ordenId: string;
    tiendaId: string;
    capacidadObjetivo: number;
    prepacks: any[];
    impresa: boolean;
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
    const key = orden.id_orden;

    let caja = cajasActivas.get(key);

    if (!caja) {

        caja = {
            boxId: `${orden.id_orden}-BOX-1`,
            ordenId: orden.id_orden,
            tiendaId: orden.id_tienda,
            capacidadObjetivo:
                calcularCapacidadCaja(
                    orden.total_prepacks,
                    1
                ),
            prepacks: [],
            impresa: false
        };

        cajasActivas.set(key, caja);
    }

    caja.prepacks.push(prepack);

    console.log(
        `[BOX] ${caja.boxId}: ${caja.prepacks.length}/${caja.capacidadObjetivo}`
    );

    if (
        caja.prepacks.length >=
        caja.capacidadObjetivo
    ) {
        console.log(
            `[BOX COMPLETA] ${caja.boxId}`
        );

        await fetch(`${process.env.PRINTER_URL}/api/imprimir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caja, orden })
        });

        caja.impresa = true;

        const siguienteNumero =
            Number(
                caja.boxId.split('-BOX-')[1]
            ) + 1;

        const capacidadNueva =
            calcularCapacidadCaja(
                orden.total_prepacks,
                siguienteNumero
            );

        cajasActivas.set(key, {
            boxId:
                `${orden.id_orden}-BOX-${siguienteNumero}`,
            ordenId: orden.id_orden,
            tiendaId: orden.id_tienda,
            capacidadObjetivo: capacidadNueva,
            prepacks: [],
            impresa: false
        });
    }
}