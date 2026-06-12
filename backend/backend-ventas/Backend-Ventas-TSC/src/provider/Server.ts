/**
 * Clase Server: envuelve la aplicación Express y orquesta su inicialización.
 *
 * Responsabilidades:
 *  - Registrar middlewares globales (CORS, JSON parser, etc.).
 *  - Montar los routers de cada controlador bajo su prefijo de ruta.
 *  - Sincronizar los modelos de Sequelize con la base de datos.
 *  - Arrancar el servidor HTTP en el puerto configurado.
 */
import express, { Response, Request } from 'express';
import AbstractController from '../controllers/AbstractController';
import db from '../models';

class Server {

  private app:  express.Application;
  private port: number;
  private env:  string;

  /**
   * Construye y configura el servidor.
   *
   * @param appInit - Opciones de inicialización:
   *   - `port`        Puerto en que escuchará el servidor.
   *   - `env`         Entorno de ejecución (`development` | `production`).
   *   - `middlewares` Lista de middlewares de Express a aplicar globalmente.
   *   - `controllers` Lista de controladores cuyas rutas se montarán.
   */
  constructor(appInit: { port: number; env: string; middlewares: any[]; controllers: AbstractController[] }) {
    this.app  = express();
    this.port = appInit.port;
    this.env  = appInit.env;
    // Los middlewares deben registrarse antes que los controladores
    this.initMiddlewares(appInit.middlewares);
    this.initControllers(appInit.controllers);
    this.connectDB();
  }

  /**
   * Registra los middlewares globales en la aplicación Express.
   *
   * @param middlewares - Array de middlewares de Express (e.g. `express.json()`, `cors()`).
   */
  private initMiddlewares(middlewares: any[]): void {
    middlewares.forEach(middleware => {
      this.app.use(middleware);
    });
  }

  /**
   * Monta cada controlador bajo su prefijo de ruta (`/<prefix>`).
   * Registra una ruta GET `/` de health-check antes de los controladores.
   *
   * @param controllers - Instancias de controladores a registrar.
   */
  private initControllers(controllers: AbstractController[]): void {
    this.app.get('/', (req: Request, res: Response) => {
      res.send('Server is OK');
    });
    controllers.forEach(controller => {
      this.app.use('/' + controller.prefix, controller.router);
    });
  }

  /**
   * Sincroniza los modelos de Sequelize con la base de datos.
   * `force: false` preserva las tablas existentes (no las recrea).
   */
  private async connectDB(): Promise<void> {
    try {
      await db.sequelize.sync({ force: false });
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Arranca el servidor HTTP y comienza a escuchar peticiones.
   */
  public init(): void {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port} in ${this.env} mode`);
    });
  }
}

export default Server;