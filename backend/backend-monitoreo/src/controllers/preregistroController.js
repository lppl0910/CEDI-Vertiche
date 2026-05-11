const Orden = require('../models/ordenModel')

const getKPIsPreregistro = async (req, res) => {
  try {
    const ahora = new Date()
    const inicioSemana = new Date(ahora)
    inicioSemana.setDate(ahora.getDate() - ahora.getDay() + 1)
    inicioSemana.setHours(0, 0, 0, 0)
    const finSemana = new Date(inicioSemana)
    finSemana.setDate(inicioSemana.getDate() + 7)

    console.log('Inicio semana:', inicioSemana)
    console.log('Fin semana:', finSemana)
    console.log('Total docs en colección:', await Orden.countDocuments({}))

    const semanaEnCurso = `S${Math.ceil(ahora.getDate() / 7)}`

    const filtroSemana = {
      fecha_creacion: { $gte: inicioSemana, $lt: finSemana }
    }

    const ordenesRecibidas = await Orden.countDocuments(filtroSemana)

    const ordenesIncompletas = await Orden.countDocuments({
      ...filtroSemana,
      $expr: { $lt: [{ $size: '$prepacks' }, '$total_prepacks'] }
    })

    const tasaCompletas = ordenesRecibidas > 0
      ? (((ordenesRecibidas - ordenesIncompletas) / ordenesRecibidas) * 100).toFixed(1)
      : 0

    const proveedoresConIncidencias = await Orden.distinct('id_proveedor', {
      ...filtroSemana,
      $expr: { $lt: [{ $size: '$prepacks' }, '$total_prepacks'] }
    })

    res.json({
      ordenes_recibidas: ordenesRecibidas,
      ordenes_incompletas: ordenesIncompletas,
      tasa_completas: parseFloat(tasaCompletas),
      proveedores_con_incidencias: proveedoresConIncidencias.length,
      semana_en_curso: semanaEnCurso
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al calcular KPIs de prerregistro' })
  }
}

const getOrdenesIncompletasPorProveedor = async (req, res) => {
  try {
    const resultado = await Orden.aggregate([
      {
        $match: {
          $expr: { $lt: [{ $size: '$prepacks' }, '$total_prepacks'] }
        }
      },
      {
        $group: {
          _id: '$id_proveedor',
          nombre_proveedor: { $first: '$nombre_proveedor' },
          ordenes_incompletas: { $sum: 1 }
        }
      },
      {
        $sort: { ordenes_incompletas: -1 }
      }
    ])

    // Calcular total para % acumulado
    const total = resultado.reduce((sum, item) => sum + item.ordenes_incompletas, 0)
    let acumulado = 0
    const conPareto = resultado.map(item => {
      acumulado += item.ordenes_incompletas
      const pctAcum = Number(((acumulado / total) * 100).toFixed(1))

      // Logica de cortes Pareto
      let banda
      if (pctAcum <= 80) banda = 'rojo'
      else if (pctAcum <= 95) banda = 'naranja'
      else banda = 'amarillo'

      return {
        proveedor: item.nombre_proveedor || item._id,
        incompletas: item.ordenes_incompletas,
        pct_acumulado: pctAcum,
        banda
      }
    })

    res.json(conPareto)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener ordenes de prerregistro' })
  }
}

const getTendenciaSemanalOrdenesIncompletas = async (req, res) => {
  try {
    const semanas = Math.min(Math.max(parseInt(req.query.semanas) || 8, 4), 12)
    const ahora = new Date()
    const startDate = new Date(ahora)
    startDate.setDate(ahora.getDate() - semanas * 7)
    startDate.setHours(0, 0, 0, 0)

    const resultado = await Orden.aggregate([
      {
        $match: {
          fecha_creacion: { $gte: startDate },
          $expr: { $lt: [{ $size: '$prepacks' }, '$total_prepacks'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: '$fecha_creacion' },
            week: { $isoWeek: '$fecha_creacion' }
          },
          total: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ])

    const conVariacion = resultado.map((item, i) => {
      const prev = i > 0 ? resultado[i - 1].total : null
      const variacion = prev !== null && prev > 0
        ? Number((((item.total - prev) / prev) * 100).toFixed(1))
        : null
      return {
        semana: `S${String(item._id.week).padStart(2, '0')}/${item._id.year}`,
        total: item.total,
        variacion
      }
    })

    res.json(conVariacion)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener tendencia semanal de órdenes incompletas' })
  }
}

module.exports = { getKPIsPreregistro, getOrdenesIncompletasPorProveedor, getTendenciaSemanalOrdenesIncompletas }