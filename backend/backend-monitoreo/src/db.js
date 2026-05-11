const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log('MongoDB conectado')
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message)
    console.warn('El servidor continúa sin base de datos — reintentando en 10s...')
    setTimeout(connectDB, 10000)
  }
}

module.exports = connectDB