import 'dotenv/config'
import mongoose from 'mongoose'
import Orden from './models/ordenModel'
import Tienda from './models/tiendaModel'

const TIENDAS_DATA = [
  {
    id_tienda: 'SUC-Monterrey-001', nombre: 'Sucursal Monterrey', region: 'Norte',
    direccion: { calle: 'Av. Constitución', numero: '450', codigo_postal: '64000', municipio: 'Monterrey' },
  },
  {
    id_tienda: 'SUC-Guadalajara-002', nombre: 'Sucursal Guadalajara', region: 'Sur',
    direccion: { calle: 'Av. Vallarta', numero: '1230', codigo_postal: '44100', municipio: 'Guadalajara' },
  },
  {
    id_tienda: 'SUC-CDMX-003', nombre: 'Sucursal CDMX', region: 'Centro',
    direccion: { calle: 'Insurgentes Sur', numero: '3720', codigo_postal: '14000', municipio: 'Tlalpan' },
  },
  {
    id_tienda: 'SUC-Leon-004', nombre: 'Sucursal León', region: 'Oeste',
    direccion: { calle: 'Blvd. López Mateos', numero: '812', codigo_postal: '37000', municipio: 'León' },
  },
  {
    id_tienda: 'SUC-Puebla-005', nombre: 'Sucursal Puebla', region: 'Este',
    direccion: { calle: 'Av. Juárez', numero: '2100', codigo_postal: '72000', municipio: 'Puebla' },
  },
]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function dateInWeek(weeksAgo: number): Date {
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek - 1) - weeksAgo * 7)
  monday.setHours(0, 0, 0, 0)
  const offset = randomInt(0, 4)
  const d = new Date(monday)
  d.setDate(monday.getDate() + offset)
  d.setHours(randomInt(7, 17), randomInt(0, 59), 0, 0)
  return d
}

function ppId(id_orden: string, num: number): string {
  return `PP-${id_orden}-${String(num).padStart(3, '0')}`
}

async function seed(): Promise<void> {
  await mongoose.connect(process.env.MONGO_URI!)
  console.log('Conectado a MongoDB')

  await Tienda.deleteMany({})
  await Tienda.insertMany(TIENDAS_DATA)
  console.log(`Insertadas ${TIENDAS_DATA.length} tiendas`)

  await Orden.deleteMany({})

  const docs: any[] = []

  for (let w = 12; w >= 0; w--) {
    const baseIncompletas = randomInt(3, 8) + Math.max(0, 6 - w)
    const completas = randomInt(10, 20)

    for (let i = 0; i < baseIncompletas; i++) {
      const total_prepacks = randomInt(5, 10)
      const id_tienda = TIENDAS_DATA[randomInt(0, TIENDAS_DATA.length - 1)].id_tienda
      const id_orden = `ORD-W${String(12 - w).padStart(2, '0')}-INC-${i + 1}`
      docs.push({
        id_orden,
        id_tienda,
        fecha_creacion: dateInWeek(w),
        estado: 'en_proceso',
        total_prepacks,
        prepacks: Array.from({ length: randomInt(1, total_prepacks - 1) }, (_, idx) => ({
          id_prepack: ppId(id_orden, idx + 1),
          modelo: `MOD-${randomInt(100, 999)}`,
          cantidad_total: randomInt(10, 50),
          estado_actual: '',
          bahia_asignada: randomInt(1, 10),
          distribucion_color: [{ color: 'negro', num_color: 1 }],
          distribucion_talla: { CH: 2, M: 3, G: 2, XG: 1 },
        })),
      })
    }

    for (let i = 0; i < completas; i++) {
      const total_prepacks = randomInt(4, 8)
      const id_tienda = TIENDAS_DATA[randomInt(0, TIENDAS_DATA.length - 1)].id_tienda
      const id_orden = `ORD-W${String(12 - w).padStart(2, '0')}-COM-${i + 1}`
      docs.push({
        id_orden,
        id_tienda,
        fecha_creacion: dateInWeek(w),
        estado: 'completada',
        total_prepacks,
        prepacks: Array.from({ length: total_prepacks }, (_, idx) => ({
          id_prepack: ppId(id_orden, idx + 1),
          modelo: `MOD-${randomInt(100, 999)}`,
          cantidad_total: randomInt(10, 50),
          estado_actual: '',
          bahia_asignada: randomInt(1, 10),
          distribucion_color: [{ color: 'negro', num_color: 1 }],
          distribucion_talla: { CH: 2, M: 3, G: 2, XG: 1 },
        })),
      })
    }
  }

  await Orden.insertMany(docs)
  const incompletos = docs.filter((d) => d.prepacks.length < d.total_prepacks).length
  console.log(`Insertados ${docs.length} documentos (${incompletos} incompletos)`)

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})