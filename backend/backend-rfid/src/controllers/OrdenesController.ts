/**
 * Rutas para órdenes RFID.
 * Incluye filtrado y ordenamiento en el backend (#215 — Isaac Calderon Laflor).
 * Author: Adrian Proano Bernal + filtros: Isaac Calderon Laflor
 */

import AbstractController from './AbstractController.js';
import { Router, type Request, type Response } from 'express';
import { getProgresoOrden, getOrdenesConFiltro, getDetallePrepack } from '../services/ordenService.js';

export default class OrdenesController extends AbstractController {
    private static _instance: OrdenesController;

    public static get instance(): OrdenesController {
        return this._instance || (this._instance = new this('api/ordenes'));
    }

    protected initRoutes(): void {
        this.router.get('/', this.apiKeyMiddleware, this.getOrdenes.bind(this));
        this.router.get('/:orderId/progreso', this.apiKeyMiddleware, this.getProgreso.bind(this));
        this.router.get('/:orderId/prepacks/:prepackId', this.apiKeyMiddleware, this.getDetallePrepack.bind(this));
    }

    private getOrdenes(req: Request, res: Response) {
        const { sort, etapa, search, status } = req.query as Record<string, string | undefined>;

        // exactOptionalPropertyTypes: sólo incluir claves que tengan valor definido
        const filtros: Parameters<typeof getOrdenesConFiltro>[0] = {};
        if (sort)   filtros.sort   = sort;
        if (etapa)  filtros.etapa  = etapa;
        if (search) filtros.search = search;
        if (status) filtros.status = status;

        const ordenes = getOrdenesConFiltro(filtros);
        res.json(ordenes);
    }

    private getProgreso(req: Request<{ orderId: string }>, res: Response) {
        const progreso = getProgresoOrden(req.params.orderId);
        if (!progreso) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }
        res.json(progreso);
    }

    private async getDetallePrepack(req: Request<{ orderId: string; prepackId: string }>, res: Response) {
        try {
            const { orderId, prepackId } = req.params;
            const detalle = await getDetallePrepack(orderId, prepackId);
            if (!detalle) {
                return res.status(404).json({ error: 'Prepack no encontrado' });
            }
            res.json(detalle);
        } 
        catch (error) {
            res.status(500).json({ error: 'Error al obtener el detalle del prepack' });
        }
    }
}

// const router = Router();

// /**
//  * GET /api/ordenes
//  * Soporta query params para filtrado y ordenamiento optimizado (#215):
//  *   ?sort=id-asc | id-desc | arrival-asc | arrival-desc | adv-desc | adv-asc
//  *   ?etapa=Preregistro | QA | Registro | Sorter | Bahias | Auditoria | Envio
//  *   ?search=ORD-001  (busca por orderId)
//  *   ?status=active | completed
//  * Author: Adrian Proano Bernal
//  */
// router.get('/', (req: Request, res: Response) => {
//     const { sort, etapa, search, status } = req.query as Record<string, string | undefined>;

//     // exactOptionalPropertyTypes: sólo incluir claves que tengan valor definido
//     const filtros: Parameters<typeof getOrdenesConFiltro>[0] = {};
//     if (sort)   filtros.sort   = sort;
//     if (etapa)  filtros.etapa  = etapa;
//     if (search) filtros.search = search;
//     if (status) filtros.status = status;

//     const ordenes = getOrdenesConFiltro(filtros);
//     res.json(ordenes);
// });

// /**
//  * GET /api/ordenes/:orderId/progreso
//  * Conteo de prepacks procesados vs total por etapa para una orden específica.
//  * Author: Adrian Proano Bernal
//  */
// router.get('/:orderId/progreso', (req: Request<{ orderId: string }>, res: Response) => {
//     const progreso = getProgresoOrden(req.params.orderId);
//     if (!progreso) {
//         return res.status(404).json({ error: 'Orden no encontrada' });
//     }
//     res.json(progreso);
// });

// router.get('/:orderId/prepacks/:prepackId', async (req: Request<{ orderId: string; prepackId: string }>, res: Response) => {
//     try {
//         const { orderId, prepackId } = req.params;
//         const detalle = await getDetallePrepack(orderId, prepackId);
//         if (!detalle) {
//             return res.status(404).json({ error: 'Prepack no encontrado' });
//         }
//         res.json(detalle);
//     } 
//     catch (error) {
//         res.status(500).json({ error: 'Error al obtener el detalle del prepack' });
//     }
// });

// export default router;
