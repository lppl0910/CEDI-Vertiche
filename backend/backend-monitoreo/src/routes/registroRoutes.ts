import { Router } from 'express'
import { getKPIsRegistro, getRegistroPorEquipo, getBacklogRegistro } from '../controllers/registroController'

const router = Router()

router.get('/kpis', getKPIsRegistro)
router.get('/por-equipo', getRegistroPorEquipo)
router.get('/backlog', getBacklogRegistro)

export default router
