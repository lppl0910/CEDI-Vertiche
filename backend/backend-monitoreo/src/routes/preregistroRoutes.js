const express = require('express')
const router = express.Router()
const { getKPIsPreregistro, getOrdenesIncompletasPorProveedor, getTendenciaSemanalOrdenesIncompletas } = require('../controllers/preregistroController')

if (process.env.NODE_ENV !== 'production') {
  router.post('/seed', require('../controllers/seedController'))
}

router.get('/kpis', getKPIsPreregistro)
router.get('/ordenes-incompletas', getOrdenesIncompletasPorProveedor)
router.get('/tendencia-semanal', getTendenciaSemanalOrdenesIncompletas)


module.exports = router