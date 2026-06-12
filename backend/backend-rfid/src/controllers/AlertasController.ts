import AbstractController from './AbstractController';
import { agregarOActualizarAlerta, obtenerHistorialAlertas } from '../data/alertasData';
import type { Alerta } from '../types/alertas.types';

export default class AlertasController extends AbstractController {
    private static _instance: AlertasController;

    public static get instance(): AlertasController {
        return this._instance || (this._instance = new this('api/alertas'));
    }

    protected initRoutes(): void {
        this.router.get('/', this.apiKeyMiddleware ,this.getAlertas.bind(this));
        this.router.post('/', this.apiKeyMiddleware, this.postAlertas.bind(this));
    }

    private async getAlertas(req: any, res: any) {
        try {
            const alertas = await obtenerHistorialAlertas();
            res.json(alertas);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener las alertas' });
        }
    }

    private async postAlertas(req: any, res: any) {
        try {
            const payload = req.body;
            const alertas: Alerta[] = Array.isArray(payload) ? payload : [payload];
            await Promise.all(alertas.map(alerta => agregarOActualizarAlerta(alerta)));
            res.json({ success: true, message: `${alertas.length} alertas procesadas.` });
        } catch (error) {
            res.status(500).json({ error: 'Error al procesar las alertas' });
        }
    }
}

//const router = Router();

// GET /api/alertas — Obtener todas las alertas (MongoDB si está disponible, memoria si no)
// router.get('/', async (req, res) => {
//     try {
//         const alertas = await obtenerHistorialAlertas();
//         res.json(alertas);
//     } catch (error) {
//         res.status(500).json({ error: 'Error al obtener las alertas' });
//     }
// });

// // POST /api/alertas — Guardar o actualizar alertas (array o una sola)
// router.post('/', async (req, res) => {
//     try {
//         const payload = req.body;
//         const alertas: Alerta[] = Array.isArray(payload) ? payload : [payload];
//         await Promise.all(alertas.map(alerta => agregarOActualizarAlerta(alerta)));
//         res.json({ success: true, message: `${alertas.length} alertas procesadas.` });
//     } catch (error) {
//         res.status(500).json({ error: 'Error al procesar las alertas' });
//     }
// });

// export default router;
