import net from 'net';
import fs from 'fs';

class RawPrinter {

    constructor() {

        this.socket = null;

        this.connected = false;

        this.host = '192.168.1.150';

        this.port = 9100;
    }

    conectar() {

        return new Promise((resolve, reject) => {

            this.socket = new net.Socket();

            this.socket.connect(
                this.port,
                this.host,
                () => {

                    this.connected = true;

                    console.log('RAW printer conectada');

                    resolve();
                }
            );

            this.socket.on('error', (err) => {

                this.connected = false;

                console.log('Error RAW:', err.message);
            });

            this.socket.on('close', () => {

                this.connected = false;

                console.log('Conexion RAW cerrada');
            });
        });
    }

    async imprimirArchivo(path) {

        if (!this.connected) {

            await this.conectar();
        }

        const data = fs.readFileSync(path);

        this.socket.write(data);

        console.log('Trabajo RAW enviado');
    }
}

export default new RawPrinter();