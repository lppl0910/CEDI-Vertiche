import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import ordenesRouter from './routes/ordenes.js';
import alertasRouter from './routes/alertas.js';
import { procesoEscaneoRFID, registrarFallaPrepack, getDetallePrepack } from './services/ordenService.js';
import { type Etapa } from './types/rfid.types.js';
import { connectDB } from './config/database.js';
import { inicializarOrdenesDesdeDB } from './data/generacionDatosEnMemoria.js';
import { apiKeyMiddleware } from './middleware/apiKey.js';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';


//Por ahora, esta validacion de escaneos no es tan restrictiva
//TODO: Revisar si es necesario agregar mas campos o validaciones (ej: formato de tagId, readerId, etc.)
const scanRFIDSchema = z.object({
    tagId: z.string(),
    readerId: z.string(),
    etapa: z.enum(['Preregistro', 'QA', 'Registro', 'Sorter', 'Bahias', 'Auditoria', 'Envio']),
});

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 100,            // máximo 100 requests por minuto por IP
    message: { error: 'Demasiadas peticiones, intenta más tarde' }
});

// Intentar conectar a MongoDB (si MONGODB_URI está en .env)
await connectDB().then(() => console.log('Conexión a MongoDB establecida'))
    .catch(err => console.error('Error conectando a MongoDB:', err));

await inicializarOrdenesDesdeDB().then(() => console.log('Órdenes cargadas desde DB a memoria'))
    .catch(err => console.error('Error cargando órdenes desde DB:', err));

const app = express();
const httpServer = createServer(app);

// Middleware de WebSockets
export const io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' },
});

const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim())
    : ['http://localhost:5173'];

app.use(helmet());
app.use(cors(
    { origin: allowedOrigins }
));
app.use(express.json());
app.use(limiter); // Aplicar limitador de velocidad a todas las rutas

// Definir rutas
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use('/api/ordenes', apiKeyMiddleware, ordenesRouter);
app.use('/api/alertas', apiKeyMiddleware, alertasRouter);
app.use('/api/rfid/scan', apiKeyMiddleware);
app.use('/api/rfid/falla', apiKeyMiddleware);

// Endpoint que recibira los escaneos de RFID
app.post('/api/rfid/scan', async (req, res) => {

    const validacion = scanRFIDSchema.safeParse(req.body);
    if (!validacion.success) {
        return res.status(400).json({ error: 'Datos de escaneo inválidos', details: validacion.error.issues });
    }

    const { tagId, readerId, etapa } = validacion.data;

    const resultado = await procesoEscaneoRFID(tagId, readerId, etapa);
    if (!resultado) {
        return res.status(404).json({ error: 'Prepack no encontrado' });
    }

    //Emitir evento de WebSocket para actualizar el progreso en tiempo real
    io.emit('orden:progreso:actualizado', {
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
        io.emit('sorter:evento', pkgData);
    }

    res.json({ success: true, ...resultado });
});

// Endpoint para registrar errores de lectura RFID (fallas en sorter, QA, etc.)
app.post('/api/rfid/falla', (req, res) => {
    const { tagId, etapa } = req.body as { tagId: string; etapa: Etapa };

    const resultado = registrarFallaPrepack(tagId, etapa);
    if (!resultado) {
        return res.status(404).json({ error: 'Prepack no encontrado' });
    }

    // Notificar al frontend para que actualice el stage afectado
    io.emit('orden:progreso:actualizado', {
        orderId: resultado.orderId,
        progreso: resultado.progreso,
    });

    res.json({ success: true });
});

// Conexiones WebSocket
io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);
    socket.on('disconnect', () =>
        console.log(`Cliente desconectado: ${socket.id}`)
    );
});

export default httpServer;