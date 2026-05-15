/*
    Este archivo define los tipos de datos relacionados con las alertas del sistema.
    Author: Asistente
*/

export interface Alerta {
    id: string;
    ppId: string;
    orderId: string;
    stage: string;
    desc: string;
    status: 'open' | 'escalated' | 'resolved';
    causa: string;
    ts: number | null;
    resolvedAt: number | null;
}
