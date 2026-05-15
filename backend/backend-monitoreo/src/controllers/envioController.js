const Orden = require('../models/ordenModel')

const getKPIsEnvio = async (req, res) => {
  try {
    const ahora = new Date()
    const inicioHoy = new Date(ahora)
    inicioHoy.setHours(0, 0, 0, 0)
    const hace30min = new Date(ahora - 30 * 60 * 1000)
    const hace40min = new Date(ahora - 40 * 60 * 1000)

    const [ordenesEnviadas, ordenesBacklog, alertasCriticas, transitoResult, tiempoResult] =
      await Promise.all([
        Orden.countDocuments({ estado: 'enviada', fecha_envio: { $gte: inicioHoy } }),
        Orden.countDocuments({ estado: 'en_proceso', fecha_creacion: { $lte: hace30min } }),
        Orden.countDocuments({ estado: 'en_proceso', fecha_creacion: { $lte: hace40min } }),
        Orden.aggregate([
          { $match: { estado: { $in: ['en_proceso', 'completada'] } } },
          { $group: { _id: null, total: { $sum: { $size: '$prepacks' } } } },
        ]),
        Orden.aggregate([
          { $match: { estado: 'enviada', fecha_envio: { $gte: inicioHoy } } },
          {
            $project: {
              minutos: { $divide: [{ $subtract: ['$fecha_envio', '$fecha_creacion'] }, 60000] },
            },
          },
          { $group: { _id: null, promedio: { $avg: '$minutos' } } },
        ]),
      ])

    res.json({
      ordenes_enviadas: ordenesEnviadas,
      ordenes_backlog: ordenesBacklog,
      alertas_criticas: alertasCriticas,
      prepacks_transito: transitoResult[0]?.total || 0,
      tiempo_promedio: tiempoResult[0]?.promedio
        ? Number(tiempoResult[0].promedio.toFixed(1))
        : 0,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener KPIs de envío' })
  }
}

const getBacklogOrdenes = async (req, res) => {
  try {
    const hace12h = new Date(Date.now() - 12 * 60 * 60 * 1000)

    const resultado = await Orden.aggregate([
      { $match: { estado: 'en_proceso', fecha_creacion: { $gte: hace12h } } },
      {
        $project: {
          _id: 0,
          id_orden: 1,
          nombre_proveedor: 1,
          fecha_creacion: 1,
          prepacks_recibidos: { $size: '$prepacks' },
          total_prepacks: 1,
        },
      },
      { $sort: { fecha_creacion: 1 } },
      { $limit: 30 },
    ])

    res.json(resultado)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener backlog de órdenes' })
  }
}

const getEnvioPorTurno = async (req, res) => {
  try {
    const ahora = new Date()
    const inicioHoy = new Date(ahora)
    inicioHoy.setHours(0, 0, 0, 0)

    const resultado = await Orden.aggregate([
      { $match: { estado: 'enviada', fecha_envio: { $gte: inicioHoy } } },
      {
        $project: {
          hora: { $hour: '$fecha_envio' },
          minutos_proceso: {
            $divide: [{ $subtract: ['$fecha_envio', '$fecha_creacion'] }, 60000],
          },
          prepacks: { $size: '$prepacks' },
        },
      },
      {
        $group: {
          _id: { $cond: [{ $lt: ['$hora', 14] }, 'Matutino', 'Vespertino'] },
          ordenes: { $sum: 1 },
          prepacks: { $sum: '$prepacks' },
          tiempo_promedio: { $avg: '$minutos_proceso' },
        },
      },
      {
        $project: {
          _id: 0,
          turno: '$_id',
          ordenes: 1,
          prepacks: 1,
          tiempo_promedio: { $round: ['$tiempo_promedio', 1] },
        },
      },
      { $sort: { turno: 1 } },
    ])

    res.json(resultado)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener envíos por turno' })
  }
}

const getOrdenesActivas = async (req, res) => {
  try {
    const ahora = new Date()
    const dayOfWeek = ahora.getDay() === 0 ? 7 : ahora.getDay()
    const inicioSemana = new Date(ahora)
    inicioSemana.setDate(ahora.getDate() - (dayOfWeek - 1))
    inicioSemana.setHours(0, 0, 0, 0)

    const resultado = await Orden.aggregate([
      { $match: { estado: 'en_proceso', fecha_creacion: { $gte: inicioSemana } } },
      { $addFields: { prepacks_recibidos: { $size: '$prepacks' } } },
      { $unwind: { path: '$prepacks', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            id_orden: '$id_orden',
            etapa: { $ifNull: ['$prepacks.estado_actual', 'preregistro'] },
          },
          nombre_proveedor: { $first: '$nombre_proveedor' },
          id_proveedor: { $first: '$id_proveedor' },
          fecha_creacion: { $first: '$fecha_creacion' },
          total_prepacks: { $first: '$total_prepacks' },
          prepacks_recibidos: { $first: '$prepacks_recibidos' },
          count_en_etapa: { $sum: 1 },
        },
      },
      { $sort: { count_en_etapa: -1 } },
      {
        $group: {
          _id: '$_id.id_orden',
          etapa_actual: { $first: '$_id.etapa' },
          nombre_proveedor: { $first: '$nombre_proveedor' },
          id_proveedor: { $first: '$id_proveedor' },
          fecha_creacion: { $first: '$fecha_creacion' },
          total_prepacks: { $first: '$total_prepacks' },
          prepacks_recibidos: { $first: '$prepacks_recibidos' },
        },
      },
      {
        $project: {
          _id: 0,
          id_orden: '$_id',
          etapa_actual: 1,
          nombre_proveedor: 1,
          id_proveedor: 1,
          fecha_creacion: 1,
          total_prepacks: 1,
          prepacks_recibidos: 1,
        },
      },
      { $sort: { fecha_creacion: 1 } },
    ])

    res.json(resultado)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener órdenes activas' })
  }
}

module.exports = { getKPIsEnvio, getBacklogOrdenes, getEnvioPorTurno, getOrdenesActivas }
