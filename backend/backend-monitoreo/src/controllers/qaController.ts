import { Request, Response } from 'express'
import Orden from '../models/ordenModel'

const ETAPAS_PASADAS_QA = ['registro', 'sorter', 'bahias', 'auditoria', 'envio']

export const getKPIsQA = async (req: Request, res: Response): Promise<void> => {
  try {
    const inicioHoy = new Date()
    inicioHoy.setHours(0, 0, 0, 0)

    const [statsResult, erroresResult] = await Promise.all([
      Orden.aggregate([
        { $match: { fecha_creacion: { $gte: inicioHoy } } },
        { $unwind: '$prepacks' },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            en_qa: {
              $sum: { $cond: [{ $eq: ['$prepacks.estado_actual', 'qa'] }, 1, 0] },
            },
            procesados: {
              $sum: {
                $cond: [{ $in: ['$prepacks.estado_actual', ETAPAS_PASADAS_QA] }, 1, 0],
              },
            },
          },
        },
      ]),
      Orden.aggregate([
        { $match: { fecha_creacion: { $gte: inicioHoy } } },
        { $unwind: '$prepacks' },
        { $match: { 'prepacks.estado_actual': 'qa' } },
        {
          $group: {
            _id: { $ifNull: ['$id_proveedor', '$id_tienda'] },
            errores: { $sum: 1 },
          },
        },
      ]),
    ])

    const stats = statsResult[0] ?? { total: 0, en_qa: 0, procesados: 0 }
    const tasaAceptacion =
      stats.total > 0
        ? Number(((stats.procesados / stats.total) * 100).toFixed(1))
        : 0
    const proveedoresConRechazo = erroresResult.filter((e: any) => e.errores >= 5).length

    res.json({
      total_prepacks: stats.total,
      prepacks_en_qa: stats.en_qa,
      prepacks_procesados: stats.procesados,
      tasa_aceptacion: tasaAceptacion,
      total_retornados: stats.en_qa,
      proveedores_con_rechazo: proveedoresConRechazo,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener KPIs de QA' })
  }
}

export const getErroresPorProveedorQA = async (req: Request, res: Response): Promise<void> => {
  try {
    const inicioHoy = new Date()
    inicioHoy.setHours(0, 0, 0, 0)
    const resultado = await Orden.aggregate([
      { $match: { fecha_creacion: { $gte: inicioHoy } } },
      { $unwind: '$prepacks' },
      { $match: { 'prepacks.estado_actual': 'qa' } },
      {
        $group: {
          _id: { $ifNull: ['$id_proveedor', '$id_tienda'] },
          proveedor: { $first: { $ifNull: ['$nombre_proveedor', '$id_tienda'] } },
          errores: { $sum: 1 },
        },
      },
      { $sort: { errores: -1 } },
      { $project: { _id: 0, proveedor: 1, errores: 1 } },
    ])
    res.json(resultado)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener errores por proveedor en QA' })
  }
}

export const getPrepacksActivosQA = async (req: Request, res: Response): Promise<void> => {
  try {
    const inicioHoy = new Date()
    inicioHoy.setHours(0, 0, 0, 0)
    const resultado = await Orden.aggregate([
      { $match: { estado: { $in: ['en_proceso', 'completada'] }, fecha_creacion: { $gte: inicioHoy } } },
      { $unwind: '$prepacks' },
      { $match: { 'prepacks.estado_actual': 'qa' } },
      {
        $project: {
          _id: 0,
          pp: '$prepacks.id_prepack',
          proveedor: { $ifNull: ['$nombre_proveedor', '$id_tienda'] },
          motivo: { $literal: 'En proceso' },
          equipo: { $ifNull: ['$equipo', 'N/A'] },
          hora: {
            $dateToString: { format: '%H:%M', date: '$fecha_creacion' },
          },
        },
      },
      { $sort: { hora: -1 } },
      { $limit: 50 },
    ])
    res.json(resultado)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener prepacks activos en QA' })
  }
}
