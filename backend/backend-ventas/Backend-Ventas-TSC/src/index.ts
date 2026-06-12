/**
 * Punto de entrada del Backend-Ventas-TSC.
 *
 * La función `bootstrap` inicializa la `fechaBase` (máxima fecha en Dim_Tiempo)
 * antes de levantar el servidor para que todos los cálculos de período relativo
 * (7d, 30d, 90d, 1y) tengan una referencia temporal correcta desde el arranque.
 */
import { PORT, NODE_ENV } from './config';
import Server from './provider/Server';
import express from 'express';
import cors from 'cors';
import AbstractController from './controllers/AbstractController';

import VentasController           from './controllers/VentasController';
import TiendaController           from './controllers/TiendaController';
import ProductoController         from './controllers/ProductoController';
import TiempoController           from './controllers/TiempoController';
import InventarioController        from './controllers/InventarioController';
import TendenciasController        from './controllers/TendenciasController';
import ProductosAnalisisController from './controllers/ProductosAnalisisController';
import TiendasAnalisisController   from './controllers/TiendasAnalisisController';

/**
 * Función de arranque asíncrona del servidor.
 *
 * Primero resuelve la fecha más reciente del data warehouse (`fechaBase`) para
 * usarla como ancla en todos los filtros de período relativo; luego construye y
 * arranca el servidor con los middlewares y controladores registrados.
 */
async function bootstrap() {
  await AbstractController.initFechaBase();

  const server: Server = new Server({
    port: PORT,
    env:  NODE_ENV,
    middlewares: [
      express.json(),
      express.urlencoded({ extended: true }),
      cors(),
    ],
    controllers: [
      VentasController.instance,
      TiendaController.instance,
      ProductoController.instance,
      TiempoController.instance,
      InventarioController.instance,
      TendenciasController.instance,
      ProductosAnalisisController.instance,
      TiendasAnalisisController.instance,
    ],
  });

  server.init();
}

bootstrap();

// Extensión del tipo Request de Express para que TypeScript reconozca
// los campos que AuthMiddleware inyecta tras validar el token de Supabase.
declare global {
  namespace Express {
    interface Request {
      user:  any;    // objeto User devuelto por supabase.auth.getUser()
      token: string; // JWT original extraído del header Authorization
    }
  }
}