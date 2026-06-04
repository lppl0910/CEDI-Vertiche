import { Router } from 'express'
import { getKPIsQA, getErroresPorProveedorQA, getPrepacksActivosQA } from '../controllers/qaController'

const router = Router()

router.get('/kpis', getKPIsQA)
router.get('/errores-por-proveedor', getErroresPorProveedorQA)
router.get('/prepacks-activos', getPrepacksActivosQA)

export default router
