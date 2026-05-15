const bwipjs = require('bwip-js');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

// =====================
// DATOS GENERICOS
// =====================
const data = {
    boxId: "BOX-001",
    palletId: "PALLET-22A",
    sucursalId: "SUC-145",
    direccion: "Av. Insurgentes Sur 123, CDMX",
    prepacks: 5,
    contenido: [
        { modelo: "Playera", color: "Rojo", talla: "M", cantidad: 10 },
        { modelo: "Pantalon", color: "Negro", talla: "32", cantidad: 8 },
        { modelo: "Sudadera", color: "Azul", talla: "L", cantidad: 6 }
    ]
};

// =====================
// TEXTO PARA BARCODE
// =====================
function generarTextoBarcode(data) {
    return `${data.boxId}|${data.palletId}|${data.sucursalId}|PP:${data.prepacks}`;
}

// =====================
// GENERAR BARCODE (BUFFER)
// =====================
function generarBarcodeBuffer(texto) {
    return new Promise((resolve, reject) => {
        bwipjs.toBuffer({
            bcid: 'code128',
            text: texto,
            scale: 3,
            height: 10,
            includetext: true,
            textxalign: 'center',
        }, (err, png) => {
            if (err) reject(err);
            else resolve(png);
        });
    });
}

// =====================
// GENERAR STICKER PNG
// =====================
async function generarSticker() {

    const canvas = createCanvas(600, 400);
    const ctx = canvas.getContext('2d');

    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 600, 400);

    // Texto
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';

    let y = 30;

    ctx.fillText(`CAJA: ${data.boxId}`, 20, y); y += 25;
    ctx.fillText(`PALLET: ${data.palletId}`, 20, y); y += 25;

    ctx.fillText(`DESTINO: ${data.sucursalId}`, 20, y); y += 25;
    ctx.fillText(`${data.direccion}`, 20, y); y += 25;

    ctx.fillText(`PREPACKS: ${data.prepacks}`, 20, y); y += 25;

    y += 10;
    ctx.fillText(`CONTENIDO:`, 20, y); y += 25;

    data.contenido.forEach(item => {
        ctx.fillText(
            `- ${item.modelo} ${item.color} T${item.talla} x${item.cantidad}`,
            20,
            y
        );
        y += 20;
    });

    // =====================
    // AGREGAR BARCODE
    // =====================
    const textoBarcode = generarTextoBarcode(data);
    const barcodeBuffer = await generarBarcodeBuffer(textoBarcode);

    const barcodeImg = await loadImage(barcodeBuffer);

    // Dibujar barcode abajo
    ctx.drawImage(barcodeImg, 50, 280, 500, 100);

    // =====================
    // GUARDAR PNG
    // =====================
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('label.png', buffer);

    console.log("Sticker generado: label.png");
}

// =====================
// EJECUCION
// =====================
generarSticker();