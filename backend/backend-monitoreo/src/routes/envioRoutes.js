const express = require('express')
const router = express.Router()
const { getKPIsEnvio, getBacklogOrdenes, getEnvioPorTurno, getOrdenesActivas } = require('../controllers/envioController')

router.get('/kpis', getKPIsEnvio)
router.get('/backlog', getBacklogOrdenes)
router.get('/por-turno', getEnvioPorTurno)
router.get('/ordenes-activas', getOrdenesActivas)

module.exports = router
