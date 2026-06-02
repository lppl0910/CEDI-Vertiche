import 'dotenv/config'
import mongoose from 'mongoose'
import Orden from './models/ordenModel'

async function resetEstadoPruebas(): Promise<void> {
  await mongoose.connect(process.env.MONGO_URI!)
  console.log('Conectado a MongoDB')

  const primeras5 = await Orden.find({}).sort({ _id: 1 }).limit(5).select('_id id_orden')

  for (const orden of primeras5) {
    await Orden.updateOne(
      { _id: orden._id },
      { $set: { 'prepacks.$[].estado_actual': '' } }
    )
    console.log(`Actualizada orden ${orden.id_orden}`)
  }

  console.log('Listo: estado_actual = "" en todos los prepacks de las primeras 5 órdenes')
  await mongoose.disconnect()
}

resetEstadoPruebas().catch((err) => {
  console.error(err)
  process.exit(1)
})