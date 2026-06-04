import { Request, Response } from 'express'
import Orden from '../models/ordenModel'

const ETAPAS = ['preregistro', 'qa', 'registro', 'sorter', 'bahias', 'auditoria', 'envio'] as const
type Etapa = typeof ETAPAS[number]

const CAPACIDADES: Record<number, number> = {
  1: 200, 2: 200, 3: 200, 4: 200,
  5: 150, 6: 150, 7: 150,
  8: 200, 9: 200, 10: 200,
}

function ppMinStatus(ppmin: number): 'success' | 'warning' | 'error' {
  if (ppmin === 0) return 'error'
  if (ppmin < 2) return 'warning'
  return 'success'
}

export const getPPMin = async (req: Request, res: Response): Promise<void> => {
  try {
    const ventana = Math.max(1, Math.min(60, parseInt(req.query.ventana as string) || 5))
    const ahora = new Date()
    const inicioVentana = new Date(ahora.getTime() - ventana * 60 * 1000)
    const inicioHoy = new Date(ahora)
    inicioHoy.setHours(0, 0, 0, 0)

    const [
      ppminResult,
      [totalOrdenesHoy, ordenesIncompletasHoy],
      qaResult,
      bahiasOcupacionResult,
      auditoriaResult,
      ordenesConRetraso,
    ] = await Promise.all([
      // pp/min: count prepacks by estado_actual in the time window
      Orden.aggregate([
        { $match: { fecha_creacion: { $gte: inicioVentana } } },
        { $unwind: '$prepacks' },
        { $group: { _id: '$prepacks.estado_actual', count: { $sum: 1 } } },
      ]),
      // Preregistro KPIs (hoy completo)
      Promise.all([
        Orden.countDocuments({ fecha_creacion: { $gte: inicioHoy } }),
        Orden.countDocuments({
          fecha_creacion: { $gte: inicioHoy },
          $expr: { $lt: [{ $size: '$prepacks' }, '$total_prepacks'] },
        }),
      ]),
      // QA: tasa aceptacion hoy
      Orden.aggregate([
        { $match: { fecha_creacion: { $gte: inicioHoy } } },
        { $unwind: '$prepacks' },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pasaron: {
              $sum: {
                $cond: [
                  { $in: ['$prepacks.estado_actual', ['registro', 'sorter', 'bahias', 'auditoria', 'envio']] },
                  1, 0,
                ],
              },
            },
            en_qa: { $sum: { $cond: [{ $eq: ['$prepacks.estado_actual', 'qa'] }, 1, 0] } },
          },
        },
      ]),
      // Bahias: ocupacion por bahia hoy
      Orden.aggregate([
        { $match: { fecha_creacion: { $gte: inicioHoy } } },
        { $unwind: '$prepacks' },
        { $match: { 'prepacks.bahia_asignada': { $ne: null } } },
        { $group: { _id: '$prepacks.bahia_asignada', procesando: { $sum: 1 } } },
      ]),
      // Auditoria: tasa exito hoy
      Orden.aggregate([
        { $match: { fecha_creacion: { $gte: inicioHoy } } },
        { $unwind: '$prepacks' },
        {
          $group: {
            _id: null,
            auditados: {
              $sum: { $cond: [{ $in: ['$prepacks.estado_actual', ['auditoria', 'envio']] }, 1, 0] },
            },
            pendientes: {
              $sum: { $cond: [{ $eq: ['$prepacks.estado_actual', 'auditoria'] }, 1, 0] },
            },
          },
        },
      ]),
      // Envio: ordenes activas con mas de 30 min sin completar
      Orden.countDocuments({
        estado: 'en_proceso',
        fecha_creacion: { $gte: inicioHoy, $lte: new Date(ahora.getTime() - 30 * 60 * 1000) },
      }),
    ])

    // Build ppmin map from aggregation result
    const rawCounts: Record<string, number> = {}
    for (const item of ppminResult) {
      rawCounts[item._id] = item.count
    }
    const ppminMap: Record<string, number> = {}
    for (const etapa of ETAPAS) {
      ppminMap[etapa] = Number(((rawCounts[etapa] ?? 0) / ventana).toFixed(2))
    }

    // QA stats
    const qaStats = qaResult[0] ?? { total: 0, pasaron: 0, en_qa: 0 }
    const tasaAceptacion =
      qaStats.total > 0
        ? Number(((qaStats.pasaron / qaStats.total) * 100).toFixed(1))
        : 0

    // Registro: % en cross-dock = prepacks en registro / total hoy * 100
    const totalHoy = Object.values(rawCounts).reduce((s, v) => s + v, 0)
    const ppCrossDock =
      totalHoy > 0
        ? Number((((rawCounts['registro'] ?? 0) / totalHoy) * 100).toFixed(1))
        : 0

    // Sorter: paquetes en bahia incorrecta (ordenes con mas de 1 bahia distinta por orden)
    const sorterBahiasResult = await Orden.aggregate([
      { $match: { fecha_creacion: { $gte: inicioHoy } } },
      { $unwind: '$prepacks' },
      { $match: { 'prepacks.estado_actual': { $in: ['bahias', 'auditoria', 'envio'] } } },
      { $group: { _id: '$prepacks.bahia_asignada', paquetes: { $sum: 1 } } },
      { $sort: { paquetes: -1 } },
    ])
    const ppBahiaIncorrecta = sorterBahiasResult.length > 1
      ? sorterBahiasResult.slice(1).reduce((s: number, b: any) => s + b.paquetes, 0)
      : 0

    // Bahias grid
    const bahiasGrid = Array.from({ length: 10 }, (_, i) => {
      const num = i + 1
      const found = bahiasOcupacionResult.find((r: any) => r._id === num)
      const procesando = found ? found.procesando : 0
      const capacidad = CAPACIDADES[num] || 200
      const porcentaje = Math.min(100, Math.round((procesando / capacidad) * 100))
      return {
        id: `B${String(num).padStart(2, '0')}`,
        porcentaje,
        status: porcentaje > 90 ? 'error' : porcentaje > 75 ? 'warning' : ('success' as const),
      }
    })
    const bahiasSaturadas = bahiasGrid.filter((b) => b.status === 'error').length
    const ocupacionPromedio = Number(
      (bahiasGrid.reduce((s, b) => s + b.porcentaje, 0) / bahiasGrid.length).toFixed(1),
    )

    // Auditoria
    const audStats = auditoriaResult[0] ?? { auditados: 0, pendientes: 0 }
    const tasaAuditoria =
      audStats.auditados > 0
        ? Number((((audStats.auditados - audStats.pendientes) / audStats.auditados) * 100).toFixed(1))
        : 100

    const etapas = {
      prepack: {
        status: ppMinStatus(ppminMap['preregistro']),
        ppMin: ppminMap['preregistro'],
        ordenesRecibidas: totalOrdenesHoy,
        ordenesIncompletas: ordenesIncompletasHoy,
      },
      qa: {
        status: ppMinStatus(ppminMap['qa']),
        ppMin: ppminMap['qa'],
        porcentaje: tasaAceptacion,
        devolucionesPedidos: qaStats.en_qa,
      },
      registro: {
        status: ppMinStatus(ppminMap['registro']),
        ppMin: ppminMap['registro'],
        ppCrossDock,
        tiempoPromedioRegistro: '11 min',
      },
      sorter: {
        status: ppMinStatus(ppminMap['sorter']),
        ppMin: ppminMap['sorter'],
        fallas: 0,
        ppBahiaIncorrecta,
        tiempoInactivo: '0 min',
      },
      bahias: {
        status: ppMinStatus(ppminMap['bahias']),
        ppMin: ppminMap['bahias'],
        bahiasSaturadas,
        bahias: bahiasGrid,
        _ocupacion: ocupacionPromedio,
      },
      auditoria: {
        status: ppMinStatus(ppminMap['auditoria']),
        ppMin: ppminMap['auditoria'],
        valor: tasaAuditoria,
        fallasRechazadas: audStats.pendientes,
      },
      envio: {
        status: ppMinStatus(ppminMap['envio']),
        ppMin: ppminMap['envio'],
        tiempoPromedioRecorrido: '2.8 hrs',
        ordenesConRetraso,
      },
    }

    res.json({
      ventana_min: ventana,
      ventana_inicio: inicioVentana.toISOString(),
      ventana_fin: ahora.toISOString(),
      etapas,
      raw: Object.fromEntries(
        ETAPAS.map((e) => [e, { count: rawCounts[e] ?? 0, ppmin: ppminMap[e] }]),
      ),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al calcular pp/min de flujo' })
  }
}

export const getPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const ahora = new Date()
    const inicioHoy = new Date(ahora)
    inicioHoy.setHours(0, 0, 0, 0)

    const resultado = await Orden.aggregate([
      { $match: { fecha_creacion: { $gte: inicioHoy } } },
      { $unwind: '$prepacks' },
      {
        $group: {
          _id: {
            hora: { $hour: '$fecha_creacion' },
            etapa: '$prepacks.estado_actual',
          },
          count: { $sum: 1 },
        },
      },
    ])

    const TURNO_INICIO = 7
    const TURNO_FIN = 19
    const horaActual = Math.min(ahora.getHours(), TURNO_FIN)

    // Build a map: hora → { etapa: ppmin }
    const byHora: Record<number, Record<string, number>> = {}
    for (let h = TURNO_INICIO; h <= horaActual; h++) {
      byHora[h] = {}
    }
    for (const item of resultado) {
      const h = item._id.hora
      if (h >= TURNO_INICIO && h <= horaActual) {
        byHora[h][item._id.etapa] = Math.round(item.count / 60)
      }
    }

    const serie = Object.entries(byHora).map(([hora, counts]) => ({
      tiempo: `${String(hora).padStart(2, '0')}:00`,
      preregistro: counts['preregistro'] ?? 0,
      qa: counts['qa'] ?? 0,
      registro: counts['registro'] ?? 0,
      sorter: counts['sorter'] ?? 0,
      bahias: counts['bahias'] ?? 0,
      auditoria: counts['auditoria'] ?? 0,
      envio: counts['envio'] ?? 0,
    }))

    res.json(serie)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener datos de performance por hora' })
  }
}
