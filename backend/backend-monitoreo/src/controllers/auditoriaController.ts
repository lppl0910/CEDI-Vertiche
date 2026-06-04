import { Request, Response } from 'express'
import Orden from '../models/ordenModel'

export const getKPIsAuditoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const inicioHoy = new Date()
    inicioHoy.setHours(0, 0, 0, 0)

    const [statsResult, hoyResult] = await Promise.all([
      Orden.aggregate([
        { $match: { fecha_creacion: { $gte: inicioHoy } } },
        { $unwind: '$prepacks' },
        {
          $group: {
            _id: null,
            en_auditoria: {
              $sum: { $cond: [{ $eq: ['$prepacks.estado_actual', 'auditoria'] }, 1, 0] },
            },
          },
        },
      ]),
      Orden.aggregate([
        { $match: { fecha_creacion: { $gte: inicioHoy } } },
        { $unwind: '$prepacks' },
        {
          $group: {
            _id: null,
            auditados_hoy: {
              $sum: {
                $cond: [
                  { $in: ['$prepacks.estado_actual', ['auditoria', 'envio']] },
                  1,
                  0,
                ],
              },
            },
            pendientes_auditoria: {
              $sum: { $cond: [{ $eq: ['$prepacks.estado_actual', 'auditoria'] }, 1, 0] },
            },
          },
        },
      ]),
    ])

    const stats = statsResult[0] ?? { en_auditoria: 0 }
    const hoy = hoyResult[0] ?? { auditados_hoy: 0, pendientes_auditoria: 0 }

    const tasaExito =
      hoy.auditados_hoy > 0
        ? Number(
            (
              ((hoy.auditados_hoy - hoy.pendientes_auditoria) / hoy.auditados_hoy) *
              100
            ).toFixed(1),
          )
        : 100

    res.json({
      prepacks_en_auditoria: stats.en_auditoria,
      cajas_auditadas_hoy: hoy.auditados_hoy,
      cajas_con_error: hoy.pendientes_auditoria,
      tasa_exito: tasaExito,
      tiempo_promedio: 6.4,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener KPIs de Auditoría' })
  }
}
