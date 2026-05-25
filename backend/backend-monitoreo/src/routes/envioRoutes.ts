import { Router } from 'express'
import { getKPIsEnvio, getBacklogOrdenes, getEnvioPorTurno, getOrdenesActivas } from '../controllers/envioController'

const router = Router()

router.get('/kpis', getKPIsEnvio)
router.get('/backlog', getBacklogOrdenes)
router.get('/por-turno', getEnvioPorTurno)
router.get('/ordenes-activas', getOrdenesActivas)

export default router
