require('dotenv').config()
const mongoose = require('mongoose')
const Orden = require('./src/models/ordenModel')

const PROVEEDORES = [
  { id: 'PROV-001', nombre: 'Textiles Norte' },
  { id: 'PROV-002', nombre: 'Confecciones Sur' },
  { id: 'PROV-003', nombre: 'Moda Express' },
  { id: 'PROV-004', nombre: 'Distribuidora Central' },
  { id: 'PROV-005', nombre: 'Manufactura Veloz' },
]

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Returns a date within the ISO week N weeks ago from today
function dateInWeek(weeksAgo) {
  const now = new Date()
  // Monday of this ISO week
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek - 1) - weeksAgo * 7)
  monday.setHours(0, 0, 0, 0)
  // Random day within that week (Mon–Fri)
  const offset = randomInt(0, 4)
  const d = new Date(monday)
  d.setDate(monday.getDate() + offset)
  d.setHours(randomInt(7, 17), randomInt(0, 59), 0, 0)
  return d
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Conectado a MongoDB')

  // Remove existing seed data (identified by id_orden prefix)
  await Orden.deleteMany({ id_orden: { $regex: /^ORD-W\d{2}-/ } })

  const docs = []

  // Generate orders spread across the last 12 weeks
  // Weeks further back have fewer incompletes; recent weeks have more (realistic trend)
  for (let w = 12; w >= 0; w--) {
    const baseIncompletas = randomInt(3, 8) + Math.max(0, 6 - w)
    const completas = randomInt(10, 20)

    // Incomplete orders for this week
    for (let i = 0; i < baseIncompletas; i++) {
      const total_prepacks = randomInt(5, 10)
      const prov = PROVEEDORES[randomInt(0, PROVEEDORES.length - 1)]
      docs.push({
        id_orden: `ORD-W${String(12 - w).padStart(2, '0')}-INC-${i + 1}`,
        id_proveedor: prov.id,
        nombre_proveedor: prov.nombre,
        fecha_creacion: dateInWeek(w),
        estado: 'en_proceso',
        total_prepacks,
        prepacks: Array.from({ length: randomInt(1, total_prepacks - 1) }, (_, j) => ({
          id_prepack: new mongoose.Types.ObjectId(),
          modelo: `MOD-${randomInt(100, 999)}`,
          cantidad_total: randomInt(10, 50),
          estado_actual: 'preregistro',
          bahia_asignada: randomInt(1, 10),
          distribucion_color: [{ color: 'negro', num_color: 1 }],
          distribucion_talla: { CH: 2, M: 3, G: 2, XG: 1 },
        })),
      })
    }

    // Complete orders for this week
    for (let i = 0; i < completas; i++) {
      const total_prepacks = randomInt(4, 8)
      const prov = PROVEEDORES[randomInt(0, PROVEEDORES.length - 1)]
      docs.push({
        id_orden: `ORD-W${String(12 - w).padStart(2, '0')}-COM-${i + 1}`,
        id_proveedor: prov.id,
        nombre_proveedor: prov.nombre,
        fecha_creacion: dateInWeek(w),
        estado: 'completada',
        total_prepacks,
        prepacks: Array.from({ length: total_prepacks }, (_, j) => ({
          id_prepack: new mongoose.Types.ObjectId(),
          modelo: `MOD-${randomInt(100, 999)}`,
          cantidad_total: randomInt(10, 50),
          estado_actual: 'envio',
          bahia_asignada: randomInt(1, 10),
          distribucion_color: [{ color: 'negro', num_color: 1 }],
          distribucion_talla: { CH: 2, M: 3, G: 2, XG: 1 },
        })),
      })
    }
  }

  await Orden.insertMany(docs)
  const incompletos = docs.filter(d => d.prepacks.length < d.total_prepacks).length
  console.log(`Insertados ${docs.length} documentos (${incompletos} incompletos)`)

  await mongoose.disconnect()
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})
