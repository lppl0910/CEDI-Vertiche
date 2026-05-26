import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";

export default class ProductoController extends AbstractController {
  private static _instance: ProductoController;

  public static get instance(): ProductoController {
    return this._instance || (this._instance = new this("productos"));
  }

  protected initRoutes(): void {
    this.router.get("/",        this.getAll.bind(this));
    this.router.get("/:id",     this.getById.bind(this));
    this.router.post("/",       this.create.bind(this));
    this.router.put("/:id",     this.update.bind(this));
  }

  // ── GET /productos ───────────────────────────────────────────────────
  private async getAll(req: Request, res: Response) {
    try {
      const productos = await db.Dim_Producto.findAll();
      res.status(200).json(productos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al obtener productos", error: err });
    }
  }

  // ── GET /productos/:id ───────────────────────────────────────────────
  private async getById(req: Request, res: Response) {
    try {
      const producto = await db.Dim_Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ mensaje: "Producto no encontrado" });
      }
      res.status(200).json(producto);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al obtener producto", error: err });
    }
  }

  // ── POST /productos ──────────────────────────────────────────────────
  private async create(req: Request, res: Response) {
    try {
      const producto = await db.Dim_Producto.create(req.body);
      res.status(201).json({ mensaje: "Producto creado exitosamente", data: producto });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al crear producto", error: err });
    }
  }

  // ── PUT /productos/:id ───────────────────────────────────────────────
  private async update(req: Request, res: Response) {
    try {
      const producto = await db.Dim_Producto.findByPk(req.params.id);
      if (!producto) {
        return res.status(404).json({ mensaje: "Producto no encontrado" });
      }
      await producto.update(req.body);
      res.status(200).json({ mensaje: "Producto actualizado exitosamente", data: producto });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: "Error al actualizar producto", error: err });
    }
  }
}