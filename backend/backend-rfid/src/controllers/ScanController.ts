import { z } from 'zod';
import AbstractController from './AbstractController';
import { type Etapa } from '../types/rfid.types';
import { rateLimit } from 'express-rate-limit';
import { procesoEscaneoRFID, procesarEnvioCaja, registrarFallaPrepack, getDetallePrepack } from '../services/ordenService.js';

const scanRFIDSchema = z.discriminatedUnion('etapa', [
  z.object({
    tagId:    z.string(),
    readerId: z.string(),
    etapa:    z.enum(['Preregistro', 'QA', 'Registro', 'Sorter', 'Bahias', 'Auditoria']),
  }),
  z.object({
    tagId:    z.string().optional(),
    readerId: z.string(),
    etapa:    z.literal('Envio'),
  }),
]);

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 500,            // máximo 500 requests por minuto por IP
    message: { error: 'Demasiadas peticiones, intenta más tarde' }
}); 

class ScanController extends AbstractController {
    private static _instance: ScanController;

    public static get instance(): ScanController {
        return this._instance || (this._instance = new this('api/rfid'));
    }

    protected initRoutes(): void {
        this.router.use(limiter); // Aplicar limitador a todas las rutas de este controlador
        this.router.post('/scan', this.apiKeyMiddleware, this.scanRFID.bind(this));
        this.router.post('/falla', this.apiKeyMiddleware, this.fallaRFID.bind(this));
    }

    private async scanRFID(req: any, res: any) {
        const result = scanRFIDSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: 'Datos de escaneo inválidos', details: result.error.issues });
        }
        const { tagId, readerId, etapa } = result.data;
        
        if (etapa === 'Envio') {
            const resultados = await procesarEnvioCaja(readerId);
            for (const resultado of resultados) {
                this.io.emit('orden:progreso:actualizado', {
                    orderId: resultado.orderId,
                    progreso: resultado.progreso
                });
            }
            return res.json({ success: true, enviados: resultados.length });
        }
        const resultado = await procesoEscaneoRFID(tagId, readerId, etapa);
        if (!resultado) {
            return res.status(404).json({ error: 'Prepack no encontrado' });
        }
    
        //Emitir evento de WebSocket para actualizar el progreso en tiempo real
        this.io.emit('orden:progreso:actualizado', {
            orderId: resultado.orderId,
            progreso: resultado.progreso
        });
    
        if (etapa === 'Sorter' || etapa === 'Bahias') {
            const detalle = await getDetallePrepack(resultado.orderId, tagId);
            const pkgData = {
                id: tagId,
                estado: etapa === 'Sorter' ? 'ENTRADA_SORTER' : 'LLEGADA_BAHIA',
                isError: resultado.prepack.hasFalla || false,
                detallesRuta: {
                    tiendaDestino: detalle ? detalle.id_tienda : 1,
                    bahiaDestino: detalle ? detalle.prepack.bahia_asignada : (Math.floor(Math.random() * 3) + 1),
                },
                detallesContenido: {
                    articulo: detalle ? detalle.prepack.modelo : 'Prepack Generico',
                    cantidad: detalle ? detalle.prepack.cantidad_total : 10
                }
            };
            // Emitimos al frontend de sorter
            this.io.emit('sorter:evento', pkgData);
        }
        res.json({ success: true, ...resultado });
    }

    private fallaRFID(req: any, res: any) {
        const { tagId, etapa } = req.body as { tagId: string; etapa: Etapa };
    
        const resultado = registrarFallaPrepack(tagId, etapa);
        if (!resultado) {
            return res.status(404).json({ error: 'Prepack no encontrado' });
        }
    
        // Notificar al frontend para que actualice el stage afectado
        this.io.emit('orden:progreso:actualizado', {
            orderId: resultado.orderId,
            progreso: resultado.progreso,
        });
    
        res.json({ success: true });
    }
}

export default ScanController;

