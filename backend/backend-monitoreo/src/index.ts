import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './db'
import preregistroRoutes from './routes/preregistroRoutes'
import envioRoutes from './routes/envioRoutes'

const app = express()

app.use(cors())
app.use(express.json())

connectDB()

app.use('/api/preregistro', preregistroRoutes)
app.use('/api/envio', envioRoutes)

const PORT = process.env.PORT ?? 3001
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})
