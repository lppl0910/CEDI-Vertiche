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

export default class TiendasAnalisisController extends AbstractController {
  private static _instance: TiendasAnalisisController;

  public static get instance(): TiendasAnalisisController {
    return this._instance || (this._instance = new this("analisis/tiendas"));
  }

  protected initRoutes(): void {
    this.router.get("/ticket-zona",     this.getTicketZona.bind(this));
    this.router.get("/ranking-tiendas", this.getRankingTiendas.bind(this));
    this.router.get("/ventas-estado",   this.getVentasEstado.bind(this));
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

  // ── GET /analisis/tiendas/ticket-zona ───────────────────────────────
  private async getTicketZona(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || "30d";
      const dias   = diasMap[period] ?? 30;
      const { productoWhere, tiempoWhere } = this.buildWhere(req);

      let groupBy: string;
      if (period === "7d")      groupBy = "dia_semana";
      else if (period === "1y") groupBy = "mes_nombre";
      else                      groupBy = "semana";

      const ORDEN_MESES = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
      ];

      const rows = await db.Fact_Ventas.findAll({
        attributes: [
          [col(`Dim_Tiempo.${groupBy}`), "label"],
          [col("Dim_Tienda.region"), "zona"],
          [fn("AVG", col("Fact_Ventas.precio_final")), "ticket"],
        ],
        include: [
          { model: db.Dim_Tiempo,   attributes: [], where: tiempoWhere(dias), required: true },
          { model: db.Dim_Tienda,   attributes: [], required: true },
          { model: db.Dim_Producto, attributes: [], where: productoWhere, required: !!productoWhere },
        ],
        group: [`Dim_Tiempo.${groupBy}`, "Dim_Tienda.region"],
        raw: true,
      });

      const labelsSet = new Set(rows.map((r: any) => String(r.label)));
      let labels: string[];

      if (period === "1y") {
        labels = ORDEN_MESES.filter(m => labelsSet.has(m)).map(m => m.slice(0, 3));
      } else if (period === "7d") {
        const ORDEN_DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
        labels = ORDEN_DIAS.filter(d => labelsSet.has(d));
      } else {
        labels = [...labelsSet].sort((a, b) => Number(a) - Number(b)).map(s => `S${s}`);
      }

      const rawLabels = period === "1y"
        ? ORDEN_MESES.filter(m => labelsSet.has(m))
        : period === "7d"
          ? ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].filter(d => labelsSet.has(d))
          : [...labelsSet].sort((a, b) => Number(a) - Number(b));

      const norte = rawLabels.map(l => {
        const r = rows.find((r: any) => String(r.label) === l && r.zona === "Norte") as any;
        return r ? Math.round(parseFloat(r.ticket)) : 0;
      });

      const sur = rawLabels.map(l => {
        const r = rows.find((r: any) => String(r.label) === l && r.zona === "Sur") as any;
        return r ? Math.round(parseFloat(r.ticket)) : 0;
      });

      res.status(200).json({ labels, norte, sur });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }

  // ── GET /analisis/tiendas/ranking-tiendas ────────────────────────────
  private async getRankingTiendas(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || "30d";
      const dias   = diasMap[period] ?? 30;
      const { tiendaWhere, productoWhere, tiempoWhere } = this.buildWhere(req);

      const query = async (anio: number) =>
        db.Fact_Ventas.findAll({
          attributes: [
            [col("Dim_Tienda.id_tienda"), "id"],
            [col("Dim_Tienda.nombre"),    "nombre"],
            [col("Dim_Tienda.region"),    "zona"],
            [fn("SUM", col("Fact_Ventas.precio_final")), "ingresos"],
            [fn("AVG", col("Fact_Ventas.precio_final")), "ticket"],
            [fn("SUM", col("Fact_Ventas.cantidad")),     "uds"],
          ],
          include: [
            { model: db.Dim_Tienda,   attributes: [], where: tiendaWhere },
            { model: db.Dim_Tiempo,   attributes: [], where: tiempoWhere(dias) },
            ...(productoWhere
              ? [{ model: db.Dim_Producto, attributes: [], where: productoWhere }]
              : []),
          ],
          group: ["Dim_Tienda.id_tienda", "Dim_Tienda.nombre", "Dim_Tienda.region"],
          raw: true,
        });

      const [actual, anterior] = await Promise.all([query(2025), query(2024)]);

      const anteriorMap: Record<string, number> = {};
      anterior.forEach((r: any) => {
        anteriorMap[r.id] = Math.round(parseFloat(r.ingresos) / 1000);
      });

      const result = (actual as any[])
        .map((r: any) => {
          const ingActual   = Math.round(parseFloat(r.ingresos) / 1000);
          const ingAnterior = anteriorMap[r.id] ?? ingActual;
          const diff        = ingActual - ingAnterior;
          return {
            id:       r.id,
            nombre:   r.nombre,
            zona:     r.zona,
            ingresos: ingActual,
            ticket:   Math.round(parseFloat(r.ticket)),
            uds:      parseInt(r.uds),
            delta:    `${diff >= 0 ? "+" : ""}${diff}K`,
            deltaPos: diff >= 0,
          };
        })
        .sort((a, b) => b.ingresos - a.ingresos);

      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }

  // ── GET /analisis/tiendas/ventas-estado ─────────────────────────────
  private async getVentasEstado(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || "30d";
      const dias   = diasMap[period] ?? 30;
      const { tiendaWhere, productoWhere, tiempoWhere } = this.buildWhere(req);

      const rows = await db.Fact_Ventas.findAll({
        attributes: [
          [col("Dim_Tienda.estado"),  "estado"],
          [col("Dim_Tienda.region"),  "region"],
          [fn("SUM", col("Fact_Ventas.precio_final")), "ingresos"],
          [fn("AVG", col("Fact_Ventas.precio_final")), "ticket"],
          [fn("SUM", col("Fact_Ventas.cantidad")),     "unidades"],
        ],
        include: [
          { model: db.Dim_Tienda,   attributes: [], where: tiendaWhere,   required: true },
          { model: db.Dim_Tiempo,   attributes: [], where: tiempoWhere(dias), required: true },
          ...(productoWhere
            ? [{ model: db.Dim_Producto, attributes: [], where: productoWhere, required: true }]
            : []),
        ],
        group: ["Dim_Tienda.estado", "Dim_Tienda.region"],
        raw: true,
      });

      res.status(200).json(
        rows.map((r: any) => ({
          estado:   r.estado,
          region:   r.region,
          ingresos: Math.round(parseFloat(r.ingresos) / 1000),
          ticket:   Math.round(parseFloat(r.ticket)),
          unidades: parseInt(r.unidades),
        }))
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }
}