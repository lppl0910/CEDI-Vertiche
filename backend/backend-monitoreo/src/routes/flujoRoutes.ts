import { Router } from 'express'
import { getPPMin, getPerformance } from '../controllers/flujoController'

const router = Router()

router.get('/ppmin', getPPMin)
router.get('/performance', getPerformance)

export default router
