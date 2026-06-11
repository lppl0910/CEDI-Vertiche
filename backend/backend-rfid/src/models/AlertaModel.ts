import mongoose, { Schema, Document } from 'mongoose';
import type { Alerta } from '../types/alertas.types';

export interface AlertaDocument extends Alerta, Document {}

const AlertaSchema = new Schema<AlertaDocument>({
    id:         { type: String, required: true, unique: true },
    ppId:       { type: String, required: true },
    orderId:    { type: String, required: true },
    stage:      { type: String, required: true },
    desc:       { type: String, required: true },
    status:     { type: String, enum: ['open', 'escalated', 'resolved'], default: 'open' },
    causa:      { type: String, default: '' },
    ts:         { type: Number, default: null },
    resolvedAt: { type: Number, default: null },
}, {
    timestamps: true,
});

export const AlertaModel = mongoose.model<AlertaDocument>('Alerta', AlertaSchema);
