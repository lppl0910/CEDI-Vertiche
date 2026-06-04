import { Router } from 'express'
import { getKPIsAuditoria } from '../controllers/auditoriaController'

const router = Router()

router.get('/kpis', getKPIsAuditoria)

export default router
