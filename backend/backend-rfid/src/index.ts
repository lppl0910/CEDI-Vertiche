import 'dotenv/config';
import httpServer from './server.js';

const PORT = process.env.PORT ?? 3001;
httpServer.listen(PORT, () => {
    console.log(`Servidor RFID http://localhost:${PORT}`);
});