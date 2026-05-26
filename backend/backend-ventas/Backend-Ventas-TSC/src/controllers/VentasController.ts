import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

export default class VentasController extends AbstractController {
  private static _instance: VentasController;

  public static get instance(): VentasController {
    return this._instance || (this._instance = new this("ventas"));
  }

  protected initRoutes(): void {
    this.router.get("/",    this.getAll.bind(this));
    this.router.get("/:id", this.getById.bind(this));
    this.router.post("/",   this.create.bind(this));
    this.router.put("/:id", this.update.bind(this));
  }

  // ── GET /ventas ──────────────────────────────────────────────────────
  private async getAll(req: Request, res: Response) {
    try {
      const ventas = await db.Fact_Ventas.findAll({
        include: [
          { model: db.Dim_Producto },
          { model: db.Dim_Tienda },
          { model: db.Dim_Tiempo },
        ],
      });
      res.status(200).json(ventas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al obtener ventas", error: err });
    }
  }

  // ── GET /ventas/:id ──────────────────────────────────────────────────
  private async getById(req: Request, res: Response) {
    try {
      const venta = await db.Fact_Ventas.findByPk(req.params.id, {
        include: [
          { model: db.Dim_Producto },
          { model: db.Dim_Tienda },
          { model: db.Dim_Tiempo },
        ],
      });
      if (!venta) {
        return res.status(404).json({ mensaje: "Venta no encontrada" });
      }
      res.status(200).json(venta);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al obtener venta", error: err });
    }
  }

  // ── POST /ventas ─────────────────────────────────────────────────────
  private async create(req: Request, res: Response) {
    try {
      const venta = await db.Fact_Ventas.create(req.body);
      res.status(201).json({ mensaje: "Venta creada exitosamente", data: venta });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al crear venta", error: err });
    }
  }

  // ── PUT /ventas/:id ──────────────────────────────────────────────────
  private async update(req: Request, res: Response) {
    try {
      const venta = await db.Fact_Ventas.findByPk(req.params.id);
      if (!venta) {
        return res.status(404).json({ mensaje: "Venta no encontrada" });
      }
      await venta.update(req.body);
      res.status(200).json({ mensaje: "Venta actualizada exitosamente", data: venta });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al actualizar venta", error: err });
    }
  }
}