import {PORT, NODE_ENV} from './config';
import ServerRFID from './provider/Server'
import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import ScanController  from './controllers/ScanController';
import AlertasController from './controllers/AlertasController';
import OrdensController from './controllers/OrdenesController';

const server = new ServerRFID({
    port: PORT,
    env: NODE_ENV,
    middlewares: [
        express.json(),
        express.urlencoded({ extended: true }),
        cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }),
        helmet()
    ],
    controllers: [
        ScanController.instance,
        AlertasController.instance,
        OrdensController.instance
    ]
})

server.init();