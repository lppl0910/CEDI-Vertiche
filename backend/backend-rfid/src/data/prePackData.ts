import { isDBConnected } from "../config/database";
import { PrepackModel, RfidEventModel, OrdenModel} from "../models/PrepackModel";
import type { Etapa, EventoEtapa } from "../types/rfid.types";

export async function subirScaneo(
    tagId: string,
    newEtapa: Etapa,
    evento: EventoEtapa
): Promise<void> {
    if (!isDBConnected()) {
        console.warn('No hay conexión a la base de datos. El evento se registrará solo en memoria.');
        return;
    }

    await OrdenModel.updateOne(
        { 'prepacks.id_prepack': tagId },
        { $set: { 'prepacks.$.estado_actual': newEtapa } }
    );
}