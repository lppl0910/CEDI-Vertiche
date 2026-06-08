import { Request, Response } from 'express'
import Orden from '../models/ordenModel'

const ETAPAS_POST_SORTER = ['bahias', 'auditoria', 'envio']

export const getKPIsSorter = async (req: Request, res: Response): Promise<void> => {
  try {
    const inicioHoy = new Date()
    inicioHoy.setHours(0, 0, 0, 0)

    const [statsResult, porBahiaResult] = await Promise.all([
      Orden.aggregate([
        { $match: { fecha_creacion: { $gte: inicioHoy } } },
        { $unwind: '$prepacks' },
        {
          $group: {
            _id: null,
            en_sorter: {
              $sum: { $cond: [{ $eq: ['$prepacks.estado_actual', 'sorter'] }, 1, 0] },
            },
            clasificados: {
              $sum: {
                $cond: [{ $in: ['$prepacks.estado_actual', ETAPAS_POST_SORTER] }, 1, 0],
              },
            },
          },
        },
      ]),
      Orden.aggregate([
        { $match: { fecha_creacion: { $gte: inicioHoy } } },
        { $unwind: '$prepacks' },
        {
          $match: {
            'prepacks.estado_actual': { $in: ETAPAS_POST_SORTER },
            'prepacks.bahia_asignada': { $ne: null },
          },
        },
        {
          $group: {
            _id: '$prepacks.bahia_asignada',
            paquetes: { $sum: 1 },
          },
        },
        { $sort: { paquetes: -1 } },
      ]),
    ])

    const stats = statsResult[0] ?? { en_sorter: 0, clasificados: 0 }
    const top = porBahiaResult.length > 0 ? porBahiaResult[0] : { _id: 1, paquetes: 0 }

    res.json({
      total_clasificados: stats.clasificados,
      prepacks_en_sorter: stats.en_sorter,
      bahia_mas_cargada: `B${String(top._id).padStart(2, '0')}`,
      bahia_mas_cargada_paquetes: top.paquetes,
      tiempo_promedio_seg: 17.5,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener KPIs de Sorter' })
  }
}

export const getSorterPorBahia = async (req: Request, res: Response): Promise<void> => {
  try {
    const inicioHoy = new Date()
    inicioHoy.setHours(0, 0, 0, 0)
    const resultado = await Orden.aggregate([
      { $match: { fecha_creacion: { $gte: inicioHoy } } },
      { $unwind: '$prepacks' },
      { $match: { 'prepacks.bahia_asignada': { $ne: null } } },
      {
        $group: {
          _id: '$prepacks.bahia_asignada',
          paquetes: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const formatted = resultado.map((item: any) => ({
      bahia: `B${String(item._id).padStart(2, '0')}`,
      paquetes: item.paquetes,
    }))

    res.json(formatted)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener distribución de Sorter por bahía' })
  }
}
