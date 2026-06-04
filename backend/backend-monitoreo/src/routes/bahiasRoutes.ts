import { Router } from 'express'
import {
  getKPIsBahias,
  getOcupacionBahias,
  getTendenciaBahias,
  getBahiasGeneral,
} from '../controllers/bahiasController'

const router = Router()

router.get('/kpis', getKPIsBahias)
router.get('/ocupacion', getOcupacionBahias)
router.get('/tendencia', getTendenciaBahias)
router.get('/general', getBahiasGeneral)

export default router
