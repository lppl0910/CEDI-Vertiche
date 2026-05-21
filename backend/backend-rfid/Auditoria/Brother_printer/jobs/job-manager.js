import { generarCaja } from '../data/generator.js';
import { generarLabelBuffer } from '../labels/label-generator.js';
import { imprimirBuffer } from '../queue/printer-service.js';
import { addJob } from '../queue/memory-queue.js';

let counter = 0;

export async function iniciarProceso() {

    const currentId = counter++;

    const data = generarCaja(counter);

    console.log(`Generando ${data.boxId}`);

    addJob(async () => {

        const buffer = await generarLabelBuffer(data);

        await imprimirBuffer(buffer);
    });
}