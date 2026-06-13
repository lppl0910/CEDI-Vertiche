import mongoose, { Schema, Document, Model } from 'mongoose'

export interface RfidEventDocument extends Document {
  id_prepack: string
  id_orden: string
  etapa: string
  timestamp: Date
}

const rfidEventSchema = new Schema<RfidEventDocument>({
  id_prepack: String,
  id_orden: String,
  etapa: String,
  timestamp: Date,
})

const RfidEvent: Model<RfidEventDocument> = mongoose.model<RfidEventDocument>('RfidEvent', rfidEventSchema, 'rfidevents')

export default RfidEvent
