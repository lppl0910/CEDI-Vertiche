import mongoose from 'mongoose'

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log('MongoDB conectado')
  } catch (error) {
    console.error('Error conectando a MongoDB:', (error as Error).message)
    console.warn('El servidor continúa sin base de datos — reintentando en 10s...')
    setTimeout(connectDB, 10000)
  }
}

export default connectDB
