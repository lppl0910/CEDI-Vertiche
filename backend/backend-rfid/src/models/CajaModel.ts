import mongoose, { Schema, Document } from 'mongoose';

export interface CajaDocument extends Document {
  boxId: string;
  ordenId: string;
  sucursalId: string;
  estado: 'Impresa' | 'Enviada';
  prepacks: Array<{
    id_prepack: string;
    modelo: string;
    categoria: string;
    cantidad_total: number;
    distribucion_color: Array<{ color: string; num_color: number }>;
    distribucion_talla: Array<{ CH?: number; M?: number; G?: number; XG?: number }>;
  }>;
  fechaCreacion: Date;
}

const CajaSchema = new Schema(
  {
    boxId:        { type: String, required: true, unique: true },
    ordenId:      { type: String, required: true },
    sucursalId:   { type: String, required: true },
    estado:       { type: String, enum: ['Pendiente', 'Impresa', 'Enviada'], default: 'Pendiente' },
    prepacks:     { type: [Schema.Types.Mixed], default: [] },
    fechaCreacion: { type: Date, default: Date.now },
  },
  { collection: 'cajas', timestamps: false }
);

export const CajaModel = mongoose.model<CajaDocument>('cajas', CajaSchema);