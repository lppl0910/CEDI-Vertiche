import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<void> {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.log('[DB] MONGODB_URI no configurado — usando almacenamiento en memoria.');
        return;
    }

    try {
        await mongoose.connect(uri, { dbName: 'vertiche-rfid' });
        isConnected = true;
        console.log('[DB] Conectado a MongoDB correctamente.');
    } catch (err) {
        console.error('[DB] Error conectando a MongoDB:', err);
        console.log('[DB] Continuando con almacenamiento en memoria como fallback.');
    }
}

export function isDBConnected(): boolean {
    return isConnected && mongoose.connection.readyState === 1;
}
