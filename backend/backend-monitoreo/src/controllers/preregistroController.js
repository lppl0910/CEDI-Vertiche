const Orden = require('../models/ordenModel')

// Controladores para KPIs de prerregistro
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

// Controlador para obtener ordenes incompletas por proveedor con Pareto
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



const getProveedoresEstrella = async (req, res) => {
  try {
    const resultado = await Orden.aggregate([
      {
        $group: {
          _id: '$id_proveedor',
          nombre: { $first: '$nombre_proveedor' },
          total_ordenes: { $sum: 1 },
          ordenes_completas: {
            $sum: {
              $cond: [{ $gte: [{ $size: '$prepacks' }, '$total_prepacks'] }, 1, 0]
            }
          },
          volumen: { $sum: { $size: '$prepacks' } }
        }
      },
      {
        $project: {
          id_proveedor: '$_id',
          proveedor: '$nombre',
          total_ordenes: 1,
          volumen: 1,
          tasa_aceptacion: {
            $cond: [
              { $gt: ['$total_ordenes', 0] },
              {
                $round: [
                  { $multiply: [{ $divide: ['$ordenes_completas', '$total_ordenes'] }, 100] },
                  1
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: { tasa_aceptacion: -1 } }
    ])

    const conCategoria = resultado.map(item => ({
      ...item,
      categoria: item.tasa_aceptacion >= 95 ? 'estrella' : item.tasa_aceptacion >= 80 ? 'bueno' : 'riesgo'
    }))

    res.json(conCategoria)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener proveedores estrella' })
  }
}

// Controlador para obtener historial de aceptación de un proveedor
const getHistorialProveedor = async (req, res) => {
  try {
    const { idProveedor } = req.params
    const ahora = new Date()
    const startDate = new Date(ahora)
    startDate.setMonth(ahora.getMonth() - 6)
    startDate.setDate(1)
    startDate.setHours(0, 0, 0, 0)

    const resultado = await Orden.aggregate([
      {
        $match: {
          id_proveedor: idProveedor,
          fecha_creacion: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$fecha_creacion' },
            month: { $month: '$fecha_creacion' }
          },
          total: { $sum: 1 },
          completas: {
            $sum: {
              $cond: [{ $gte: [{ $size: '$prepacks' }, '$total_prepacks'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const historial = resultado.map(item => ({
      mes: `${MESES[item._id.month - 1]} ${item._id.year}`,
      tasa_aceptacion: item.total > 0
        ? Number(((item.completas / item.total) * 100).toFixed(1))
        : 0,
      total: item.total,
      completas: item.completas
    }))

    res.json(historial)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener historial del proveedor' })
  }
}

// Controlador para tendencia semanal de ordenes incompletas
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

const getRendimientoEquipos = async (req, res) => {
  try {
    const resultado = await Orden.aggregate([
      { $match: { estado: 'en_proceso', equipo: { $exists: true, $ne: null } } },
      { $sort: { fecha_creacion: -1 } },
      {
        $group: {
          _id: '$equipo',
          id_orden: { $first: '$id_orden' },
          total_prepacks: { $first: '$total_prepacks' },
          prepacks: { $first: '$prepacks' },
        }
      },
      {
        $project: {
          _id: 0,
          equipo: '$_id',
          id_orden: 1,
          total_prepacks: 1,
          recibidos: { $size: '$prepacks' },
          prepacks: 1,
        }
      },
      { $sort: { equipo: 1 } }
    ])

    const conEstado = resultado.map(item => {
      const pct = item.total_prepacks > 0
        ? Number(((item.recibidos / item.total_prepacks) * 100).toFixed(1))
        : 0
      return {
        equipo: item.equipo,
        id_orden: item.id_orden,
        total_prepacks: item.total_prepacks,
        recibidos: item.recibidos,
        pct_recibido: pct,
        status: pct >= 95 ? 'success' : pct >= 80 ? 'warning' : 'error',
        prepacks: item.prepacks.map(p => ({
          modelo: p.modelo,
          cantidad_total: p.cantidad_total,
          estado_actual: p.estado_actual,
          distribucion_talla: p.distribucion_talla,
          distribucion_color: p.distribucion_color,
        })),
      }
    })

    res.json(conEstado)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error al obtener rendimiento de equipos' })
  }
}

module.exports = { getKPIsPreregistro, getOrdenesIncompletasPorProveedor, getTendenciaSemanalOrdenesIncompletas, getProveedoresEstrella, getHistorialProveedor, getRendimientoEquipos }