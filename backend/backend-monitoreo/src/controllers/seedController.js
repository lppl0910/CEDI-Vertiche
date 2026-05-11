const mongoose = require('mongoose')
const Orden = require('../models/ordenModel')

const PROVEEDORES = [
  { id: 'PROV-001', nombre: 'Textiles Norte' },
  { id: 'PROV-002', nombre: 'Confecciones Sur' },
  { id: 'PROV-003', nombre: 'Moda Express' },
  { id: 'PROV-004', nombre: 'Distribuidora Central' },
  { id: 'PROV-005', nombre: 'Manufactura Veloz' },
]

const EQUIPOS = ['Alpha', 'Beta', 'Delta']

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function dateNMinutesAgo(n) {
  return new Date(Date.now() - n * 60 * 1000)
}

function dateInWeek(weeksAgo) {
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

module.exports = async (req, res) => {
  try {
    await Orden.deleteMany({ id_orden: { $regex: /^(ORD-W\d{2}-|ORD-HOY-)/ } })

    const docs = []

    for (let w = 12; w >= 0; w--) {
      const baseIncompletas = randomInt(3, 8) + Math.max(0, 6 - w)
      const completas = randomInt(10, 20)

      for (let i = 0; i < baseIncompletas; i++) {
        const total_prepacks = randomInt(5, 10)
        const prov = PROVEEDORES[randomInt(0, PROVEEDORES.length - 1)]
        const doc = {
          id_orden: `ORD-W${String(12 - w).padStart(2, '0')}-INC-${i + 1}`,
          id_proveedor: prov.id,
          nombre_proveedor: prov.nombre,
          fecha_creacion: dateInWeek(w),
          estado: 'en_proceso',
          total_prepacks,
          prepacks: Array.from({ length: randomInt(1, total_prepacks - 1) }, () => ({
            id_prepack: new mongoose.Types.ObjectId(),
            modelo: `MOD-${randomInt(100, 999)}`,
            cantidad_total: randomInt(10, 50),
            estado_actual: 'preregistro',
            bahia_asignada: randomInt(1, 10),
            distribucion_color: [{ color: 'negro', num_color: 1 }],
            distribucion_talla: { CH: randomInt(1, 5), M: randomInt(2, 8), G: randomInt(2, 6), XG: randomInt(1, 4) },
          })),
        }
        // Assign a team to current-week orders (round-robin)
        if (w === 0) doc.equipo = EQUIPOS[i % EQUIPOS.length]
        docs.push(doc)
      }

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
          prepacks: Array.from({ length: total_prepacks }, () => ({
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

    // Today's operational orders — ensure meaningful envio KPI data
    const HOY_BACKLOG = [
      { minAtras: 52, total: 6 },
      { minAtras: 44, total: 5 },
      { minAtras: 35, total: 8 },
      { minAtras: 28, total: 4 },
      { minAtras: 18, total: 7 },
    ]
    HOY_BACKLOG.forEach((tbo, i) => {
      const prov = PROVEEDORES[i % PROVEEDORES.length]
      const received = randomInt(1, tbo.total - 1)
      docs.push({
        id_orden: `ORD-HOY-BKL-${i + 1}`,
        id_proveedor: prov.id,
        nombre_proveedor: prov.nombre,
        fecha_creacion: dateNMinutesAgo(tbo.minAtras),
        estado: 'en_proceso',
        total_prepacks: tbo.total,
        prepacks: Array.from({ length: received }, () => ({
          id_prepack: new mongoose.Types.ObjectId(),
          modelo: `MOD-${randomInt(100, 999)}`,
          cantidad_total: randomInt(10, 50),
          estado_actual: 'preregistro',
          bahia_asignada: randomInt(1, 10),
          distribucion_color: [{ color: 'negro', num_color: 1 }],
          distribucion_talla: { CH: randomInt(1, 5), M: randomInt(2, 8), G: randomInt(2, 6), XG: randomInt(1, 4) },
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
      const prov = PROVEEDORES[randomInt(0, PROVEEDORES.length - 1)]
      docs.push({
        id_orden: `ORD-HOY-ENV-${i + 1}`,
        id_proveedor: prov.id,
        nombre_proveedor: prov.nombre,
        fecha_creacion: fechaCreacion,
        fecha_envio: fechaEnvio,
        estado: 'enviada',
        total_prepacks,
        prepacks: Array.from({ length: total_prepacks }, () => ({
          id_prepack: new mongoose.Types.ObjectId(),
          modelo: `MOD-${randomInt(100, 999)}`,
          cantidad_total: randomInt(10, 50),
          estado_actual: 'envio',
          bahia_asignada: randomInt(1, 10),
          distribucion_color: [{ color: 'negro', num_color: 1 }],
          distribucion_talla: { CH: randomInt(1, 5), M: randomInt(2, 8), G: randomInt(2, 6), XG: randomInt(1, 4) },
        })),
      })
    }

    await Orden.insertMany(docs)
    const incompletos = docs.filter(d => d.prepacks.length < d.total_prepacks).length
    res.json({ ok: true, total: docs.length, incompletos })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al sembrar datos' })
  }
}
