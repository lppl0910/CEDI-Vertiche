/**
 * Clase base abstracta para todos los controladores de la API de ventas.
 *
 * Provee:
 *  - Un Router de Express y el prefijo de ruta de cada subclase.
 *  - La referencia al `AuthMiddleware` (Singleton) lista antes de que
 *    `initRoutes()` registre las rutas protegidas.
 *  - `fechaBase`: fecha máxima en `Dim_Tiempo`, usada como ancla para calcular
 *    períodos relativos (7d, 30d, 90d, 1y) desde el dato más reciente del DW.
 *  - `buildWhere()`: construye los objetos `where` de Sequelize a partir de los
 *    query params estándar (`zona`, `temporada`, `period`).
 *  - `handleError()`: responde 500 y registra el error en consola.
 *
 * Cada controlador concreto solo necesita implementar `initRoutes()`.
 */
import { Router, Request, Response } from "express";
import db from "../models";
import AuthMiddleware from "../middlewares/authorization";
const { fn, col } = require("sequelize");

/** Mapa de código de período → número de días para filtros de tiempo relativo. */
const diasMap: Record<string, number> = {
  "7d":  7,
  "30d": 30,
  "90d": 90,
  "1y":  365,
};

export default abstract class AbstractController {

  /**
   * Fecha más reciente en `Dim_Tiempo`, en formato ISO `YYYY-MM-DD`.
   * Actúa como "hoy" para todos los filtros de período relativo.
   * Se inicializa con un fallback y se actualiza al arrancar el servidor.
   */
  protected static fechaBase: string = "2025-12-31";

  private _router: Router;
  private _prefix: string;

  /** Instancia del middleware de autenticación Supabase. */
  protected authMiddleware!: AuthMiddleware;

  /** Router de Express con las rutas registradas por `initRoutes()`. */
  public get router(): Router {
    return this._router;
  }

  /** Segmento de URL bajo el cual se monta este controlador (e.g. `"ventas"`). */
  public get prefix(): string {
    return this._prefix;
  }

  /**
   * @param _prefix - Segmento de ruta base para este controlador.
   */
  protected constructor(_prefix: string) {
    this._router = Router();
    this._prefix = _prefix;
    // authMiddleware debe asignarse ANTES de initRoutes porque initRoutes
    // registra this.authMiddleware.verifyToken como middleware de ruta.
    this.authMiddleware = AuthMiddleware.instance;
    this.initRoutes();
  }

  /** Cada controlador registra sus rutas aquí. Se llama en el constructor. */
  protected abstract initRoutes(): void;

  /**
   * Consulta `Dim_Tiempo` para obtener la fecha máxima y la almacena en `fechaBase`.
   * Se llama una vez al arrancar el servidor (ver `bootstrap()` en `index.ts`).
   */
  public static async initFechaBase(): Promise<void> {
    try {
      const result = await db.Dim_Tiempo.findOne({
        attributes: [[fn("MAX", col("fecha")), "maxFecha"]],
        raw: true,
      });
      const max = (result as any)?.maxFecha;
      if (max) {
        AbstractController.fechaBase = new Date(max).toISOString().split("T")[0]!;
        console.log(`📅 fechaBase inicializada: ${AbstractController.fechaBase}`);
      }
    } catch (err) {
      console.warn("⚠️  No se pudo inicializar fechaBase, usando fallback:", AbstractController.fechaBase);
    }
  }

  /**
   * Avanza `fechaBase` si la fecha recibida es posterior a la actual.
   * Se llama desde `TiempoController` cuando se crea o actualiza un registro.
   *
   * @param nuevaFecha - Fecha en formato `YYYY-MM-DD` a comparar.
   */
  public static actualizarFechaBase(nuevaFecha: string): void {
    if (nuevaFecha && nuevaFecha > AbstractController.fechaBase) {
      AbstractController.fechaBase = nuevaFecha;
      console.log(`📅 fechaBase actualizada: ${AbstractController.fechaBase}`);
    }
  }

  /**
   * Construye los filtros Sequelize comunes a partir de los query params del request.
   *
   * Query params soportados:
   *  - `zona`      (`"Norte"` | `"Sur"` | `"all"`) → filtra `Dim_Tienda.region`.
   *  - `temporada` (e.g. `"Primavera"` | `"all"`)  → filtra `Dim_Producto.temporada`.
   *  - `period`    (`"7d"` | `"30d"` | `"90d"` | `"1y"`) → ventana temporal relativa.
   *
   * @param req - Request de Express con los query params.
   * @returns Objeto con los where parciales y el número de días del período.
   */
  protected buildWhere(req: Request) {
    const zona      = req.query.zona      as string | undefined;
    const temporada = req.query.temporada as string | undefined;
    const period    = (req.query.period   as string) || "30d";
    const dias      = diasMap[period] ?? 30;

    const tiendaWhere   = zona      && zona      !== "all" ? { region: zona as string }        : undefined;
    const productoWhere = temporada && temporada !== "all" ? { temporada: temporada as string } : undefined;

    const { literal } = require("sequelize");
    /** Devuelve un literal Sequelize para filtrar fechas desde `fechaBase - d días`. */
    const tiempoWhere = (d: number) =>
      literal(`Dim_Tiempo.fecha >= DATE_SUB('${AbstractController.fechaBase}', INTERVAL ${d} DAY)`) as any;

    return { tiendaWhere, productoWhere, tiempoWhere, dias, period };
  }

  /**
   * Registra el error en consola y responde con HTTP 500.
   *
   * @param res     - Response de Express.
   * @param err     - Error capturado en el bloque catch.
   * @param mensaje - Mensaje descriptivo para el cliente.
   */
  protected handleError(res: Response, err: unknown, mensaje: string): void {
    console.error(err);
    res.status(500).json({ mensaje, error: err });
  }
}