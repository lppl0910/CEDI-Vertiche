import { Router, Request, Response } from "express";
import db from "../models";
import AuthMiddleware from "../middlewares/authorization";
const { fn, col } = require("sequelize");

const diasMap: Record<string, number> = {
  "7d":  7,
  "30d": 30,
  "90d": 90,
  "1y":  365,
};

export default abstract class AbstractController {

  // ── Fecha base compartida por todos los controllers ──────────────────
  protected static fechaBase: string = "2025-12-31";

  // ── Atributos de instancia ───────────────────────────────────────────
  private _router: Router;
  private _prefix: string;

  // Declarada aquí pero asignada en el constructor ANTES de initRoutes
  protected authMiddleware!: AuthMiddleware;

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
    // authMiddleware debe asignarse ANTES de initRoutes
    // porque initRoutes registra this.authMiddleware.verifyToken
    this.authMiddleware = AuthMiddleware.instance;
    this.initRoutes();
  }

  protected abstract initRoutes(): void;

  // ── Inicializar fechaBase desde el último registro de Dim_Tiempo ─────
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
  public static actualizarFechaBase(nuevaFecha: string): void {
    if (nuevaFecha && nuevaFecha > AbstractController.fechaBase) {
      AbstractController.fechaBase = nuevaFecha;
      console.log(`📅 fechaBase actualizada: ${AbstractController.fechaBase}`);
    }
  }

  // ── buildWhere compartido ─────────────────────────────────────────────
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
  protected handleError(res: Response, err: unknown, mensaje: string): void {
    console.error(err);
    res.status(500).json({ mensaje, error: err });
  }
}