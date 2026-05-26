// =====================
// DATOS RANDOM
// =====================
const modelos = [
    "Playera",
    "Pantalon",
    "Sudadera",
    "Camisa"
];

const colores = [
    "Rojo",
    "Negro",
    "Azul",
    "Blanco"
];

const tallas = [
    "CH",
    "M",
    "G",
    "XG"
];

// =====================
// GENERAR CAJA
// =====================
export function generarCaja(id) {

    const prepacks = [];

    const totalPrepacks = 5;

    for (let i = 1; i <= totalPrepacks; i++) {

        prepacks.push({

            prepackId: `PP-${i}`,

            modelo:
                modelos[
                    Math.floor(
                        Math.random() * modelos.length
                    )
                ],

            color:
                colores[
                    Math.floor(
                        Math.random() * colores.length
                    )
                ],

            talla:
                tallas[
                    Math.floor(
                        Math.random() * tallas.length
                    )
                ],

            cantidad:
                Math.floor(Math.random() * 5) + 1
        });
    }

    return {

        boxId: `BOX-${id}`,

        ordenId: `ORD-${100 + id}`,

        sucursalId: `SUC-${200 + id}`,

        direccion:
            'Av. Insurgentes Sur 123, CDMX',

        prepacks
    };
}