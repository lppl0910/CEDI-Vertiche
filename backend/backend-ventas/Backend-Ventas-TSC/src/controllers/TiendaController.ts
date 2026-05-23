import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

export default class TiendaController extends AbstractController {
  private static _instance: TiendaController;

  public static get instance(): TiendaController {
    return this._instance || (this._instance = new this("tiendas"));
  }

  protected initRoutes(): void {
    this.router.get("/",        this.getAll.bind(this));
    this.router.get("/:id",     this.getById.bind(this));
    this.router.post("/",       this.create.bind(this));
    this.router.put("/:id",     this.update.bind(this));
  }

  // ── GET /tiendas ─────────────────────────────────────────────────────
  private async getAll(req: Request, res: Response) {
    try {
      const tiendas = await db.Dim_Tienda.findAll();
      res.status(200).json(tiendas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al obtener tiendas", error: err });
    }
  }

  // ── GET /tiendas/:id ─────────────────────────────────────────────────
  private async getById(req: Request, res: Response) {
    try {
      const tienda = await db.Dim_Tienda.findByPk(req.params.id);
      if (!tienda) {
        return res.status(404).json({ mensaje: "Tienda no encontrada" });
      }
      res.status(200).json(tienda);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al obtener tienda", error: err });
    }
  }

  // ── POST /tiendas ────────────────────────────────────────────────────
  private async create(req: Request, res: Response) {
    try {
      const tienda = await db.Dim_Tienda.create(req.body);
      res.status(201).json({ mensaje: "Tienda creada exitosamente", data: tienda });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al crear tienda", error: err });
    }
  }

  // ── PUT /tiendas/:id ─────────────────────────────────────────────────
  private async update(req: Request, res: Response) {
    try {
      const tienda = await db.Dim_Tienda.findByPk(req.params.id);
      if (!tienda) {
        return res.status(404).json({ mensaje: "Tienda no encontrada" });
      }
      await tienda.update(req.body);
      res.status(200).json({ mensaje: "Tienda actualizada exitosamente", data: tienda });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al actualizar tienda", error: err });
    }
  }
}