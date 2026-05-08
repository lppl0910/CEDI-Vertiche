import { Request, Response } from "express";
import AbstractController from "./AbstractController";
import db from "../models";
const { Op, fn, col, literal } = require("sequelize");

const diasMap: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};
const fechaBase = "2025-12-31";

export default class VentasController extends AbstractController {
  private static _instance: VentasController;

  public static get instance(): VentasController {
    return this._instance || (this._instance = new this("ventas"));
  }

  protected initRoutes(): void {
    // Dim_Tienda
    this.router.get("/tiendas", this.getTiendas.bind(this));
    this.router.post("/tiendas", this.postTienda.bind(this));

    // Dim_Producto
    this.router.get("/productos", this.getProductos.bind(this));
    this.router.post("/productos", this.postProducto.bind(this));

    // Fact_Ventas
    this.router.get("/ventas", this.getVentas.bind(this));
    this.router.post("/ventas", this.postVenta.bind(this));

    // Tendencias
    this.router.get("/yoy", this.getYoY.bind(this));

    this.router.get("/performance", this.getPerformance.bind(this));

    this.router.get("/trimestral", this.getTrimestral.bind(this));

    this.router.get("/festivos", this.getFestivos.bind(this));

    // Productos
    this.router.get("/tallas", this.getTallas.bind(this));

    this.router.get(
      "/temporadas-categoria",
      this.getTemporadasCategoria.bind(this),
    );

    this.router.get("/top-productos", this.getTopProductos.bind(this));

    this.router.get("/ticket-zona", this.getTicketZona.bind(this));

    this.router.get("/ranking-tiendas", this.getRankingTiendas.bind(this));
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
      res.status(200).json({ mensaje: "Tienda creada exitosamente" });
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
      res.status(200).json({ mensaje: "Producto creado exitosamente" });
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
      res.status(200).json({ mensaje: "Venta creada exitosamente" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }

  private async getYoY(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || "30d";
      const dias = diasMap[period] ?? 30;

      const region = (req.query.region as string) || "all";

      const anioActual = 2025;
      const anioAnterior = anioActual - 1;

      const query = async (anio: number) => {
        return db.Fact_Ventas.findAll({
          attributes: [
            [col("Dim_Tiempo.mes_nombre"), "mes"],
            [fn("SUM", col("precio_final")), "ingresos"],
          ],
          include: [
            {
              model: db.Dim_Tiempo,
              attributes: [],
              where: literal(
                `Dim_Tiempo.fecha >= DATE_SUB('${fechaBase}', INTERVAL ${dias} DAY) AND ${anio}`,
              ),
            },
            {
              model: db.Dim_Tienda,
              attributes: [],
              where: literal(
                `'${region}' = Dim_Tienda.region OR ('${region}' = 'all' AND Fact_Ventas.id_tienda = Dim_Tienda.id_tienda)`,
              ),
            },
          ],
          group: ["Dim_Tiempo.mes_nombre"],
          raw: true,
        });
      };

      const meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];

      const toArray = (rows: any[]) =>
        meses.map((mes) => {
          const row = rows.find((r: any) => r.mes === mes);
          return row ? Math.round(parseFloat(row.ingresos) / 1000) : 0;
        });

      const [actual, anterior] = await Promise.all([
        query(anioActual),
        query(anioAnterior),
      ]);

      res.status(200).json({
        anioActual,
        anioAnterior,
        actual: toArray(actual),
        anterior: toArray(anterior),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }

  private async getPerformance(req: Request, res: Response) {
    try {
      console.log(req.query);

      const period = (req.query.period as string) || "30d";
      const dias = diasMap[period] ?? 30;

      const region = (req.query.region as string) || "all";
      console.log("region: ", region);

      let groupBy: string;
      if (period === "7d") groupBy = "dia_semana";
      else if (period === "1y") groupBy = "mes_nombre";
      else groupBy = "semana";

      const serie = await db.Fact_Ventas.findAll({
        attributes: [
          [col(`Dim_Tiempo.${groupBy}`), "label"],
          [fn("SUM", col("Fact_Ventas.precio_final")), "revenue"],
          [fn("SUM", col("Fact_Ventas.cantidad")), "units"],
        ],
        include: [
          {
            model: db.Dim_Tiempo,
            attributes: [],
            where: literal(
              `Dim_Tiempo.fecha >= DATE_SUB('${fechaBase}', INTERVAL ${dias} DAY)`,
            ),
          },
          {
            model: db.Dim_Tienda,
            attributes: [],
            where: literal(
              `'${region}' = Dim_Tienda.region OR ('${region}' = 'all' AND Fact_Ventas.id_tienda = Dim_Tienda.id_tienda)`,
            ),
          },
        ],
        group: [`Dim_Tiempo.${groupBy}`],
        order: [[col(`Dim_Tiempo.${groupBy}`), "ASC"]],
        raw: true,
      });

      const ventasKpi = await db.Fact_Ventas.findAll({
        attributes: [
          [fn("SUM", col("precio_final")), "ingresos_totales"],
          [fn("COUNT", fn("DISTINCT", col("id_nota"))), "num_folios"],
          [fn("SUM", col("cantidad")), "unidades_vendidas"],
        ],
        include: [
          {
            model: db.Dim_Tiempo,
            attributes: [],
            where: literal(`Dim_Tiempo.anio IN (2024, 2025)`),
          },
          {
            model: db.Dim_Tienda,
            attributes: [],
            where: literal(
              `'${region}' = Dim_Tienda.region OR ('${region}' = 'all' AND Fact_Ventas.id_tienda = Dim_Tienda.id_tienda)`,
            ),
          },
        ],
        raw: true,
      });

      const kpi = ventasKpi[0] as any;
      const ingresos = parseFloat(kpi.ingresos_totales) || 0;
      const folios = parseInt(kpi.num_folios) || 1;
      const unidades = parseInt(kpi.unidades_vendidas) || 0;

      const kpis = [
        {
          label: "Ingresos Totales",
          value: `$${(ingresos / 1000000).toFixed(2)}M`,
          delta: "",
          pos: true,
          cl: "c1",
        },
        {
          label: "Ticket Promedio / Folio",
          value: `$${Math.round(ingresos / folios).toLocaleString("es-MX")}`,
          delta: "",
          pos: true,
          cl: "c2",
        },
        {
          label: "Unidades Vendidas",
          value: unidades.toLocaleString("es-MX"),
          delta: "",
          pos: true,
          cl: "c3",
        },
      ];

      res.status(200).json({
        period,
        labels: serie.map((r: any) => r.label),
        revenue: serie.map((r: any) =>
          Math.round(parseFloat(r.revenue) / 1000),
        ),
        units: serie.map((r: any) => parseInt(r.units)),
        kpis,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }

  private async getTrimestral(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || "30d";
      const dias = diasMap[period] ?? 30;

      const region = (req.query.region as string) || "all";

      const rows = await db.Fact_Ventas.findAll({
        attributes: [
          [col("Dim_Producto.temporada"), "season"],
          [fn("SUM", col("Fact_Ventas.precio_final")), "value"],
        ],
        include: [
          { model: db.Dim_Producto, attributes: [] },
          {
            model: db.Dim_Tiempo,
            attributes: [],
            where: literal(
              `Dim_Tiempo.fecha >= DATE_SUB('${fechaBase}', INTERVAL ${dias} DAY)`,
            ),
          },
          {
            model: db.Dim_Tienda,
            attributes: [],
            where: literal(
              `'${region}' = Dim_Tienda.region OR ('${region}' = 'all' AND Fact_Ventas.id_tienda = Dim_Tienda.id_tienda)`,
            ),
          },
        ],
        group: ["Dim_Producto.temporada"],
        order: [[col("Dim_Producto.temporada"), "ASC"]],
        raw: true,
      });

      const result = rows.map((r: any) => ({
        season: r.season,
        value: Math.round(parseFloat(r.value) / 1000),
      }));

      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }

  private async getFestivos(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || "30d";
      const dias = diasMap[period] ?? 30;

      const region = (req.query.region as string) || "all";

      const rows = await db.Fact_Ventas.findAll({
        attributes: [
          [col("Dim_Tiempo.es_festivo"), "es_festivo"],
          [fn("SUM", col("Fact_Ventas.precio_final")), "ingresos_total"],
          [fn("AVG", col("Fact_Ventas.precio_final")), "ticket_prom"],
          [
            fn("COUNT", fn("DISTINCT", col("Dim_Tiempo.id_tiempo"))),
            "num_dias",
          ],
        ],
        include: [
          {
            model: db.Dim_Tiempo,
            attributes: [],
            where: literal(
              `Dim_Tiempo.fecha >= DATE_SUB('${fechaBase}', INTERVAL ${dias} DAY)`,
            ),
          },
          {
            model: db.Dim_Tienda,
            attributes: [],
            where: literal(
              `'${region}' = Dim_Tienda.region OR ('${region}' = 'all' AND Fact_Ventas.id_tienda = Dim_Tienda.id_tienda)`,
            ),
          },
        ],
        group: ["Dim_Tiempo.es_festivo"],
        raw: true,
      });

      const festivo = rows.find((r: any) => r.es_festivo == 1) as any;
      const normal = rows.find((r: any) => r.es_festivo == 0) as any;

      const ingFestivo = festivo
        ? parseFloat(festivo.ingresos_total) / parseInt(festivo.num_dias)
        : 0;
      const ingNormal = normal
        ? parseFloat(normal.ingresos_total) / parseInt(normal.num_dias)
        : 0;
      const ratio = ingNormal > 0 ? (ingFestivo / ingNormal).toFixed(1) : "0";
      const ticketFest = festivo
        ? Math.round(parseFloat(festivo.ticket_prom))
        : 0;
      const ticketNorm = normal
        ? Math.round(parseFloat(normal.ticket_prom))
        : 0;

      res.status(200).json([
        {
          label: "Ingreso prom. festivo",
          val: `$${Math.round(ingFestivo).toLocaleString("es-MX")}`,
          color: "#C9963B",
          sub: "por día",
        },
        {
          label: "Ingreso prom. normal",
          val: `$${Math.round(ingNormal).toLocaleString("es-MX")}`,
          color: "#111",
          sub: "por día",
        },
        {
          label: "Ratio festivo/normal",
          val: `${ratio}×`,
          color: "#6E8B6B",
          sub: `los festivos venden ${ratio}× más`,
        },
        {
          label: "Ticket prom. festivo",
          val: `$${ticketFest.toLocaleString("es-MX")}`,
          color: "#A48F7A",
          sub: `vs $${ticketNorm.toLocaleString("es-MX")} días normales`,
        },
      ]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }

  // Productos
  private async getTallas(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || "30d";
      const dias = diasMap[period] ?? 30;

      const region = (req.query.region as string) || "all";

      const rows = await db.Fact_Ventas.findAll({
        attributes: [
          [col("Dim_Producto.talla"), "name"],
          [fn("SUM", col("Fact_Ventas.cantidad")), "value"],
        ],
        include: [
          { model: db.Dim_Producto, attributes: [] },
          {
            model: db.Dim_Tiempo,
            attributes: [],
            where: literal(
              `Dim_Tiempo.fecha >= DATE_SUB('${fechaBase}', INTERVAL ${dias} DAY)`,
            ),
          },
          {
            model: db.Dim_Tienda,
            attributes: [],
            where: literal(
              `'${region}' = Dim_Tienda.region OR ('${region}' = 'all' AND Fact_Ventas.id_tienda = Dim_Tienda.id_tienda)`,
            ),
          },
        ],
        group: ["Dim_Producto.talla"],
        order: [[fn("SUM", col("Fact_Ventas.cantidad")), "DESC"]],
        raw: true,
      });

      const result = rows.map((r: any) => ({
        name: String(r.name),
        value: parseInt(r.value),
      }));

      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }

  private async getTemporadasCategoria(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || "30d";
      const dias = diasMap[period] ?? 30;

      const region = (req.query.region as string) || "all";

      const rows = await db.Fact_Ventas.findAll({
        attributes: [
          [col("Dim_Producto.temporada"), "temporada"],
          [col("Dim_Producto.categoria"), "categoria"],
          [fn("SUM", col("Fact_Ventas.precio_final")), "ingresos"],
        ],
        include: [
          { model: db.Dim_Producto, attributes: [] },
          {
            model: db.Dim_Tiempo,
            attributes: [],
            where: literal(
              `Dim_Tiempo.fecha >= DATE_SUB('${fechaBase}', INTERVAL ${dias} DAY)`,
            ),
          },
          {
            model: db.Dim_Tienda,
            attributes: [],
            where: literal(
              `'${region}' = Dim_Tienda.region OR ('${region}' = 'all' AND Fact_Ventas.id_tienda = Dim_Tienda.id_tienda)`,
            ),
          },
        ],
        group: ["Dim_Producto.temporada", "Dim_Producto.categoria"],
        raw: true,
      });

      const temporadas = ["Primavera", "Verano", "Otoño", "Invierno"];
      const cats = [
        "Blusas",
        "Playeras",
        "Vestidos y Palazzos",
        "Pantalones y Leggings",
        "Sudaderas y Suéteres",
        "Chamarras y Chalecos",
        "Sacos y Túnicas",
        "Conjuntos",
        "Jeans",
        "Pijamas",
        "Abrigos y Ponchos",
        "Faldas y Shorts",
      ];
      const colors = [
        "#111111",
        "#A48F7A",
        "#D8C3A5",
        "#D9B8B0",
        "#8E9AAF",
        "#6E8B6B",
        "#C9963B",
        "#B65E4A",
        "#7B9E87",
        "#9E7B8A",
        "#7B8C9E",
        "#9E9B7B",
      ];

      const stackedData = temporadas.map((temp) => {
        const row: any = { season: temp };
        cats.forEach((cat) => {
          const found = rows.find(
            (r: any) => r.temporada === temp && r.categoria === cat,
          ) as any;
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

  private async getTopProductos(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || "30d";
      const dias = diasMap[period] ?? 30;

      const region = (req.query.region as string) || "all";

      const limit = parseInt(req.query.limit as string) || 10;

      const rows = await db.Fact_Ventas.findAll({
        attributes: [
          [col("Dim_Producto.descripcion"), "name"],
          [fn("SUM", col("Fact_Ventas.precio_final")), "rev"],
          [fn("SUM", col("Fact_Ventas.cantidad")), "units"],
        ],
        include: [
          { model: db.Dim_Producto, attributes: [] },
          {
            model: db.Dim_Tiempo,
            attributes: [],
            where: literal(
              `Dim_Tiempo.fecha >= DATE_SUB('${fechaBase}', INTERVAL ${dias} DAY)`,
            ),
          },
          {
            model: db.Dim_Tienda,
            attributes: [],
            where: literal(
              `'${region}' = Dim_Tienda.region OR ('${region}' = 'all' AND Fact_Ventas.id_tienda = Dim_Tienda.id_tienda)`,
            ),
          },
        ],
        group: ["Dim_Producto.descripcion"],
        order: [[fn("SUM", col("Fact_Ventas.precio_final")), "DESC"]],
        limit,
        raw: true,
      });

      const result = rows.map((r: any) => ({
        name: r.name,
        rev: Math.round(parseFloat(r.rev) / 1000),
        units: parseInt(r.units),
      }));

      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }

  private async getTicketZona(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || "30d";
      const dias = diasMap[period] ?? 30;

      const region = (req.query.region as string) || "all";

      const meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];

      const rows = await db.Fact_Ventas.findAll({
        attributes: [
          [col("Dim_Tiempo.mes_nombre"), "mes"],
          [col("Dim_Tienda.region"), "zona"],
          [fn("AVG", col("Fact_Ventas.precio_final")), "ticket"],
        ],
        include: [
          {
            model: db.Dim_Tiempo,
            attributes: [],
            where: literal(
              `Dim_Tiempo.fecha >= DATE_SUB('${fechaBase}', INTERVAL ${dias} DAY)`,
            ),
          },
          {
            model: db.Dim_Tienda,
            attributes: [],
            where: literal(
              `'${region}' = Dim_Tienda.region OR ('${region}' = 'all' AND Fact_Ventas.id_tienda = Dim_Tienda.id_tienda)`,
            ),
          },
        ],
        group: ["Dim_Tiempo.mes_nombre", "Dim_Tienda.region"],
        raw: true,
      });

      const norte: number[] = new Array(12).fill(0);
      const sur: number[] = new Array(12).fill(0);

      rows.forEach((r: any) => {
        const idx = meses.indexOf(r.mes);
        if (idx === -1) return;
        const val = Math.round(parseFloat(r.ticket));
        if (r.zona === "Norte") norte[idx] = val;
        else sur[idx] = val;
      });

      const labels = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];
      res.status(200).json({ labels, norte, sur });
    } catch (err) {
      console.error(err);
      res.status(500).json({ mensaje: err });
    }
  }
  private async getRankingTiendas(req: Request, res: Response) {
    try {
      const period = (req.query.period as string) || "30d";
      const dias = diasMap[period] ?? 30;

      const region = (req.query.region as string) || "all";

      const query = async (anio: number) => {
        return db.Fact_Ventas.findAll({
          attributes: [
            [col("Dim_Tienda.id_tienda"), "id"],
            [col("Dim_Tienda.nombre"), "nombre"],
            [col("Dim_Tienda.region"), "zona"],
            [fn("SUM", col("Fact_Ventas.precio_final")), "ingresos"],
            [fn("AVG", col("Fact_Ventas.precio_final")), "ticket"],
            [fn("SUM", col("Fact_Ventas.cantidad")), "uds"],
          ],
          include: [
            {
              model: db.Dim_Tienda,
              attributes: [],
              where: literal(
                `'${region}' = Dim_Tienda.region OR ('${region}' = 'all' AND Fact_Ventas.id_tienda = Dim_Tienda.id_tienda)`,
              ),
            },
            {
              model: db.Dim_Tiempo,
              attributes: [],
              where: literal(
                `Dim_Tiempo.fecha >= DATE_SUB('${fechaBase}', INTERVAL ${dias} DAY)`,
              ),
            },
          ],
          group: [
            "Dim_Tienda.id_tienda",
            "Dim_Tienda.nombre",
            "Dim_Tienda.region",
          ],
          raw: true,
        });
      };

      const [actual, anterior] = await Promise.all([query(2025), query(2024)]);

      const anteriorMap: Record<string, number> = {};
      anterior.forEach((r: any) => {
        anteriorMap[r.id] = Math.round(parseFloat(r.ingresos) / 1000);
      });

      const result = (actual as any[])
        .map((r: any) => {
          const ingActual = Math.round(parseFloat(r.ingresos) / 1000);
          const ingAnterior = anteriorMap[r.id] ?? ingActual;
          const diff = ingActual - ingAnterior;
          return {
            id: r.id,
            nombre: r.nombre,
            zona: r.zona,
            ingresos: ingActual,
            ticket: Math.round(parseFloat(r.ticket)),
            uds: parseInt(r.uds),
            delta: `${diff >= 0 ? "+" : ""}${diff}K`,
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
}
