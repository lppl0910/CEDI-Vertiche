import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import ordenesRouter from './routes/ordenes';
import alertasRouter from './routes/alertas';
import { procesoEscaneoRFID } from './services/ordenService';
import { type Etapa } from './types/rfid.types';
import { registrarTagDesconocido } from './services/alertasService';

const app = express();
const httpServer = createServer(app);

// Middleware de WebSockets
export const io = new Server(httpServer, {
    cors: { origin: '*' },
});

app.use(cors());
app.use(express.json());

// Definir rutas
app.use('/api/ordenes', ordenesRouter);
app.use('/api/alertas', alertasRouter);

// Endpoint que recibira los escaneos de RFID
app.post('/api/rfid/scan', (req, res) => {
    const { tagId, readerId, etapa } = req.body as{
        tagId: string;
        readerId: string;
        etapa: Etapa;
    };

    const resultado = procesoEscaneoRFID(tagId, readerId, etapa);
    if (!resultado) {
        registrarTagDesconocido(tagId, readerId, etapa);
        return res.status(404).json({ error: 'Prepack no encontrado' });
    }

    //Emitir evento de WebSocket para actualizar el progreso en tiempo real
    io.emit('orden:progreso:actualizado', {
        orderId: resultado.orderId,
        progreso: resultado.progreso
    });

    res.json({ success: true, ...resultado });
});

// Conexiones WebSocket
io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);
    socket.on('disconnect', () => 
        console.log(`Cliente desconectado: ${socket.id}`)
    );
});

export default httpServer;