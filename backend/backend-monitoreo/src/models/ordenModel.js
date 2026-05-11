const mongoose = require('mongoose')

const ordenSchema = new mongoose.Schema({
  id_orden: String,
  id_tienda: mongoose.Schema.Types.ObjectId,
  id_proveedor: String,
  nombre_proveedor: String,
  equipo: String,
  fecha_creacion: Date,
  estado: {
    type: String,
    enum: ['en_proceso', 'completada', 'enviada']
  },
  total_prepacks: Number,
  prepacks: [
    {
      id_prepack: mongoose.Schema.Types.ObjectId,
      modelo: String,
      cantidad_total: Number,
      estado_actual: {
        type: String,
        enum: ['preregistro','qa','registro','sorter','bahias','auditoria','envio']
      },
      bahia_asignada: Number,
      distribucion_color: [{ color: String, num_color: Number }],
      distribucion_talla: {
        CH: Number, M: Number, G: Number, XG: Number
      }
    }
  ]
})

module.exports = mongoose.model('Orden', ordenSchema, 'ordenes')