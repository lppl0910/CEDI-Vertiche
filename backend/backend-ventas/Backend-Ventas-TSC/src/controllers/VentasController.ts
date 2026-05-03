import { Request, Response } from 'express';
import AbstractController from './AbstractController';
import db from '../models';

export default class VentasController extends AbstractController {
  private static _instance: VentasController;

  public static get instance(): VentasController {
    return this._instance || (this._instance = new this('ventas'));
  }

  protected initRoutes(): void {
    // Dim_Tienda
    this.router.get('/tiendas', this.getTiendas.bind(this));
    this.router.post('/tiendas', this.postTienda.bind(this));

    // Dim_Producto
    this.router.get('/productos', this.getProductos.bind(this));
    this.router.post('/productos', this.postProducto.bind(this));

    // Fact_Ventas
    this.router.get('/ventas', this.getVentas.bind(this));
    this.router.post('/ventas', this.postVenta.bind(this));
  }

  // ── GET /ventas/tiendas ──────────────────────────────────────────
  private async getTiendas(req: Request, res: Response) {
    try {
      const tiendas = await db.Dim_Tienda.findAll();
      res.status(200).json(tiendas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }

  // ── POST /ventas/tiendas ─────────────────────────────────────────
  private async postTienda(req: Request, res: Response) {
    try {
      await db.Dim_Tienda.create(req.body);
      res.status(200).json({ mensaje: 'Tienda creada exitosamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }

  // ── GET /ventas/productos ────────────────────────────────────────
  private async getProductos(req: Request, res: Response) {
    try {
      const productos = await db.Dim_Producto.findAll();
      res.status(200).json(productos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }

  // ── POST /ventas/productos ───────────────────────────────────────
  private async postProducto(req: Request, res: Response) {
    try {
      await db.Dim_Producto.create(req.body);
      res.status(200).json({ mensaje: 'Producto creado exitosamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }

  // ── GET /ventas/ventas ───────────────────────────────────────────
  private async getVentas(req: Request, res: Response) {
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
      res.status(500).json({ mensaje: err });
    }
  }

  // ── POST /ventas/ventas ──────────────────────────────────────────
  private async postVenta(req: Request, res: Response) {
    try {
      await db.Fact_Ventas.create(req.body);
      res.status(200).json({ mensaje: 'Venta creada exitosamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }
}