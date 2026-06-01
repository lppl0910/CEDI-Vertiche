import type { Request, Response, NextFunction } from 'express';

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
    const key = req.headers['x-api-key'];
    if (key !== process.env.API_KEY) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    next();
}