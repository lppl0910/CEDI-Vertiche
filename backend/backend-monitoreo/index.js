require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./src/db')
const preregistroRoutes = require('./src/routes/preregistroRoutes')

const app = express()

app.use(cors())
app.use(express.json())

connectDB()

app.use('/api/preregistro', preregistroRoutes)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})