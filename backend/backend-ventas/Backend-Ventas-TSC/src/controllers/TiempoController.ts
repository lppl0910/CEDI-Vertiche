import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

export default class TiempoController extends AbstractController {
  private static _instance: TiempoController;

  public static get instance(): TiempoController {
    return this._instance || (this._instance = new this("tiempo"));
  }

  protected initRoutes(): void {
    this.router.get("/",        this.getAll.bind(this));
    this.router.get("/:id",     this.getById.bind(this));
    this.router.post("/",       this.create.bind(this));
    this.router.put("/:id",     this.update.bind(this));
  }

  // ── GET /tiempo ──────────────────────────────────────────────────────
  private async getAll(req: Request, res: Response) {
    try {
      const registros = await db.Dim_Tiempo.findAll();
      res.status(200).json(registros);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al obtener registros de tiempo", error: err });
    }
  }

  // ── GET /tiempo/:id ──────────────────────────────────────────────────
  private async getById(req: Request, res: Response) {
    try {
      const registro = await db.Dim_Tiempo.findByPk(req.params.id);
      if (!registro) {
        return res.status(404).json({ mensaje: "Registro de tiempo no encontrado" });
      }
      res.status(200).json(registro);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al obtener registro de tiempo", error: err });
    }
  }

  // ── POST /tiempo ─────────────────────────────────────────────────────
  private async create(req: Request, res: Response) {
    try {
      const registro = await db.Dim_Tiempo.create(req.body);
      res.status(201).json({ mensaje: "Registro de tiempo creado exitosamente", data: registro });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al crear registro de tiempo", error: err });
    }
  }

  // ── PUT /tiempo/:id ──────────────────────────────────────────────────
  private async update(req: Request, res: Response) {
    try {
      const registro = await db.Dim_Tiempo.findByPk(req.params.id);
      if (!registro) {
        return res.status(404).json({ mensaje: "Registro de tiempo no encontrado" });
      }
      await registro.update(req.body);
      res.status(200).json({ mensaje: "Registro de tiempo actualizado exitosamente", data: registro });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al actualizar registro de tiempo", error: err });
    }
  }
}