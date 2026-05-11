import { ordenesPrueba } from '../data/mockData';
import type { ProgresoOrden, Etapa, ProgresoEtapa} from '../types/rfid.types';


/*
    Este servicio contiene la logica de negocio para manejar el progreso de las ordenes y prepacks en el sistema RFID.
    Contiene funciones para obtener el progreso de una orden y para simular el proceso de escaneo RFID y avance de etapa de un prepack.
    Author: Adrian Proano Bernal
*/

const ALL_ETAPAS: Etapa[] = ['','Preregistro', 'QA', 'Registro', 'Sorter', 'Bahias', 'Auditoria', 'Envio'];

export function getProgresoOrden(orderId: string): ProgresoOrden | null {
    const prepacks = ordenesPrueba[orderId];
    if (!prepacks) return null;

    //Conteo de prepacks por etapa (incluye historial para marcar etapas pasadas)
    const contarPorEtapa = ALL_ETAPAS.reduce<Record<Etapa, number>>(
        (acc, s) => ({ ...acc, [s]: 0 }),
        {} as Record<Etapa, number>
    );

    prepacks.forEach((p) => {
        if (p.currentEtapa === '') {
            contarPorEtapa['']++;
            return;
        }

        const etapasVistas = new Set<Etapa>();
        etapasVistas.add(p.currentEtapa);
        (p.historial ?? []).forEach((e) => {
            if (e.etapa) etapasVistas.add(e.etapa);
        });

        etapasVistas.forEach((etapa) => {
            contarPorEtapa[etapa]++;
        });
    });

    const progresoEtapa: ProgresoEtapa[] = ALL_ETAPAS.map((etapa) => ({
        etapa,
        count: contarPorEtapa[etapa],
        total: prepacks.length,
        percentage: Math.round((contarPorEtapa[etapa] / prepacks.length) * 100)
    }));

    return {
        orderId,
        totalPrepacks: prepacks.length,
        progresoEtapa,
        prepacks
    }
}

/*
    El siguiente codigo simula recibir un escaneo RFID y avanzar un prepack de etapa
    Author: Adrian Proano Bernal
*/
export function procesoEscaneoRFID(tagId: string, readerId: string, newEtapa: Etapa) {
    for (const [orderId,prepacks] of Object.entries(ordenesPrueba)) {
        const prepack = prepacks.find((p) => p.id === tagId);
        if (prepack) {
            //Actualizar historial
            prepack.historial.push({
                etapa: newEtapa,
                timestamp: new Date(),
                readerId
            });
            prepack.currentEtapa = newEtapa;
            console.log(`Prepack ${prepack.id} de orden ${orderId} avanzado a etapa ${newEtapa}`);
            
            return { prepack, orderId, progreso: getProgresoOrden(orderId) };
        }
    }
    return null;
}