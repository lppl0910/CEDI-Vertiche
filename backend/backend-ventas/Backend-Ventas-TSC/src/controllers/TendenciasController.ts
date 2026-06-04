import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
const { fn, col } = require("sequelize");

export default class TendenciasController extends AbstractController {
  private static _instance: TendenciasController;

  public static get instance(): TendenciasController {
    return this._instance || (this._instance = new this("tendencias"));
  }

  protected initRoutes(): void {
    this.router.get("/yoy",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.getYoY.bind(this)
    );
    this.router.get("/performance",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.getPerformance.bind(this)
    );
    this.router.get("/trimestral",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.getTrimestral.bind(this)
    );
    this.router.get("/festivos",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.getFestivos.bind(this)
    );
  }

  private async getYoY(req: Request, res: Response) {
    try {
      const anioActual   = parseInt(AbstractController.fechaBase.slice(0, 4));
      const anioAnterior = anioActual - 1;
      const { tiendaWhere, productoWhere } = this.buildWhere(req);

      const query = async (anio: number) =>
        db.Fact_Ventas.findAll({
          attributes: [
            [col("Dim_Tiempo.mes_nombre"), "mes"],
            [fn("SUM", col("precio_final")), "ingresos"],
          ],
          include: [
            { model: db.Dim_Tiempo,   attributes: [], where: { anio } },
            { model: db.Dim_Tienda,   attributes: [], where: tiendaWhere,   required: !!tiendaWhere },
            ...(productoWhere
              ? [{ model: db.Dim_Producto, attributes: [], where: productoWhere, required: true }]
              : []),
          ],
          group: ["Dim_Tiempo.mes_nombre"],
          raw: true,
        });

      const meses = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
      ];

      const toArray = (rows: any[]) =>
        meses.map((mes) => {
          const row = rows.find((r: any) => r.mes === mes);
          return row ? Math.round(parseFloat(row.ingresos) / 1000) : 0;
        });

      const [actual, anterior] = await Promise.all([query(anioActual), query(anioAnterior)]);

      res.status(200).json({
        anioActual, anioAnterior,
        actual:   toArray(actual),
        anterior: toArray(anterior),
      });
    } catch (err) {
      this.handleError(res, err, "Error al obtener comparativa YoY");
    }
  }

  private async getPerformance(req: Request, res: Response) {
    try {
      const { tiendaWhere, productoWhere, tiempoWhere, dias, period } = this.buildWhere(req);

      let groupBy: string;
      if (period === "7d")      groupBy = "dia_semana";
      else if (period === "1y") groupBy = "mes_nombre";
      else                      groupBy = "semana";

      const ORDEN_MESES = [
        "Enero","Febrero","Marzo","Abril","Mayo","Junio",
        "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
      ];

      const serie = await db.Fact_Ventas.findAll({
        attributes: [
          [col(`Dim_Tiempo.${groupBy}`), "label"],
          [fn("SUM", col("Fact_Ventas.precio_final")), "revenue"],
          [fn("SUM", col("Fact_Ventas.cantidad")),     "units"],
        ],
        include: [
          { model: db.Dim_Tiempo,   attributes: [], where: tiempoWhere(dias), required: true },
          { model: db.Dim_Tienda,   attributes: [], where: tiendaWhere,       required: !!tiendaWhere },
          { model: db.Dim_Producto, attributes: [], where: productoWhere,     required: !!productoWhere },
        ],
        group: [`Dim_Tiempo.${groupBy}`],
        order: [[col(`Dim_Tiempo.${groupBy}`), "ASC"]],
        raw: true,
      });

      const serieOrdenada = period === "1y"
        ? [...serie].sort((a: any, b: any) =>
            ORDEN_MESES.indexOf(a.label) - ORDEN_MESES.indexOf(b.label))
        : serie;

      const ventasKpi = await db.Fact_Ventas.findAll({
        attributes: [
          [fn("SUM", col("precio_final")),                      "ingresos_totales"],
          [fn("COUNT", fn("DISTINCT", col("id_nota"))),         "num_folios"],
          [fn("SUM", col("cantidad")),                          "unidades_vendidas"],
        ],
        include: [
          { model: db.Dim_Tiempo,   attributes: [], where: tiempoWhere(dias), required: true },
          { model: db.Dim_Tienda,   attributes: [], where: tiendaWhere,       required: !!tiendaWhere },
          { model: db.Dim_Producto, attributes: [], where: productoWhere,     required: !!productoWhere },
        ],
        raw: true,
      });

      const kpi      = ventasKpi[0] as any;
      const ingresos = parseFloat(kpi.ingresos_totales) || 0;
      const folios   = parseInt(kpi.num_folios)         || 1;
      const unidades = parseInt(kpi.unidades_vendidas)  || 0;

      res.status(200).json({
        period,
        labels:  serieOrdenada.map((r: any) => r.label),
        revenue: serieOrdenada.map((r: any) => Math.round(parseFloat(r.revenue) / 1000)),
        units:   serieOrdenada.map((r: any) => parseInt(r.units)),
        kpis: [
          { label: "Ingresos Totales",        value: `$${(ingresos / 1000000).toFixed(2)}M`, delta: "", pos: true, cl: "c1" },
          { label: "Ticket Promedio / Folio", value: `$${Math.round(ingresos / folios).toLocaleString("es-MX")}`, delta: "", pos: true, cl: "c2" },
          { label: "Unidades Vendidas",       value: unidades.toLocaleString("es-MX"), delta: "", pos: true, cl: "c3" },
        ],
      });
    } catch (err) {
      this.handleError(res, err, "Error al obtener performance");
    }
  }

  private async getTrimestral(req: Request, res: Response) {
    try {
      const { tiendaWhere } = this.buildWhere(req);

      const rows = await db.Fact_Ventas.findAll({
        attributes: [
          [col("Dim_Producto.temporada"), "season"],
          [fn("SUM", col("Fact_Ventas.precio_final")), "value"],
        ],
        include: [
          { model: db.Dim_Producto, attributes: [], required: true },
          { model: db.Dim_Tiempo,   attributes: [], required: true },
          { model: db.Dim_Tienda,   attributes: [], where: tiendaWhere, required: !!tiendaWhere },
        ],
        group: ["Dim_Producto.temporada"],
        order: [[col("Dim_Producto.temporada"), "ASC"]],
        raw: true,
      });

      res.status(200).json(
        rows.map((r: any) => ({ season: r.season, value: Math.round(parseFloat(r.value) / 1000) }))
      );
    } catch (err) {
      this.handleError(res, err, "Error al obtener datos trimestrales");
    }
  }

  private async getFestivos(req: Request, res: Response) {
    try {
      const { tiendaWhere, productoWhere, tiempoWhere, dias } = this.buildWhere(req);

      const rows = await db.Fact_Ventas.findAll({
        attributes: [
          [col("Dim_Tiempo.es_festivo"),                             "es_festivo"],
          [fn("SUM", col("Fact_Ventas.precio_final")),               "ingresos_total"],
          [fn("AVG", col("Fact_Ventas.precio_final")),               "ticket_prom"],
          [fn("COUNT", fn("DISTINCT", col("Dim_Tiempo.id_tiempo"))), "num_dias"],
        ],
        include: [
          { model: db.Dim_Tiempo,   attributes: [], where: tiempoWhere(dias) },
          { model: db.Dim_Tienda,   attributes: [], where: tiendaWhere },
          ...(productoWhere
            ? [{ model: db.Dim_Producto, attributes: [], where: productoWhere }]
            : []),
        ],
        group: ["Dim_Tiempo.es_festivo"],
        raw: true,
      });

      const festivo    = rows.find((r: any) => r.es_festivo == 1) as any;
      const normal     = rows.find((r: any) => r.es_festivo == 0) as any;
      const ingFestivo = festivo ? parseFloat(festivo.ingresos_total) / parseInt(festivo.num_dias) : 0;
      const ingNormal  = normal  ? parseFloat(normal.ingresos_total)  / parseInt(normal.num_dias)  : 0;
      const ratio      = ingNormal > 0 ? (ingFestivo / ingNormal).toFixed(1) : "0";
      const ticketFest = festivo ? Math.round(parseFloat(festivo.ticket_prom)) : 0;
      const ticketNorm = normal  ? Math.round(parseFloat(normal.ticket_prom))  : 0;

      res.status(200).json([
        { label: "Ingreso prom. festivo", val: `$${Math.round(ingFestivo).toLocaleString("es-MX")}`, color: "#C9963B", sub: "por día" },
        { label: "Ingreso prom. normal",  val: `$${Math.round(ingNormal).toLocaleString("es-MX")}`,  color: "#111",    sub: "por día" },
        { label: "Ratio festivo/normal",  val: `${ratio}×`, color: "#6E8B6B", sub: `los festivos venden ${ratio}× más` },
        { label: "Ticket prom. festivo",  val: `$${ticketFest.toLocaleString("es-MX")}`, color: "#A48F7A", sub: `vs $${ticketNorm.toLocaleString("es-MX")} días normales` },
      ]);
    } catch (err) {
      this.handleError(res, err, "Error al obtener datos de festivos");
    }
  }
}