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

module.exports = { getKPIsPreregistro }