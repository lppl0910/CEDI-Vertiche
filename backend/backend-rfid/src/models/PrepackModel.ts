/**
 * Esquema de base de datos para Prepack y sus eventos de etapa.
 * Generacion de estructura de datos asociada a prepack — Isaac Calderon Laflor
 *
 * USO: Una vez que MONGODB_URI esté configurado en .env, este modelo
 * permite persistir los prepacks y su historial entre reinicios del servidor.
 */
import mongoose, { Schema, Document } from 'mongoose';
import type { Prepack, Etapa } from '../types/rfid.types';

// Schema para cada evento del historial de un prepack
const EventoEtapaSchema = new Schema({
    etapa:     { type: String, required: true },
    timestamp: { type: Date,   required: true },
    readerId:  { type: String, required: true },
}, { _id: false });

// Schema principal del Prepack
export interface PrepackDocument extends Omit<Prepack, 'id'>, Document {}

// Schema sin generic explícito para evitar conflicto con el virtual `id` de Document.
const PrepackSchema = new Schema({
    id:           { type: String, required: true },
    orderId:      { type: String, required: true, index: true },
    currentEtapa: { type: String, required: true, index: true },
    historial:    { type: [EventoEtapaSchema], default: [] },
}, {
    timestamps: true,
}) as unknown as mongoose.Schema<PrepackDocument>;

// Índice compuesto para queries optimizadas por orden+etapa (#215)
PrepackSchema.index({ orderId: 1, currentEtapa: 1 });

export const PrepackModel = mongoose.model<PrepackDocument>('Prepack', PrepackSchema);
