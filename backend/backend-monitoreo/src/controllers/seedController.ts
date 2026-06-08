import { Request, Response } from 'express'
import Orden from '../models/ordenModel'
import Tienda from '../models/tiendaModel'

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

const EQUIPOS = ['Alpha', 'Beta', 'Delta']

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function dateNMinutesAgo(n: number): Date {
  return new Date(Date.now() - n * 60 * 1000)
}

function dateInWeek(weeksAgo: number): Date {
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek - 1) - weeksAgo * 7)
  monday.setHours(0, 0, 0, 0)
  const d = new Date(monday)
  d.setDate(monday.getDate() + randomInt(0, 4))
  d.setHours(randomInt(7, 17), randomInt(0, 59), 0, 0)
  return d
}

function ppId(orderNum: number, prepNum: number): string {
  return `PP-ORD-${orderNum}-${prepNum}`
}

const seedController = async (_req: Request, res: Response): Promise<void> => {
  try {
    await Tienda.deleteMany({})
    await Tienda.insertMany(TIENDAS_DATA)
    const tiendaIds = TIENDAS_DATA.map((t) => t.id_tienda)

    await Orden.deleteMany({})

    const docs: any[] = []
    let orderCounter = 0

    for (let w = 12; w >= 0; w--) {
      const baseIncompletas = randomInt(3, 8) + Math.max(0, 6 - w)
      const completas = randomInt(10, 20)

      for (let i = 0; i < baseIncompletas; i++) {
        const total_prepacks = randomInt(5, 10)
        const id_tienda = tiendaIds[randomInt(0, tiendaIds.length - 1)]
        const id_orden = `ORD-W${String(12 - w).padStart(2, '0')}-INC-${i + 1}`
        orderCounter++
        const currentOrder = orderCounter
        const doc: any = {
          id_orden,
          id_tienda,
          fecha_creacion: dateInWeek(w),
          estado: 'en_proceso',
          total_prepacks,
          prepacks: Array.from({ length: randomInt(1, total_prepacks - 1) }, (_, idx) => ({
            id_prepack: ppId(currentOrder, idx + 1),
            modelo: `MOD-${randomInt(100, 999)}`,
            cantidad_total: randomInt(10, 50),
            estado_actual: 'preregistro',
            bahia_asignada: randomInt(1, 10),
            distribucion_color: [{ color: 'negro', num_color: 1 }],
            distribucion_talla: {
              CH: randomInt(1, 5),
              M: randomInt(2, 8),
              G: randomInt(2, 6),
              XG: randomInt(1, 4),
            },
          })),
        }
        if (w === 0) doc.equipo = EQUIPOS[i % EQUIPOS.length]
        docs.push(doc)
      }

      for (let i = 0; i < completas; i++) {
        const total_prepacks = randomInt(4, 8)
        const id_tienda = tiendaIds[randomInt(0, tiendaIds.length - 1)]
        const id_orden = `ORD-W${String(12 - w).padStart(2, '0')}-COM-${i + 1}`
        orderCounter++
        const currentOrder = orderCounter
        docs.push({
          id_orden,
          id_tienda,
          fecha_creacion: dateInWeek(w),
          estado: 'completada',
          total_prepacks,
          prepacks: Array.from({ length: total_prepacks }, (_, idx) => ({
            id_prepack: ppId(currentOrder, idx + 1),
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

    const HOY_BACKLOG = [
      { minAtras: 52, total: 6 },
      { minAtras: 44, total: 5 },
      { minAtras: 35, total: 8 },
      { minAtras: 28, total: 4 },
      { minAtras: 18, total: 7 },
    ]
    HOY_BACKLOG.forEach((tbo, i) => {
      const id_tienda = tiendaIds[i % tiendaIds.length]
      const received = randomInt(1, tbo.total - 1)
      const id_orden = `ORD-HOY-BKL-${i + 1}`
      orderCounter++
      const currentOrder = orderCounter
      docs.push({
        id_orden,
        id_tienda,
        fecha_creacion: dateNMinutesAgo(tbo.minAtras),
        estado: 'en_proceso',
        total_prepacks: tbo.total,
        prepacks: Array.from({ length: received }, (_, idx) => ({
          id_prepack: ppId(currentOrder, idx + 1),
          modelo: `MOD-${randomInt(100, 999)}`,
          cantidad_total: randomInt(10, 50),
          estado_actual: 'preregistro',
          bahia_asignada: randomInt(1, 10),
          distribucion_color: [{ color: 'negro', num_color: 1 }],
          distribucion_talla: {
            CH: randomInt(1, 5),
            M: randomInt(2, 8),
            G: randomInt(2, 6),
            XG: randomInt(1, 4),
          },
        })),
      })
    })

    const totalEnviadas = randomInt(8, 14)
    for (let i = 0; i < totalEnviadas; i++) {
      const minutosProcess = randomInt(15, 55)
      const horasAtras = randomInt(1, 6)
      const fechaCreacion = new Date(Date.now() - (horasAtras * 60 + minutosProcess) * 60 * 1000)
      const fechaEnvio = new Date(fechaCreacion.getTime() + minutosProcess * 60 * 1000)
      const total_prepacks = randomInt(4, 8)
      const id_tienda = tiendaIds[randomInt(0, tiendaIds.length - 1)]
      const id_orden = `ORD-HOY-ENV-${i + 1}`
      orderCounter++
      const currentOrder = orderCounter
      docs.push({
        id_orden,
        id_tienda,
        fecha_creacion: fechaCreacion,
        fecha_envio: fechaEnvio,
        estado: 'enviada',
        total_prepacks,
        prepacks: Array.from({ length: total_prepacks }, (_, idx) => ({
          id_prepack: ppId(currentOrder, idx + 1),
          modelo: `MOD-${randomInt(100, 999)}`,
          cantidad_total: randomInt(10, 50),
          estado_actual: 'envio',
          bahia_asignada: randomInt(1, 10),
          distribucion_color: [{ color: 'negro', num_color: 1 }],
          distribucion_talla: {
            CH: randomInt(1, 5),
            M: randomInt(2, 8),
            G: randomInt(2, 6),
            XG: randomInt(1, 4),
          },
        })),
      })
    }

    // --- HOY: prepacks en etapas intermedias ---

    const QA_COUNT = randomInt(15, 25)
    for (let i = 0; i < QA_COUNT; i++) {
      const total_prepacks = randomInt(3, 8)
      const id_tienda = tiendaIds[randomInt(0, tiendaIds.length - 1)]
      const id_orden = `ORD-HOY-QA-${i + 1}`
      orderCounter++
      const cur = orderCounter
      docs.push({
        id_orden, id_tienda,
        fecha_creacion: dateNMinutesAgo(randomInt(10, 120)),
        estado: 'en_proceso',
        total_prepacks,
        prepacks: Array.from({ length: total_prepacks }, (_, idx) => ({
          id_prepack: ppId(cur, idx + 1),
          modelo: `MOD-${randomInt(100, 999)}`,
          cantidad_total: randomInt(10, 50),
          estado_actual: 'qa',
          bahia_asignada: randomInt(1, 10),
          distribucion_color: [{ color: 'negro', num_color: 1 }],
          distribucion_talla: { CH: randomInt(1, 5), M: randomInt(2, 8), G: randomInt(2, 6), XG: randomInt(1, 4) },
        })),
      })
    }

    const REG_COUNT = randomInt(12, 20)
    for (let i = 0; i < REG_COUNT; i++) {
      const total_prepacks = randomInt(3, 8)
      const id_tienda = tiendaIds[randomInt(0, tiendaIds.length - 1)]
      const id_orden = `ORD-HOY-REG-${i + 1}`
      orderCounter++
      const cur = orderCounter
      docs.push({
        id_orden, id_tienda,
        fecha_creacion: dateNMinutesAgo(randomInt(5, 90)),
        estado: 'en_proceso',
        equipo: EQUIPOS[i % EQUIPOS.length],
        total_prepacks,
        prepacks: Array.from({ length: total_prepacks }, (_, idx) => ({
          id_prepack: ppId(cur, idx + 1),
          modelo: `MOD-${randomInt(100, 999)}`,
          cantidad_total: randomInt(10, 50),
          estado_actual: 'registro',
          bahia_asignada: randomInt(1, 10),
          distribucion_color: [{ color: 'negro', num_color: 1 }],
          distribucion_talla: { CH: randomInt(1, 5), M: randomInt(2, 8), G: randomInt(2, 6), XG: randomInt(1, 4) },
        })),
      })
    }

    const SORTER_COUNT = randomInt(14, 22)
    for (let i = 0; i < SORTER_COUNT; i++) {
      const total_prepacks = randomInt(3, 8)
      const id_tienda = tiendaIds[randomInt(0, tiendaIds.length - 1)]
      const id_orden = `ORD-HOY-SRT-${i + 1}`
      orderCounter++
      const cur = orderCounter
      docs.push({
        id_orden, id_tienda,
        fecha_creacion: dateNMinutesAgo(randomInt(5, 60)),
        estado: 'en_proceso',
        total_prepacks,
        prepacks: Array.from({ length: total_prepacks }, (_, idx) => ({
          id_prepack: ppId(cur, idx + 1),
          modelo: `MOD-${randomInt(100, 999)}`,
          cantidad_total: randomInt(10, 50),
          estado_actual: 'sorter',
          bahia_asignada: randomInt(1, 10),
          distribucion_color: [{ color: 'negro', num_color: 1 }],
          distribucion_talla: { CH: randomInt(1, 5), M: randomInt(2, 8), G: randomInt(2, 6), XG: randomInt(1, 4) },
        })),
      })
    }

    const BAHIAS_COUNT = randomInt(20, 30)
    for (let i = 0; i < BAHIAS_COUNT; i++) {
      const total_prepacks = randomInt(3, 8)
      const id_tienda = tiendaIds[randomInt(0, tiendaIds.length - 1)]
      const id_orden = `ORD-HOY-BAH-${i + 1}`
      const bahiaFija = (i % 10) + 1
      orderCounter++
      const cur = orderCounter
      docs.push({
        id_orden, id_tienda,
        fecha_creacion: dateNMinutesAgo(randomInt(5, 60)),
        estado: 'en_proceso',
        total_prepacks,
        prepacks: Array.from({ length: total_prepacks }, (_, idx) => ({
          id_prepack: ppId(cur, idx + 1),
          modelo: `MOD-${randomInt(100, 999)}`,
          cantidad_total: randomInt(10, 50),
          estado_actual: 'bahias',
          bahia_asignada: bahiaFija,
          distribucion_color: [{ color: 'negro', num_color: 1 }],
          distribucion_talla: { CH: randomInt(1, 5), M: randomInt(2, 8), G: randomInt(2, 6), XG: randomInt(1, 4) },
        })),
      })
    }

    const AUD_COUNT = randomInt(8, 15)
    for (let i = 0; i < AUD_COUNT; i++) {
      const total_prepacks = randomInt(3, 8)
      const id_tienda = tiendaIds[randomInt(0, tiendaIds.length - 1)]
      const id_orden = `ORD-HOY-AUD-${i + 1}`
      orderCounter++
      const cur = orderCounter
      docs.push({
        id_orden, id_tienda,
        fecha_creacion: dateNMinutesAgo(randomInt(5, 45)),
        estado: 'en_proceso',
        total_prepacks,
        prepacks: Array.from({ length: total_prepacks }, (_, idx) => ({
          id_prepack: ppId(cur, idx + 1),
          modelo: `MOD-${randomInt(100, 999)}`,
          cantidad_total: randomInt(10, 50),
          estado_actual: 'auditoria',
          bahia_asignada: randomInt(1, 10),
          distribucion_color: [{ color: 'negro', num_color: 1 }],
          distribucion_talla: { CH: randomInt(1, 5), M: randomInt(2, 8), G: randomInt(2, 6), XG: randomInt(1, 4) },
        })),
      })
    }

    await Orden.insertMany(docs)
    const incompletos = docs.filter((d) => d.prepacks.length < d.total_prepacks).length
    res.json({
      ok: true, total: docs.length, incompletos, tiendas: tiendaIds.length,
      por_estado: {
        qa: QA_COUNT, registro: REG_COUNT, sorter: SORTER_COUNT,
        bahias: BAHIAS_COUNT, auditoria: AUD_COUNT,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al sembrar datos' })
  }
}

export const resetHoyController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const inicioHoy = new Date()
    inicioHoy.setHours(0, 0, 0, 0)
    const result = await Orden.deleteMany({ fecha_creacion: { $gte: inicioHoy } })
    res.json({ ok: true, eliminados: result.deletedCount })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al resetear datos de hoy' })
  }
}

const ESTADOS_INTERMEDIOS = ['preregistro', 'qa', 'registro', 'sorter', 'bahias', 'auditoria', 'envio'] as const
type EstadoIntermedio = typeof ESTADOS_INTERMEDIOS[number]

function buildOrden(estado: EstadoIntermedio, tiendaIds: string[], ts: number, counter: number, i: number, maxMin = 30): any {
  const total_prepacks = randomInt(3, 8)
  const id_tienda = tiendaIds[randomInt(0, tiendaIds.length - 1)]
  const id_orden = `ORD-HOY-${estado.toUpperCase()}-${ts}-${counter}`
  const doc: any = {
    id_orden, id_tienda,
    fecha_creacion: dateNMinutesAgo(randomInt(0, maxMin)),
    estado: estado === 'envio' ? 'enviada' : 'en_proceso',
    total_prepacks,
    prepacks: Array.from({ length: total_prepacks }, (_, idx) => ({
      id_prepack: `PP-${id_orden}-${idx + 1}`,
      modelo: `MOD-${randomInt(100, 999)}`,
      cantidad_total: randomInt(10, 50),
      estado_actual: estado,
      bahia_asignada: estado === 'bahias' ? (i % 10) + 1 : randomInt(1, 10),
      distribucion_color: [{ color: 'negro', num_color: 1 }],
      distribucion_talla: { CH: randomInt(1, 5), M: randomInt(2, 8), G: randomInt(2, 6), XG: randomInt(1, 4) },
    })),
  }
  if (estado === 'registro') doc.equipo = EQUIPOS[i % EQUIPOS.length]
  return doc
}

export const addBatchController = async (req: Request, res: Response): Promise<void> => {
  try {
    const tiendas = await Tienda.find({})
    if (!tiendas.length) {
      res.status(400).json({ error: 'No hay tiendas. Corre el seed completo primero.' })
      return
    }
    const tiendaIds = tiendas.map((t) => t.id_tienda)
    const ts = Date.now()
    const docs: any[] = []
    let counter = 0

    const estadoParam = req.query.estado as string | undefined
    const cantidad = Math.max(1, Math.min(50, parseInt(req.query.cantidad as string) || 0))
    const maxMin = Math.max(0, Math.min(60, parseInt(req.query.maxMin as string) || 30))

    if (estadoParam && ESTADOS_INTERMEDIOS.includes(estadoParam as EstadoIntermedio)) {
      // Agregar N órdenes a un estado específico
      const estado = estadoParam as EstadoIntermedio
      for (let i = 0; i < (cantidad || 1); i++) {
        counter++
        docs.push(buildOrden(estado, tiendaIds, ts, counter, i, maxMin))
      }
    } else {
      // Batch a todos los estados (2–5 por etapa)
      for (const estado of ESTADOS_INTERMEDIOS.filter(e => e !== 'preregistro' && e !== 'envio')) {
        const count = cantidad || randomInt(2, 5)
        for (let i = 0; i < count; i++) {
          counter++
          docs.push(buildOrden(estado as EstadoIntermedio, tiendaIds, ts, counter, i, maxMin))
        }
      }
    }

    await Orden.insertMany(docs)
    const por_estado: Record<string, number> = {}
    for (const estado of ESTADOS_INTERMEDIOS) {
      const n = docs.filter((d) => d.prepacks[0]?.estado_actual === estado).length
      if (n > 0) por_estado[estado] = n
    }
    res.json({ ok: true, agregados: docs.length, por_estado })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al agregar batch' })
  }
}

export default seedController