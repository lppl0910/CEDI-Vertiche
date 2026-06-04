import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './db'
import preregistroRoutes from './routes/preregistroRoutes'
import envioRoutes from './routes/envioRoutes'
import qaRoutes from './routes/qaRoutes'
import registroRoutes from './routes/registroRoutes'
import sorterRoutes from './routes/sorterRoutes'
import bahiasRoutes from './routes/bahiasRoutes'
import auditoriaRoutes from './routes/auditoriaRoutes'
import flujoRoutes from './routes/flujoRoutes'

const app = express()

app.use(cors())
app.use(express.json())

connectDB()

app.use('/api/preregistro', preregistroRoutes)
app.use('/api/envio', envioRoutes)
app.use('/api/qa', qaRoutes)
app.use('/api/registro', registroRoutes)
app.use('/api/sorter', sorterRoutes)
app.use('/api/bahias', bahiasRoutes)
app.use('/api/auditoria', auditoriaRoutes)
app.use('/api/flujo', flujoRoutes)

const PORT = process.env.PORT ?? 3001
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})
