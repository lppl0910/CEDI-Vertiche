import { Router, type Request, type Response } from 'express';
import { getProgresoOrden } from '../services/ordenService';
import { ordenesPrueba } from '../data/mockData';

const router = Router();

//GET /api/ordenes
//Obtener el progreso de todsas las ordenes activas
//Author: Adrian Proano Bernal
router.get('/',(_req: Request, res: Response) => {
    const ordenes = Object.keys(ordenesPrueba).map((orderId) => getProgresoOrden(orderId));
    res.json(ordenes);
});

//GET /api/ordenes/:orderId/progreso
//Conteo de prepacks procesados vs total por etapa para una orden especifica
//Author: Adrian Proano Bernal
router.get('/:orderId/progreso', (req: Request<{ orderId: string }>, res: Response) => {
    const progreso = getProgresoOrden(req.params.orderId);
    if (!progreso) {
        return res.status(404).json({ error: 'Orden no encontrada' });
    }
    res.json(progreso);
});

export default router; 