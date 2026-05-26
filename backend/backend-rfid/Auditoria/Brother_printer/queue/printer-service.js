import net from 'net';

// =========================
// CONFIG
// =========================
const PRINTER_IP = '192.168.1.67'; // Insertar IP de la impresora

const PRINTER_PORT = 9100;

const PRINT_DELAY = 2500;

// =========================
// SLEEP
// =========================
function sleep(ms) {

    return new Promise(resolve => {

        setTimeout(resolve, ms);
    });
}

// =========================
// IMPRIMIR BUFFER
// =========================
export async function imprimirBuffer(buffer) {

    return new Promise((resolve, reject) => {

        // =====================
        //  SOCKET POR JOB
        // =====================
        const socket =
            new net.Socket();

        socket.connect(

            PRINTER_PORT,

            PRINTER_IP,

            () => {

                socket.write(
                    buffer,
                    async (err) => {

                        if (err) {

                            reject(err);

                            return;
                        }

                        console.log(
                            'Etiqueta enviada'
                        );

                        // =====================
                        // IMPORTANTE
                        // =====================
                        socket.end();

                        // =====================
                        // ESPERAR FLUSH
                        // =====================
                        await sleep(
                            PRINT_DELAY
                        );

                        resolve();
                    }
                );
            }
        );

        socket.on('error', (err) => {

            console.log(
                'Error impresora:',
                err.message
            );

            reject(err);
        });
    });
}