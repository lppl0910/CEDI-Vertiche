import {PORT,NODE_ENV} from './config';
import Server from './provider/Server';
import express from 'express';
import cors from 'cors';

import VentasController from './controllers/VentasController';
import TiendaController from './controllers/TiendaController';
import ProductoController from './controllers/ProductoController';
import TiempoController from './controllers/TiempoController';
import InventarioController from './controllers/InventarioController';

const server:Server = new Server ({
    port:PORT,
    env:NODE_ENV,
    middlewares:[
        express.json(),
        express.urlencoded({extended:true}),
        cors()
    ],
    controllers: [
    VentasController.instance,      
    TiendaController.instance,      
    ProductoController.instance,    
    TiempoController.instance,      
    InventarioController.instance,  
]
})

server.init();