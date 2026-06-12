/**
 * Controlador de análisis comparativo entre tiendas.
 *
 * Rutas montadas bajo `/analisis/tiendas`:
 *  - `GET /ticket-zona`       → Ticket promedio por período para las zonas Norte y Sur.
 *  - `GET /ranking-tiendas`   → Ranking de tiendas por ingresos con delta YoY en K.
 *  - `GET /ventas-estado`     → Ingresos, ticket y unidades agrupados por estado y región.
 *
 * Todos los endpoints aceptan los query params estándar (`zona`, `temporada`, `period`)
 * definidos en `AbstractController.buildWhere()`.
 * Todas las rutas requieren token JWT de Supabase.
 */
import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
const { fn, col } = require("sequelize");

export default class TiendasAnalisisController extends AbstractController {
  private static _instance: TiendasAnalisisController;

  /** Singleton: devuelve la única instancia del controlador. */
  public static get instance(): TiendasAnalisisController {
    return this._instance || (this._instance = new this("analisis/tiendas"));
  }

  protected initRoutes(): void {
    this.router.get("/ticket-zona",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.getTicketZona.bind(this)
    );
    this.router.get("/ranking-tiendas",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.getRankingTiendas.bind(this)
    );
    this.router.get("/ventas-estado",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.getVentasEstado.bind(this)
    );
  }

  /**
   * GET /analisis/tiendas/ticket-zona — Ticket promedio por período para Norte y Sur.
   * Devuelve `{ labels, norte: number[], sur: number[] }` alineados por el mismo eje X.
   * La granularidad del eje X es la misma que en `/tendencias/performance`.
   */
  private async getTicketZona(req: Request, res: Response) {
    try {
      const { productoWhere, tiempoWhere, dias, period } = this.buildWhere(req);

      let groupBy: string;
      if (period === "7d")      groupBy = "dia_semana";
      else if (period === "1y") groupBy = "mes_nombre";
      else                      groupBy = "semana";

      const ORDEN_MESES = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
      ];

      const rows = await db.Fact_Ventas.findAll({
        attributes: [
          [col(`Dim_Tiempo.${groupBy}`),               "label"],
          [col("Dim_Tienda.region"),                    "zona"],
          [fn("AVG", col("Fact_Ventas.precio_final")),  "ticket"],
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
      const ORDEN_DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

      let rawLabels: string[];
      let labels: string[];

      if (period === "1y") {
        rawLabels = ORDEN_MESES.filter(m => labelsSet.has(m));
        labels    = rawLabels.map(m => m.slice(0, 3));
      } else if (period === "7d") {
        rawLabels = ORDEN_DIAS.filter(d => labelsSet.has(d));
        labels    = rawLabels;
      } else {
        rawLabels = [...labelsSet].sort((a, b) => Number(a) - Number(b)).map(s => String(s));
        labels    = rawLabels.map(s => `S${s}`);
      }

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
      this.handleError(res, err, "Error al obtener ticket por zona");
    }
  }

  /**
   * GET /analisis/tiendas/ranking-tiendas — Tiendas ordenadas de mayor a menor ingreso (K).
   * Incluye el delta YoY por tienda (diferencia de ingresos vs el año anterior) formateado
   * como `"+XK"` o `"-XK"`.  Respeta los filtros de `zona`, `temporada` y `period`.
   */
  private async getRankingTiendas(req: Request, res: Response) {
    try {
      const { tiendaWhere, productoWhere, tiempoWhere, dias } = this.buildWhere(req);
      const anioActual   = parseInt(AbstractController.fechaBase.slice(0, 4));
      const anioAnterior = anioActual - 1;

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

      const [actual, anterior] = await Promise.all([query(anioActual), query(anioAnterior)]);

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
            id: r.id, nombre: r.nombre, zona: r.zona,
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
      this.handleError(res, err, "Error al obtener ranking de tiendas");
    }
  }

  /**
   * GET /analisis/tiendas/ventas-estado — Ingresos (K), ticket promedio y unidades
   * agrupados por estado y región geográfica, para alimentar un mapa de calor.
   */
  private async getVentasEstado(req: Request, res: Response) {
    try {
      const { tiendaWhere, productoWhere, tiempoWhere, dias } = this.buildWhere(req);

      const rows = await db.Fact_Ventas.findAll({
        attributes: [
          [col("Dim_Tienda.estado"),                   "estado"],
          [col("Dim_Tienda.region"),                   "region"],
          [fn("SUM", col("Fact_Ventas.precio_final")), "ingresos"],
          [fn("AVG", col("Fact_Ventas.precio_final")), "ticket"],
          [fn("SUM", col("Fact_Ventas.cantidad")),     "unidades"],
        ],
        include: [
          { model: db.Dim_Tienda,   attributes: [], where: tiendaWhere,       required: true },
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
      this.handleError(res, err, "Error al obtener ventas por estado");
    }
  }
}