import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

export default class InventarioController extends AbstractController {
  private static _instance: InventarioController;

  public static get instance(): InventarioController {
    return this._instance || (this._instance = new this("inventario"));
  }

  protected initRoutes(): void {
    this.router.get("/",        this.getAll.bind(this));
    this.router.get("/:id",     this.getById.bind(this));
    this.router.post("/",       this.create.bind(this));
    this.router.put("/:id",     this.update.bind(this));
  }

  // ── GET /inventario ──────────────────────────────────────────────────
  private async getAll(req: Request, res: Response) {
    try {
      const inventario = await db.Fact_Inventario_Tienda.findAll({
        include: [
          { model: db.Dim_Producto },
          { model: db.Dim_Tienda },
          { model: db.Dim_Tiempo },
        ],
      });
      res.status(200).json(inventario);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al obtener inventario", error: err });
    }
  }

  // ── GET /inventario/:id ──────────────────────────────────────────────
  private async getById(req: Request, res: Response) {
    try {
      const registro = await db.Fact_Inventario_Tienda.findByPk(req.params.id, {
        include: [
          { model: db.Dim_Producto },
          { model: db.Dim_Tienda },
          { model: db.Dim_Tiempo },
        ],
      });
      if (!registro) {
        return res.status(404).json({ mensaje: "Registro de inventario no encontrado" });
      }
      res.status(200).json(registro);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al obtener registro de inventario", error: err });
    }
  }

  // ── POST /inventario ─────────────────────────────────────────────────
  private async create(req: Request, res: Response) {
    try {
      const registro = await db.Fact_Inventario_Tienda.create(req.body);
      res.status(201).json({ mensaje: "Registro de inventario creado exitosamente", data: registro });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al crear registro de inventario", error: err });
    }
  }

  // ── PUT /inventario/:id ──────────────────────────────────────────────
  private async update(req: Request, res: Response) {
    try {
      const registro = await db.Fact_Inventario_Tienda.findByPk(req.params.id);
      if (!registro) {
        return res.status(404).json({ mensaje: "Registro de inventario no encontrado" });
      }
      await registro.update(req.body);
      res.status(200).json({ mensaje: "Inventario actualizado exitosamente", data: registro });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al actualizar inventario", error: err });
    }
  }
}