import {PORT,NODE_ENV} from './config';
import Server from './provider/Server';
import express from 'express';
import cors from 'cors';

import VentasController from './controllers/VentasController';

const server:Server = new Server ({
    port:PORT,
    env:NODE_ENV,
    middlewares:[
        express.json(),
        express.urlencoded({extended:true}),
        cors()
    ],
    controllers:[
        VentasController.instance
        
    ]
})

server.init();