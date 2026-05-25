import mongoose, { Schema, Document, Model } from 'mongoose'
import { IOrden } from '../types/orden.types'

export type OrdenDocument = IOrden & Document

const ordenSchema = new Schema<OrdenDocument>({
  id_orden: String,
  id_tienda: Schema.Types.ObjectId,
  id_proveedor: String,
  nombre_proveedor: String,
  equipo: String,
  fecha_creacion: Date,
  fecha_envio: Date,
  estado: {
    type: String,
    enum: ['en_proceso', 'completada', 'enviada'],
  },
  total_prepacks: Number,
  prepacks: [
    {
      id_prepack: String,
      modelo: String,
      cantidad_total: Number,
      estado_actual: {
        type: String,
        enum: ['preregistro', 'qa', 'registro', 'sorter', 'bahias', 'auditoria', 'envio'],
      },
      bahia_asignada: Number,
      distribucion_color: [{ color: String, num_color: Number }],
      distribucion_talla: {
        CH: Number,
        M: Number,
        G: Number,
        XG: Number,
      },
    },
  ],
})

const Orden: Model<OrdenDocument> = mongoose.model<OrdenDocument>('Orden', ordenSchema, 'ordenes')

export default Orden
