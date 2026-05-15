const express = require('express')
const router = express.Router()
const { getKPIsPreregistro, getOrdenesIncompletasPorProveedor, getTendenciaSemanalOrdenesIncompletas, getProveedoresEstrella, getHistorialProveedor, getRendimientoEquipos } = require('../controllers/preregistroController')

if (process.env.NODE_ENV !== 'production') {
  router.post('/seed', require('../controllers/seedController'))
}

router.get('/kpis', getKPIsPreregistro)
router.get('/ordenes-incompletas', getOrdenesIncompletasPorProveedor)
router.get('/tendencia-semanal', getTendenciaSemanalOrdenesIncompletas)
router.get('/proveedores-estrella', getProveedoresEstrella)
router.get('/proveedores/:idProveedor/historial', getHistorialProveedor)
router.get('/equipos/rendimiento', getRendimientoEquipos)


module.exports = router