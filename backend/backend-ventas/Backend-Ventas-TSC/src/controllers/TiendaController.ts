/**
 * Controlador CRUD para la dimensión `Dim_Tienda`.
 *
 * Rutas montadas bajo `/tiendas`:
 *  - `GET  /`      → Lista todas las tiendas.
 *  - `GET  /:id`   → Detalle de una tienda por PK.
 *  - `POST /`      → Crea una nueva tienda.
 *  - `PUT  /:id`   → Actualiza una tienda existente.
 *
 * Todas las rutas requieren token JWT de Supabase válido.
 */
import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

export default class TiendaController extends AbstractController {
  private static _instance: TiendaController;

  /** Singleton: devuelve la única instancia del controlador. */
  public static get instance(): TiendaController {
    return this._instance || (this._instance = new this("tiendas"));
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

  /** GET /tiendas — Devuelve todas las tiendas del catálogo. */
  private async getAll(req: Request, res: Response) {
    try {
      const tiendas = await db.Dim_Tienda.findAll();
      res.status(200).json(tiendas);
    } catch (err) {
      this.handleError(res, err, "Error al obtener tiendas");
    }
  }

  /** GET /tiendas/:id — Detalle de una tienda. Devuelve 404 si no existe. */
  private async getById(req: Request, res: Response) {
    try {
      const tienda = await db.Dim_Tienda.findByPk(req.params.id);
      if (!tienda) return res.status(404).json({ mensaje: "Tienda no encontrada" });
      res.status(200).json(tienda);
    } catch (err) {
      this.handleError(res, err, "Error al obtener tienda");
    }
  }

  /** POST /tiendas — Crea una nueva tienda. */
  private async create(req: Request, res: Response) {
    try {
      const tienda = await db.Dim_Tienda.create(req.body);
      res.status(201).json({ mensaje: "Tienda creada exitosamente", data: tienda });
    } catch (err) {
      this.handleError(res, err, "Error al crear tienda");
    }
  }

  /** PUT /tiendas/:id — Actualiza los campos enviados en el body. Devuelve 404 si no existe. */
  private async update(req: Request, res: Response) {
    try {
      const tienda = await db.Dim_Tienda.findByPk(req.params.id);
      if (!tienda) return res.status(404).json({ mensaje: "Tienda no encontrada" });
      await tienda.update(req.body);
      res.status(200).json({ mensaje: "Tienda actualizada exitosamente", data: tienda });
    } catch (err) {
      this.handleError(res, err, "Error al actualizar tienda");
    }
  }
}