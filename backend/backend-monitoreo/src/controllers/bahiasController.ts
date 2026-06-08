import { Request, Response } from 'express'
import Orden from '../models/ordenModel'

const CAPACIDADES: Record<number, number> = {
  1: 200, 2: 200, 3: 200, 4: 200,
  5: 150, 6: 150, 7: 150,
  8: 200, 9: 200, 10: 200,
}

interface BahiaRow {
  _id: number
  procesando: number
}

function buildOcupacion(porBahia: BahiaRow[]) {
  return Array.from({ length: 10 }, (_, i) => {
    const num = i + 1
    const item = porBahia.find((r) => r._id === num)
    const procesando = item ? item.procesando : 0
    const capacidad = CAPACIDADES[num] || 200
    const porcentaje = Math.min(100, Math.round((procesando / capacidad) * 100))
    return {
      bahia: `B${String(num).padStart(2, '0')}`,
      num,
      procesando,
      capacidad,
      porcentaje,
      status: porcentaje > 90 ? 'error' : porcentaje > 75 ? 'warning' : 'success',
    }
  })
}

async function queryPorBahia(inicioHoy?: Date) {
  const filtroFecha = inicioHoy ? { fecha_creacion: { $gte: inicioHoy } } : {}
  return Orden.aggregate<BahiaRow>([
    { $match: { estado: { $in: ['en_proceso', 'completada'] }, ...filtroFecha } },
    { $unwind: '$prepacks' },
    { $match: { 'prepacks.bahia_asignada': { $ne: null } } },
    {
      $group: {
        _id: '$prepacks.bahia_asignada',
        procesando: { $sum: 1 },
      },
    },
  ])
}

function getInicioHoy(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export const getKPIsBahias = async (req: Request, res: Response): Promise<void> => {
  try {
    const porBahiaResult = await queryPorBahia(getInicioHoy())
    const bahias = buildOcupacion(porBahiaResult)

    const totalCapacidad = bahias.reduce((s, b) => s + b.capacidad, 0)
    const bahiasSaturadas = bahias.filter((b) => b.porcentaje > 90).length
    const ocupacionPromedio = Number(
      (bahias.reduce((s, b) => s + b.porcentaje, 0) / bahias.length).toFixed(1),
    )
    const bahiaMasDescargada = bahias.reduce((mn, b) => (b.procesando < mn.procesando ? b : mn))

    res.json({
      ocupacion_promedio: ocupacionPromedio,
      bahias_saturadas: bahiasSaturadas,
      capacidad_total: totalCapacidad,
      bahia_mas_descargada: bahiaMasDescargada.bahia,
      bahia_mas_descargada_procesando: bahiaMasDescargada.procesando,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener KPIs de Bahías' })
  }
}

export const getOcupacionBahias = async (req: Request, res: Response): Promise<void> => {
  try {
    const porBahiaResult = await queryPorBahia(getInicioHoy())
    const bahias = buildOcupacion(porBahiaResult).map(({ bahia, procesando, capacidad }) => ({
      bahia,
      procesando,
      capacidad,
    }))
    res.json(bahias)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener ocupación de bahías' })
  }
}

export const getTendenciaBahias = async (req: Request, res: Response): Promise<void> => {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 6 * 7)
    startDate.setHours(0, 0, 0, 0)

    const resultado = await Orden.aggregate([
      { $match: { fecha_creacion: { $gte: startDate } } },
      { $unwind: '$prepacks' },
      { $match: { 'prepacks.bahia_asignada': { $in: [1, 2, 3, 4, 5] } } },
      {
        $group: {
          _id: {
            week: { $isoWeek: '$fecha_creacion' },
            year: { $isoWeekYear: '$fecha_creacion' },
            bahia: '$prepacks.bahia_asignada',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: { week: '$_id.week', year: '$_id.year' },
          bahias: { $push: { bahia: '$_id.bahia', count: '$count' } },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ])

    const tendencia = resultado.map((item: any) => {
      const row: Record<string, any> = {
        semana: `S${String(item._id.week).padStart(2, '0')}/${item._id.year}`,
      }
      ;[1, 2, 3, 4, 5].forEach((n) => {
        const found = item.bahias.find((b: any) => b.bahia === n)
        const count = found ? found.count : 0
        const cap = CAPACIDADES[n] || 200
        row[`B${String(n).padStart(2, '0')}`] = Math.min(100, Math.round((count / cap) * 100))
      })
      return row
    })

    res.json(tendencia)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener tendencia de bahías' })
  }
}

export const getBahiasGeneral = async (req: Request, res: Response): Promise<void> => {
  try {
    const porBahiaResult = await queryPorBahia(getInicioHoy())
    const bahias = buildOcupacion(porBahiaResult).map(({ bahia, porcentaje, status }) => ({
      id: bahia,
      porcentaje,
      status,
    }))

    const overallStatus = bahias.some((b) => b.status === 'error')
      ? 'error'
      : bahias.some((b) => b.status === 'warning')
      ? 'warning'
      : 'success'

    res.json({ status: overallStatus, bahias })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener estado general de bahías' })
  }
}
