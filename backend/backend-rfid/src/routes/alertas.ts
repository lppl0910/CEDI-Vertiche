import { Router } from 'express';
import { agregarOActualizarAlerta, obtenerHistorialAlertas } from '../data/alertasData';
import type { Alerta } from '../types/alertas.types';

const router = Router();

// Obtener todas las alertas
router.get('/', (req, res) => {
    try {
        const alertas = obtenerHistorialAlertas();
        res.json(alertas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las alertas' });
    }
});

// Guardar o actualizar alertas (puede recibir una sola o un array)
router.post('/', (req, res) => {
    try {
        const payload = req.body;
        
        const alertas: Alerta[] = Array.isArray(payload) ? payload : [payload];
        
        alertas.forEach(alerta => {
            agregarOActualizarAlerta(alerta);
        });

        res.json({ success: true, message: `${alertas.length} alertas procesadas.` });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar las alertas' });
    }
});

export default router;
