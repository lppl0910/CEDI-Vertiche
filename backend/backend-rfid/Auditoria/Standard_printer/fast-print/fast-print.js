const fs = require('fs');
const { exec } = require('child_process');

// =====================
// DATOS SIMULADOS
// =====================
function generarDatos(index) {

    return {

        boxId: `BOX-${index}`,

        ordenId: `ORD-${index}`,

        sucursalId: `SUC-${index}`,

        prepacks:
            Math.floor(Math.random() * 10) + 1
    };
}

// =====================
// GENERAR TEXTO
// =====================
function generarEtiquetaTexto(data) {

    return `
====================================
ETIQUETA RFID
====================================

CAJA: ${data.boxId}

ORDEN: ${data.ordenId}

SUCURSAL: ${data.sucursalId}

PREPACKS: ${data.prepacks}

====================================
`;
}

// =====================
// IMPRIMIR RAW WINDOWS
// =====================
function imprimirTexto(nombreArchivo) {

    return new Promise((resolve, reject) => {

        const printer =
            'Brother MFC-L8900CDW series';

        const comando =

            `PRINT /D:"${printer}" "${nombreArchivo}"`;

        exec(comando, (error) => {

            if (error) {

                reject(error);

            } else {

                resolve();
            }
        });
    });
}

// =====================
// STRESS TEST
// =====================
async function stressTest() {

    const total = 20;

    console.log('\nINICIANDO TEST\n');

    const inicio = Date.now();

    for (let i = 1; i <= total; i++) {

        const data =
            generarDatos(i);

        const texto =
            generarEtiquetaTexto(data);

        const archivo =
            `job-${i}.txt`;

        fs.writeFileSync(
            archivo,
            texto
        );

        const t0 = Date.now();

        await imprimirTexto(archivo);

        const t1 = Date.now();

        console.log(

            `JOB ${i} enviado en `
            + `${t1 - t0} ms`
        );
    }

    const fin = Date.now();

    console.log('\n====================');

    console.log(

        `TOTAL: ${(fin - inicio)/1000}s`
    );

    console.log(

        `PROMEDIO: `
        + `${((fin - inicio)/total).toFixed(0)} ms`
    );

    console.log('====================\n');
}

// =====================
// EJECUCION
// =====================
stressTest();