import { Router } from 'express'
import {
  getKPIsPreregistro,
  getOrdenesIncompletasPorProveedor,
  getTendenciaSemanalOrdenesIncompletas,
  getProveedoresEstrella,
  getHistorialProveedor,
  getRendimientoEquipos,
} from '../controllers/preregistroController'
import seedController from '../controllers/seedController'

const router = Router()

if (process.env.NODE_ENV !== 'production') {
  router.post('/seed', seedController)
}

router.get('/kpis', getKPIsPreregistro)
router.get('/ordenes-incompletas', getOrdenesIncompletasPorProveedor)
router.get('/tendencia-semanal', getTendenciaSemanalOrdenesIncompletas)
router.get('/proveedores-estrella', getProveedoresEstrella)
router.get('/proveedores/:idProveedor/historial', getHistorialProveedor)
router.get('/equipos/rendimiento', getRendimientoEquipos)

export default router
