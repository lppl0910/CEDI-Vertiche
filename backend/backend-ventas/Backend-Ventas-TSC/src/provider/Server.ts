import express,{Response,Request} from 'express';
import AbstractController from '../controllers/AbstractController';
import db from '../models'


class Server{

        // Atributos
        private app: express.Application; // Privacidad nombre tipo y variable
        private port: number;
        private env:string;

        // Metodos constructor
        constructor(appInit:{port:number ; env:string ; middlewares:any[] ; controllers:AbstractController[]}){
            this.app = express();
            this.port = appInit.port;
            this.env =  appInit.env;
            // Middlewares antes que los controllers
            this.initMiddlewares(appInit.middlewares);
            this.initControllers(appInit.controllers);
            this.connectDB();

        }
        // Metodos
        private initMiddlewares(middlewares:any[]):void{
            middlewares.forEach(middleware =>{
                this.app.use(middleware);
            })
        }

        private initControllers(controllers:AbstractController[]):void{
            // Ruta de chequeo del servidor que funcione
            this.app.get('/',(req:Request,res:Response)=>{
                res.send('Server is OK');
            });
            controllers.forEach(controller =>{
                this.app.use("/"+controller.prefix,controller.router);
            });
        }

        private async connectDB(){
            try{
                await db.sequelize.sync({force:false});
                
            } catch(err){
                console.log(err);
            }
        }

        public init():void{{
            this.app.listen(this.port,()=>{
                console.log(`Server running on port ${this.port} in ${this.env} mode`)
            })
        }}

        

}

export default Server;