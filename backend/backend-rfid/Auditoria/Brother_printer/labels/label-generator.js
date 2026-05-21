import bwipjs from 'bwip-js';
import PDFDocument from 'pdfkit';

// =====================
// GENERAR QR
// =====================
async function generarQR(texto) {

    return await bwipjs.toBuffer({

        bcid: 'qrcode',

        text: texto,

        scale: 3,

        includetext: false,

        paddingwidth: 2,

        paddingheight: 2,

        backgroundcolor: 'FFFFFF'
    });
}

// =====================
// DIBUJAR ETIQUETA
// FORMATO AN-156
// 2 etiquetas verticales
// =====================
function dibujarEtiqueta(
    doc,
    data,
    qrBuffer,
    offsetY
) {

    // =====================================
    // AREA UTIL ETIQUETA
    // =====================================
    const startX = 18;

    const startY = 18 + offsetY;

    const totalWidth = 576;

    const totalHeight = 360;

    // =====================================
    // LAYOUT
    // =====================================
    const headerHeight = 42;

    const leftWidth = 255;

    const rightWidth = 321;

    // =====================================
    // CONTENEDORES
    // =====================================
    const infoHeight = 120;

    const resumenHeight = 198;

    // =====================================
    // BORDE EXTERIOR
    // =====================================
    doc
        .lineWidth(1.5)
        .strokeColor('#000000')
        .rect(
            startX,
            startY,
            totalWidth,
            totalHeight
        )
        .stroke();

    // =====================================
    // HEADER
    // =====================================
    doc
        .fillColor('#EFEFEF')
        .rect(
            startX,
            startY,
            totalWidth,
            headerHeight
        )
        .fill();

    doc
        .strokeColor('#000000')
        .rect(
            startX,
            startY,
            totalWidth,
            headerHeight
        )
        .stroke();

    doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(22)
        .text(
            `CAJA ${data.boxId}`,
            startX,
            startY + 12,
            {
                width: totalWidth,
                align: 'center'
            }
        );

    // =====================================
    // PANEL IZQUIERDO
    // =====================================
    doc
        .rect(
            startX,
            startY + headerHeight,
            leftWidth,
            totalHeight - headerHeight
        )
        .stroke();

    // =====================================
    // PANEL DERECHO QR
    // =====================================
    doc
        .rect(
            startX + leftWidth,
            startY + headerHeight,
            rightWidth,
            totalHeight - headerHeight
        )
        .stroke();

    // =====================================
    // TITULO INFO GENERAL
    // =====================================
    doc
        .fillColor('#EAEAEA')
        .rect(
            startX,
            startY + headerHeight,
            leftWidth,
            28
        )
        .fill();

    doc
        .strokeColor('#000000')
        .rect(
            startX,
            startY + headerHeight,
            leftWidth,
            28
        )
        .stroke();

    doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(
            'INFORMACION GENERAL',
            startX + 10,
            startY + headerHeight + 9
        );

    // =====================================
    // INFO GENERAL
    // =====================================
    doc
        .font('Helvetica')
        .fontSize(11);

    let infoY =
        startY +
        headerHeight +
        42;

    const info = [

        `Orden: ${data.ordenId}`,

        `Sucursal: ${data.sucursalId}`,

        `Prepacks: ${data.prepacks.length}`
    ];

    info.forEach(texto => {

        doc.text(
            texto,
            startX + 12,
            infoY
        );

        infoY += 20;
    });

    // =====================================
    // DIRECCION
    // =====================================
    doc.text(
        `Direccion: ${data.direccion}`,
        startX + 12,
        infoY,
        {
            width: 220
        }
    );

    // =====================================
    // DIVISION RESUMEN
    // =====================================
    const resumenStartY =
        startY +
        headerHeight +
        infoHeight;

    doc
        .fillColor('#EAEAEA')
        .rect(
            startX,
            resumenStartY,
            leftWidth,
            28
        )
        .fill();

    doc
        .strokeColor('#000000')
        .rect(
            startX,
            resumenStartY,
            leftWidth,
            28
        )
        .stroke();

    doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(
            'RESUMEN DE CONTENIDO',
            startX + 10,
            resumenStartY + 9
        );

    // =====================================
    // CONTENIDO RESUMEN
    // =====================================
    let resumenY =
        resumenStartY + 40;

    doc
        .font('Helvetica')
        .fontSize(9);

    data.prepacks.forEach(prepack => {

        const texto =

            `${prepack.prepackId} | `
            + `${prepack.modelo} | `
            + `${prepack.color} | `
            + `T${prepack.talla} | `
            + `C:${prepack.cantidad}`;

        doc.text(
            texto,
            startX + 10,
            resumenY,
            {
                width: 230
            }
        );

        resumenY += 14;
    });

    // =====================================
    // QR
    // =====================================
    doc.image(

        qrBuffer,

        startX + leftWidth + 28,

        startY + headerHeight + 30,

        {
            fit: [255, 255],
            align: 'center',
            valign: 'center'
        }
    );
}

// =====================
// GENERAR PDF BUFFER
// FORMATO AN-156
// =====================
export async function generarLabelBuffer(data) {

    // =====================================
    // QR JSON COMPLETO
    // =====================================
    const qrData = {

        boxId: data.boxId,

        ordenId: data.ordenId,

        sucursalId: data.sucursalId,

        prepacks: data.prepacks
    };

    const qrBuffer =
        await generarQR(
            JSON.stringify(qrData)
        );

    return new Promise((resolve) => {

        const doc = new PDFDocument({

            size: 'LETTER',

            layout: 'portrait',

            margin: 0
        });

        const chunks = [];

        doc.on('data', chunk => {

            chunks.push(chunk);
        });

        doc.on('end', () => {

            resolve(
                Buffer.concat(chunks)
            );
        });

        // =====================================
        // ETIQUETA SUPERIOR
        // =====================================
        dibujarEtiqueta(
            doc,
            data,
            qrBuffer,
            0
        );

        // =====================================
        // ETIQUETA INFERIOR
        // =====================================
        dibujarEtiqueta(
            doc,
            data,
            qrBuffer,
            396
        );

        doc.end();
    });
}