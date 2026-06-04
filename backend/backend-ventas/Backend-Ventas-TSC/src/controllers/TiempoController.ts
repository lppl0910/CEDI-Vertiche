import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

export default class TiempoController extends AbstractController {
  private static _instance: TiempoController;

  public static get instance(): TiempoController {
    return this._instance || (this._instance = new this("tiempo"));
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
    this.router.post("/refresh-fecha",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.refreshFecha.bind(this)
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

  private async getAll(req: Request, res: Response) {
    try {
      const registros = await db.Dim_Tiempo.findAll();
      res.status(200).json(registros);
    } catch (err) {
      this.handleError(res, err, "Error al obtener registros de tiempo");
    }
  }

  private async getById(req: Request, res: Response) {
    try {
      const registro = await db.Dim_Tiempo.findByPk(req.params.id);
      if (!registro) return res.status(404).json({ mensaje: "Registro de tiempo no encontrado" });
      res.status(200).json(registro);
    } catch (err) {
      this.handleError(res, err, "Error al obtener registro de tiempo");
    }
  }

  private async refreshFecha(req: Request, res: Response) {
    try {
      await AbstractController.initFechaBase();
      res.status(200).json({
        mensaje: "fechaBase actualizada correctamente",
        fechaBase: AbstractController.fechaBase,
      });
    } catch (err) {
      this.handleError(res, err, "Error al actualizar fechaBase");
    }
  }

  private async create(req: Request, res: Response) {
    try {
      if (!req.body.id_tiempo || !req.body.fecha) {
        return res.status(400).json({
          mensaje: "Los campos id_tiempo (YYYYMMDD) y fecha son obligatorios",
        });
      }
      const registro = await db.Dim_Tiempo.create(req.body);
      AbstractController.actualizarFechaBase(req.body.fecha as string);
      res.status(201).json({ mensaje: "Registro de tiempo creado exitosamente", data: registro });
    } catch (err) {
      this.handleError(res, err, "Error al crear registro de tiempo");
    }
  }

  private async update(req: Request, res: Response) {
    try {
      const registro = await db.Dim_Tiempo.findByPk(req.params.id);
      if (!registro) return res.status(404).json({ mensaje: "Registro de tiempo no encontrado" });
      await registro.update(req.body);
      if (req.body.fecha) AbstractController.actualizarFechaBase(req.body.fecha as string);
      res.status(200).json({ mensaje: "Registro de tiempo actualizado exitosamente", data: registro });
    } catch (err) {
      this.handleError(res, err, "Error al actualizar registro de tiempo");
    }
  }
}