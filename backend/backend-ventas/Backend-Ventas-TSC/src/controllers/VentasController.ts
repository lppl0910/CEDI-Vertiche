/**
 * Controlador CRUD para la tabla de hechos `Fact_Ventas`.
 *
 * Rutas montadas bajo `/ventas`:
 *  - `GET  /`      → Lista paginada de ventas con sus dimensiones asociadas.
 *  - `GET  /:id`   → Detalle de una venta por PK.
 *  - `POST /`      → Crea una nueva venta.
 *  - `PUT  /:id`   → Actualiza campos de una venta existente.
 *
 * Todas las rutas requieren token JWT de Supabase válido.
 */
import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

export default class VentasController extends AbstractController {
  private static _instance: VentasController;

  /** Singleton: devuelve la única instancia del controlador. */
  public static get instance(): VentasController {
    return this._instance || (this._instance = new this("ventas"));
  }

  protected initRoutes(): void {
    this.router.get("/",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.getAll.bind(this)
    );
    this.router.get("/:id",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.getById.bind(this)
    );
    this.router.post("/",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.create.bind(this)
    );
    this.router.put("/:id",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.update.bind(this)
    );
  }

  /**
   * GET /ventas — Lista paginada de ventas incluyendo producto, tienda y fecha.
   * @query page  Número de página (default 1).
   * @query limit Registros por página (default 50).
   */
  private async getAll(req: Request, res: Response) {
    try {
      const page  = parseInt(req.query.page  as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const { count, rows } = await db.Fact_Ventas.findAndCountAll({
        limit,
        offset: (page - 1) * limit,
        include: [
          { model: db.Dim_Producto },
          { model: db.Dim_Tienda },
          { model: db.Dim_Tiempo },
        ],
      });
      res.status(200).json({
        total: count, pagina: page, limite: limit,
        paginas: Math.ceil(count / limit), data: rows,
      });
    } catch (err) {
      this.handleError(res, err, "Error al obtener ventas");
    }
  }

  /** GET /ventas/:id — Detalle de una venta con sus dimensiones. Devuelve 404 si no existe. */
  private async getById(req: Request, res: Response) {
    try {
      const venta = await db.Fact_Ventas.findByPk(req.params.id, {
        include: [{ model: db.Dim_Producto }, { model: db.Dim_Tienda }, { model: db.Dim_Tiempo }],
      });
      if (!venta) return res.status(404).json({ mensaje: "Venta no encontrada" });
      res.status(200).json(venta);
    } catch (err) {
      this.handleError(res, err, "Error al obtener venta");
    }
  }

  /** POST /ventas — Crea una nueva venta a partir del body del request. */
  private async create(req: Request, res: Response) {
    try {
      const venta = await db.Fact_Ventas.create(req.body);
      res.status(201).json({ mensaje: "Venta creada exitosamente", data: venta });
    } catch (err) {
      this.handleError(res, err, "Error al crear venta");
    }
  }

  /** PUT /ventas/:id — Actualiza los campos enviados en el body. Devuelve 404 si no existe. */
  private async update(req: Request, res: Response) {
    try {
      const venta = await db.Fact_Ventas.findByPk(req.params.id);
      if (!venta) return res.status(404).json({ mensaje: "Venta no encontrada" });
      await venta.update(req.body);
      res.status(200).json({ mensaje: "Venta actualizada exitosamente", data: venta });
    } catch (err) {
      this.handleError(res, err, "Error al actualizar venta");
    }
  }
}