import { Router } from 'express'
import { getKPIsSorter, getSorterPorBahia } from '../controllers/sorterController'

const router = Router()

router.get('/kpis', getKPIsSorter)
router.get('/por-bahia', getSorterPorBahia)

export default router
