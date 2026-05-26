const bwipjs = require('bwip-js');
const { createCanvas, loadImage } = require('canvas');

const PDFDocument = require('pdfkit');
const { print } = require('pdf-to-printer');

const fs = require('fs');

// =====================
// DATOS GENERICOS
// =====================
const data = {
    boxId: "BOX-001",
    ordenId: "ORD-22A",
    sucursalId: "SUC-145",
    direccion: "Av. Insurgentes Sur 123, CDMX",
    prepacks: []
};

// =====================
// DATOS RANDOM
// =====================
const modelos = ["Playera", "Pantalon", "Sudadera", "Camisa"];
const colores = ["Rojo", "Negro", "Azul", "Blanco"];
const tallas = ["CH", "M", "G", "XG"];

// =====================
// GENERAR 5 PREPACKS
// =====================
for (let i = 1; i <= 5; i++) {

    data.prepacks.push({

        prepackId: `PP-${i}`,

        modelo: modelos[
            Math.floor(Math.random() * modelos.length)
        ],

        color: colores[
            Math.floor(Math.random() * colores.length)
        ],

        talla: tallas[
            Math.floor(Math.random() * tallas.length)
        ],

        cantidad:
            Math.floor(Math.random() * 10) + 1
    });
}

// =====================
// TEXTO PARA QR
// =====================
function generarTextoQR(data) {

    return JSON.stringify(data);
}

// =====================
// GENERAR QR
// =====================
function generarQRBuffer(texto) {

    return new Promise((resolve, reject) => {

        bwipjs.toBuffer({

            bcid: 'qrcode',
            text: texto,

            scale: 6,

            includetext: false,

        }, (err, png) => {

            if (err) {
                reject(err);
            } else {
                resolve(png);
            }
        });
    });
}

// =====================
// WRAP TEXTO
// =====================
function wrapText(ctx, text, maxWidth) {

    const words = text.split(' ');

    let lines = [];

    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {

        const word = words[i];

        const width = ctx.measureText(
            currentLine + ' ' + word
        ).width;

        if (width < maxWidth) {

            currentLine += ' ' + word;

        } else {

            lines.push(currentLine);

            currentLine = word;
        }
    }

    lines.push(currentLine);

    return lines;
}

// =====================
// GENERAR STICKER
// =====================
async function generarSticker() {

    const canvas = createCanvas(612, 396);
    const ctx = canvas.getContext('2d');

    // =====================
    // FONDO
    // =====================
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 612, 396);

    // =====================
    // ESTILOS GENERALES
    // =====================
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    // =====================
    // BORDE EXTERIOR
    // =====================
    ctx.strokeRect(10, 10, 592, 376);

    // ==================================================
    // HEADER
    // ==================================================
    ctx.fillStyle = '#F2F2F2';

    ctx.fillRect(
        10,
        10,
        592,
        45
    );

    ctx.strokeRect(
        10,
        10,
        592,
        45
    );

    ctx.fillStyle = '#000000';

    ctx.font = 'bold 24px Arial';

    ctx.fillText(
        `CAJA ${data.boxId}`,
        210,
        40
    );

    // ==================================================
    // SECCION SUPERIOR
    // ==================================================

    // INFO GENERAL
    ctx.strokeRect(
        10,
        55,
        390,
        185
    );

    // QR
    ctx.strokeRect(
        400,
        55,
        202,
        185
    );

    // ==================================================
    // RESUMEN CONTENIDO
    // ==================================================
    ctx.strokeRect(
        10,
        240,
        592,
        146
    );

    // ==================================================
    // TITULO INFO GENERAL
    // ==================================================
    ctx.fillStyle = '#EAEAEA';

    ctx.fillRect(
        10,
        55,
        390,
        30
    );

    ctx.strokeRect(
        10,
        55,
        390,
        30
    );

    ctx.fillStyle = '#000000';

    ctx.font = 'bold 14px Arial';

    ctx.fillText(
        'INFORMACION GENERAL',
        20,
        75
    );

    // ==================================================
    // INFO GENERAL TEXTO
    // ==================================================
    ctx.font = '13px Arial';

    let y = 105;

    const info = [

        `Orden: ${data.ordenId}`,

        `Sucursal: ${data.sucursalId}`,

        `Prepacks: ${data.prepacks.length}`

    ];

    info.forEach(texto => {

        ctx.fillText(
            texto,
            20,
            y
        );

        y += 24;
    });

    // =====================
    // DIRECCION WRAP
    // =====================
    const direccionLineas = wrapText(

        ctx,

        `Direccion: ${data.direccion}`,

        350
    );

    direccionLineas.forEach(linea => {

        ctx.fillText(
            linea,
            20,
            y
        );

        y += 20;
    });

    // ==================================================
    // GENERAR QR
    // ==================================================
    const textoQR = generarTextoQR(data);

    const qrBuffer =
        await generarQRBuffer(textoQR);

    const qrImg =
        await loadImage(qrBuffer);

    // ==================================================
    // QR GRANDE
    // ==================================================
    ctx.drawImage(

        qrImg,

        415,
        70,

        170,
        170
    );

    // ==================================================
    // TITULO RESUMEN
    // ==================================================
    ctx.fillStyle = '#EAEAEA';

    ctx.fillRect(
        10,
        240,
        592,
        30
    );

    ctx.strokeRect(
        10,
        240,
        592,
        30
    );

    ctx.fillStyle = '#000000';

    ctx.font = 'bold 14px Arial';

    ctx.fillText(
        'RESUMEN DE CONTENIDO',
        20,
        260
    );

    // ==================================================
    // RESUMEN CONTENIDO
    // ==================================================
    ctx.font = '11px Arial';

    let resumenY = 290;

    data.prepacks.forEach(prepack => {

        const texto =

            `${prepack.prepackId} | `
            + `${prepack.modelo} | `
            + `${prepack.color} | `
            + `T${prepack.talla} | `
            + `Cant: ${prepack.cantidad}`;

        ctx.fillText(
            texto,
            20,
            resumenY
        );

        resumenY += 20;
    });

    // ==================================================
    // FOOTER
    // ==================================================
    ctx.font = '9px Arial';

    ctx.fillText(

        'Sistema de Auditoria y Trazabilidad RFID',

        350,

        380
    );

    // ==================================================
    // GUARDAR PNG
    // ==================================================
    const buffer =
        canvas.toBuffer('image/png');

    fs.writeFileSync(
        'label.png',
        buffer
    );

    // ==================================================
    // GUARDAR JSON
    // ==================================================
    fs.writeFileSync(

        'label.txt',

        JSON.stringify(data, null, 2)
    );

    console.log(
        'Sticker generado correctamente'
    );
}

// =====================
// GENERAR PDF
// =====================

async function generarPDF() {

    return new Promise((resolve) => {

        const doc = new PDFDocument({

            size: 'LETTER',
            margin: 0

        });

        const stream = fs.createWriteStream('label.pdf');

        doc.pipe(stream);

        // =====================
        // ETIQUETA SUPERIOR
        // =====================
        doc.image(

            'label.png',

            0,
            0,

            {
                width: 612,
                height: 396
            }
        );

        // =====================
        // ETIQUETA INFERIOR
        // =====================
        doc.image(

            'label.png',

            0,
            396,

            {
                width: 612,
                height: 396
            }
        );

        doc.end();

        stream.on('finish', () => {

            console.log(
                'PDF Avery 5126 generado'
            );

            resolve();
        });
    });
}

// =====================
// IMPRESION ETIQUETA
// =====================
async function imprimirEtiqueta() {

    try {

        await print(

            'label.pdf',

            {
                printer: 'Brother MFC-L8900CDW series'
            }

        );

        console.log('Etiqueta enviada a impresora');

    } catch (error) {

        console.log('Error al imprimir');

        console.log(error);
    }
}


// =====================
// EJECUCION
// =====================
async function main() {

    await generarSticker();

    await generarPDF();

    await imprimirEtiqueta();
}

main();