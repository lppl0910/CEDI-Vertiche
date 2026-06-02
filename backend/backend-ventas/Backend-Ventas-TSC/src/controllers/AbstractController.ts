import { Router, Request, Response } from "express";
import db from "../models";
const { fn, col } = require("sequelize");

const diasMap: Record<string, number> = {
  "7d":  7,
  "30d": 30,
  "90d": 90,
  "1y":  365,
};

export default abstract class AbstractController {

  // ── Fecha base compartida por todos los controllers ──────────────────
  // Se inicializa con el fallback y se sobreescribe en initFechaBase()
  protected static fechaBase: string = "2025-12-31";

  // ── Atributos de instancia ───────────────────────────────────────────
  private _router: Router;
  private _prefix: string;

  // ── Getters ──────────────────────────────────────────────────────────
  public get router(): Router {
    return this._router;
  }

  public get prefix(): string {
    return this._prefix;
  }

  // ── Constructor ──────────────────────────────────────────────────────
  protected constructor(_prefix: string) {
    this._router = Router();
    this._prefix = _prefix;
    this.initRoutes();
  }

  protected abstract initRoutes(): void;

  // ── Inicializar fechaBase desde el último registro de Dim_Tiempo ─────
  // Llamar una vez al arrancar el servidor, antes de registrar rutas.
  public static async initFechaBase(): Promise<void> {
    try {
      const result = await db.Dim_Tiempo.findOne({
        attributes: [[fn("MAX", col("fecha")), "maxFecha"]],
        raw: true,
      });
      const max = (result as any)?.maxFecha;
      if (max) {
       AbstractController.fechaBase = new Date(max).toISOString().split("T")[0]!;
        console.log(`📅 fechaBase inicializada: ${AbstractController.fechaBase}`);
      }
    } catch (err) {
      console.warn("⚠️  No se pudo inicializar fechaBase, usando fallback:", AbstractController.fechaBase);
    }
  }

  // ── Actualizar fechaBase si se inserta una fecha más reciente ─────────
  // Llamar desde TiempoController.create después de insertar.
  public static actualizarFechaBase(nuevaFecha: string): void {
    if (nuevaFecha && nuevaFecha > AbstractController.fechaBase) {
      AbstractController.fechaBase = nuevaFecha;
      console.log(`📅 fechaBase actualizada: ${AbstractController.fechaBase}`);
    }
  }

  // ── buildWhere compartido ─────────────────────────────────────────────
  // Centraliza la lógica de filtros zona/temporada/periodo que antes
  // estaba duplicada en TendenciasController, TiendasAnalisisController
  // y ProductosAnalisisController.
  protected buildWhere(req: Request) {
    const zona      = req.query.zona      as string | undefined;
    const temporada = req.query.temporada as string | undefined;
    const period    = (req.query.period   as string) || "30d";
    const dias      = diasMap[period] ?? 30;

    const tiendaWhere   = zona      && zona      !== "all" ? { region: zona as string }           : undefined;
    const productoWhere = temporada && temporada !== "all" ? { temporada: temporada as string }    : undefined;

    const { literal } = require("sequelize");
    const tiempoWhere = (d: number) =>
      literal(`Dim_Tiempo.fecha >= DATE_SUB('${AbstractController.fechaBase}', INTERVAL ${d} DAY)`) as any;

    return { tiendaWhere, productoWhere, tiempoWhere, dias, period };
  }

  // ── handleError centralizado ──────────────────────────────────────────
  // Evita repetir el mismo bloque catch en cada controller.
  protected handleError(res: Response, err: unknown, mensaje: string): void {
    console.error(err);
    res.status(500).json({ mensaje, error: err });
  }
}