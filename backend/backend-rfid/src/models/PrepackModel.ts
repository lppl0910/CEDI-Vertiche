/**
 * Esquema de base de datos para Prepack y sus eventos de etapa.
 * Generacion de estructura de datos asociada a prepack — Isaac Calderon Laflor
 *
 * USO: Una vez que MONGODB_URI esté configurado en .env, este modelo
 * permite persistir los prepacks y su historial entre reinicios del servidor.
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface RfidEventDocument extends Document {
  id_prepack: string;
  id_orden: string;
  etapa: string;
  timestamp: Date;
}

// Schema para cada evento de scaneo RFID
const rfidEventSchema = new Schema({
  _id: { type: Schema.Types.ObjectId, auto: true },
  id_prepack: { type: String, required: true },
  id_orden: { type: String, required: true },
  etapa: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Schema principal del Prepack
export interface PrepackDocument extends Document {
  id_prepack: string;
  modelo: string;
  cantidad_total: number;
  estado_actual: string;
  bahia_asignada: number;
  distribucion_color: Array<{ color: string; num_color: number }>;
  distribucion_talla: { CH: number; M: number; G: number; XG: number };
}

const PrepackSchema = new Schema({
    id_prepack: { type: String, required: true }, // ID único del prepack
    modelo: { type: String, required: true }, //Modelo de la prenda que se asigna al prepack
    cantidad_total: { type: Number, required: true }, //Cantidad total de prendas que se asigna al prepack
    estado_actual: { type: String, required: true }, // Etapa actual del prepack
    bahia_asignada: { type: Number, required: true }, //Bahía asignada al prepack, se asigna en etapa de empaque
    distribucion_color: [{
      color: { type: String, required: true },
      num_color: { type: Number, required: true },
    }], //Distribución de colores de las prendas asignadas al prepack, se asigna en etapa de empaque
    distribucion_talla: {CH: { type: Number, required: true }, 
      M: { type: Number, required: true }, 
      G: { type: Number, required: true }, 
      XG: { type: Number, required: true }} //Distribución de tallas de las prendas asignadas al prepack, se asigna en etapa de empaque
}) as unknown as mongoose.Schema<PrepackDocument>;

const ordenSchema = new Schema(
  {
    id_orden: { type: String, required: true },
    id_tienda: { type: String, required: true },
    nombre_proveedor: { type: String, required: true },
    fecha_creacion: { type: Date, required: true },
    estado: { type: String, required: true },
    total_prepacks: { type: Number, required: true },
    prepacks: { type: [PrepackSchema], required: true },
  },
  { collection: 'ordenes', timestamps: false }
);

export interface OrdenDocument extends Document {
  id_orden: string;
  id_tienda: string;
  nombre_proveedor: string;
  fecha_creacion: Date;
  estado: string;
  total_prepacks: number;
  prepacks: Array<{
    id_prepack: string;
    modelo: string;
    cantidad_total: number;
    estado_actual: string;
    bahia_asignada: number;
    distribucion_color: Array<{ color: string; num_color: number }>;
    distribucion_talla: { CH: number; M: number; G: number; XG: number };
  }>;
}

//Estos exports podrian cambiar en el futuro, especificamente PrepackModel, ya que no hay una coleccion en la base de datos de prepacks,
// y podria terminar no usado
//Author: Adrian Proano Bernal
export const PrepackModel = mongoose.model<PrepackDocument>('prepacks', PrepackSchema);

export const RfidEventModel = mongoose.model<RfidEventDocument>('rfidEvent', rfidEventSchema);

export const OrdenModel = mongoose.model<OrdenDocument>('ordenes', ordenSchema);