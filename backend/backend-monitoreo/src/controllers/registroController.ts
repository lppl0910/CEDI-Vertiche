import { Request, Response } from 'express'
import Orden from '../models/ordenModel'

export const getKPIsRegistro = async (req: Request, res: Response): Promise<void> => {
  try {
    const inicioHoy = new Date()
    inicioHoy.setHours(0, 0, 0, 0)
    const hace15min = new Date(Date.now() - 15 * 60 * 1000)

    const [statsResult, backlogCount] = await Promise.all([
      Orden.aggregate([
        { $match: { fecha_creacion: { $gte: inicioHoy } } },
        { $unwind: '$prepacks' },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            en_registro: {
              $sum: { $cond: [{ $eq: ['$prepacks.estado_actual', 'registro'] }, 1, 0] },
            },
            procesados: {
              $sum: {
                $cond: [
                  { $in: ['$prepacks.estado_actual', ['sorter', 'bahias', 'auditoria', 'envio']] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      Orden.countDocuments({ estado: 'en_proceso', fecha_creacion: { $gte: inicioHoy, $lte: hace15min } }),
    ])

    const stats = statsResult[0] ?? { total: 0, en_registro: 0, procesados: 0 }

    res.json({
      prepacks_en_registro: stats.en_registro,
      prepacks_procesados: stats.procesados,
      total_prepacks: stats.total,
      backlog_count: backlogCount,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener KPIs de Registro' })
  }
}

export const getRegistroPorEquipo = async (req: Request, res: Response): Promise<void> => {
  try {
    const inicioHoy = new Date()
    inicioHoy.setHours(0, 0, 0, 0)
    const resultado = await Orden.aggregate([
      { $match: { equipo: { $exists: true, $ne: null }, fecha_creacion: { $gte: inicioHoy } } },
      { $unwind: '$prepacks' },
      { $match: { 'prepacks.estado_actual': 'registro' } },
      {
        $group: {
          _id: '$equipo',
          prepacks: { $sum: 1 },
        },
      },
      { $sort: { prepacks: 1 } },
      {
        $project: {
          _id: 0,
          equipo: '$_id',
          tiempoPromedio: { $concat: [{ $toString: '$prepacks' }, ' pp'] },
          status: {
            $switch: {
              branches: [
                { case: { $lt: ['$prepacks', 5] }, then: 'success' },
                { case: { $lt: ['$prepacks', 10] }, then: 'warning' },
              ],
              default: 'error',
            },
          },
        },
      },
    ])
    res.json(resultado)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener Registro por equipo' })
  }
}

export const getBacklogRegistro = async (req: Request, res: Response): Promise<void> => {
  try {
    const inicioHoy = new Date()
    inicioHoy.setHours(0, 0, 0, 0)
    const resultado = await Orden.aggregate([
      { $match: { estado: 'en_proceso', fecha_creacion: { $gte: inicioHoy } } },
      { $unwind: '$prepacks' },
      { $match: { 'prepacks.estado_actual': 'registro' } },
      {
        $project: {
          _id: 0,
          pp: '$prepacks.id_prepack',
          proveedor: { $ifNull: ['$nombre_proveedor', '$id_tienda'] },
          equipo: { $ifNull: ['$equipo', 'N/A'] },
          minutosEnSistema: {
            $round: [
              { $divide: [{ $subtract: ['$$NOW', '$fecha_creacion'] }, 60000] },
              0,
            ],
          },
        },
      },
      { $sort: { minutosEnSistema: -1 } },
      { $limit: 30 },
    ])
    res.json(resultado)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener backlog de Registro' })
  }
}
