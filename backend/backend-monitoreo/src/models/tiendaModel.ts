import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IDireccion {
  calle: string
  numero: string
  codigo_postal: string
  municipio: string
}

export interface ITienda extends Document {
  id_tienda: string
  nombre: string
  direccion: IDireccion
  region: string
}

const tiendaSchema = new Schema<ITienda>({
  id_tienda: String,
  nombre: String,
  direccion: {
    calle: String,
    numero: String,
    codigo_postal: String,
    municipio: String,
  },
  region: String,
})

const Tienda: Model<ITienda> = mongoose.model<ITienda>('Tienda', tiendaSchema, 'tiendas')

export default Tienda