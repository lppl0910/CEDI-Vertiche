import { PORT, NODE_ENV } from './config';
import Server from './provider/Server';
import express from 'express';
import cors from 'cors';
import AbstractController from './controllers/AbstractController';

import VentasController from './controllers/VentasController';
import TiendaController from './controllers/TiendaController';
import ProductoController from './controllers/ProductoController';
import TiempoController from './controllers/TiempoController';
import InventarioController from './controllers/InventarioController';
import TendenciasController from './controllers/TendenciasController';
import ProductosAnalisisController from './controllers/ProductosAnalisisController';
import TiendasAnalisisController from './controllers/TiendasAnalisisController';

async function bootstrap() {
  // Inicializar fechaBase desde el MAX(fecha) de Dim_Tiempo
  await AbstractController.initFechaBase();

  const server: Server = new Server({
    port: PORT,
    env: NODE_ENV,
    middlewares: [
      express.json(),
      express.urlencoded({ extended: true }),
      cors()
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
    ]
  });

  server.init();
}

bootstrap();