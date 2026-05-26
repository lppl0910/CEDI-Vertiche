import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
const { fn, col, literal } = require("sequelize");

const diasMap: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};
const fechaBase = "2025-12-31";

export default class ProductosAnalisisController extends AbstractController {
  private static _instance: ProductosAnalisisController;

  public static get instance(): ProductosAnalisisController {
    return this._instance || (this._instance = new this("analisis/productos"));
  }

  protected initRoutes(): void {
    this.router.get("/tallas",               this.getTallas.bind(this));
    this.router.get("/temporadas-categoria", this.getTemporadasCategoria.bind(this));
    this.router.get("/top-productos",        this.getTopProductos.bind(this));
  }

  // ── Helper ───────────────────────────────────────────────────────────
  private buildWhere(req: Request) {
    const zona      = req.query.zona      as string;
    const temporada = req.query.temporada as string;

    const tiendaWhere   = zona      && zona      !== "all" ? { region: zona } : undefined;
    const productoWhere = temporada && temporada !== "all" ? { temporada }    : undefined;
    const tiempoWhere   = (dias: number) =>
      literal(`Dim_Tiempo.fecha >= DATE_SUB('${fechaBase}', INTERVAL ${dias} DAY)`);

    return { tiendaWhere, productoWhere, tiempoWhere };
  }

  // ── GET /analisis/productos/tallas ───────────────────────────────────
  private async getTallas(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || "30d";
      const dias   = diasMap[period] ?? 30;
      const { tiendaWhere, productoWhere, tiempoWhere } = this.buildWhere(req);

      const rows = await db.Fact_Ventas.findAll({
        attributes: [
          [col("Dim_Producto.talla"), "name"],
          [fn("SUM", col("Fact_Ventas.cantidad")), "value"],
        ],
        include: [
          { model: db.Dim_Producto, attributes: [], where: productoWhere },
          { model: db.Dim_Tiempo,   attributes: [], where: tiempoWhere(dias) },
          ...(tiendaWhere
            ? [{ model: db.Dim_Tienda, attributes: [], where: tiendaWhere }]
            : []),
        ],
        group: ["Dim_Producto.talla"],
        order: [[fn("SUM", col("Fact_Ventas.cantidad")), "DESC"]],
        raw: true,
      });

      res.status(200).json(
        rows.map((r: any) => ({ name: String(r.name), value: parseInt(r.value) }))
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }

  // ── GET /analisis/productos/temporadas-categoria ─────────────────────
  private async getTemporadasCategoria(req: Request, res: Response) {
    try {
      const { tiendaWhere } = this.buildWhere(req);

      const rows = await db.Fact_Ventas.findAll({
        attributes: [
          [col("Dim_Producto.temporada"), "temporada"],
          [col("Dim_Producto.categoria"), "categoria"],
          [fn("SUM", col("Fact_Ventas.precio_final")), "ingresos"],
        ],
        include: [
          { model: db.Dim_Producto, attributes: [], required: true },
          { model: db.Dim_Tiempo,   attributes: [], required: true },
          { model: db.Dim_Tienda,   attributes: [], where: tiendaWhere, required: !!tiendaWhere },
        ],
        group: ["Dim_Producto.temporada", "Dim_Producto.categoria"],
        raw: true,
      });

      const temporadas = ["Primavera", "Verano", "Otoño", "Invierno"];
      const cats = [
        "Blusas", "Playeras", "Vestidos y Palazzos", "Pantalones y Leggings",
        "Sudaderas y Suéteres", "Chamarras y Chalecos", "Sacos y Túnicas",
        "Conjuntos", "Jeans", "Pijamas", "Abrigos y Ponchos", "Faldas y Shorts",
      ];
      const colors = [
        "#111111", "#A48F7A", "#D8C3A5", "#D9B8B0", "#8E9AAF", "#6E8B6B",
        "#C9963B", "#B65E4A", "#7B9E87", "#9E7B8A", "#7B8C9E", "#9E9B7B",
      ];

      const stackedData = temporadas.map((temp) => {
        const row: any = { season: temp };
        cats.forEach((cat) => {
          const found = rows.find((r: any) => r.temporada === temp && r.categoria === cat) as any;
          row[cat] = found ? Math.round(parseFloat(found.ingresos) / 1000) : 0;
        });
        return row;
      });

      res.status(200).json({ cats, colors, stackedData });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }

  // ── GET /analisis/productos/top-productos ────────────────────────────
  private async getTopProductos(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || "30d";
      const dias   = diasMap[period] ?? 30;
      const limit  = parseInt(req.query.limit as string) || 10;
      const { tiendaWhere, productoWhere, tiempoWhere } = this.buildWhere(req);

      const rows = await db.Fact_Ventas.findAll({
        attributes: [
          [col("Dim_Producto.descripcion"), "name"],
          [fn("SUM", col("Fact_Ventas.precio_final")), "rev"],
          [fn("SUM", col("Fact_Ventas.cantidad")), "units"],
        ],
        include: [
          { model: db.Dim_Producto, attributes: [], where: productoWhere },
          { model: db.Dim_Tiempo,   attributes: [], where: tiempoWhere(dias) },
          ...(tiendaWhere
            ? [{ model: db.Dim_Tienda, attributes: [], where: tiendaWhere }]
            : []),
        ],
        group: ["Dim_Producto.descripcion"],
        order: [[fn("SUM", col("Fact_Ventas.precio_final")), "DESC"]],
        limit,
        raw: true,
      });

      res.status(200).json(
        rows.map((r: any) => ({
          name:  r.name,
          rev:   Math.round(parseFloat(r.rev) / 1000),
          units: parseInt(r.units),
        }))
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }
}