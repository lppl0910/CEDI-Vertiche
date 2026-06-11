/**
 * Variables de entorno centralizadas del proyecto Backend-Ventas-TSC.
 *
 * Todas las constantes leen desde `process.env` y tienen valores por defecto
 * para entorno de desarrollo local.  En producción se deben suministrar via
 * un archivo `.env` o el gestor de secretos correspondiente.
 */

/** Puerto en que escucha el servidor Express. */
export const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8080;

/** Entorno de ejecución: `'development'` | `'production'` | `'test'`. */
export const NODE_ENV: string = process.env.NODE_ENV || 'development';

/** Sufijo que se agrega a nombres de recursos en entornos que no son producción. */
export const POSTFIX_NAME = NODE_ENV === 'production' ? '' : '-DEV';

// ── Base de datos MySQL (Sequelize) ────────────────────────────────────────
export const DB_NAME     = process.env.DB_NAME     || 'prueba';
export const DB_USER     = process.env.DB_USER     || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'Password1234';
export const DB_HOST     = process.env.DB_HOST     || 'localhost';

// ── Base de datos NoSQL (Mongo — reservado para uso futuro) ───────────────
export const DB_NOSQL_NAME     = process.env.DB_NOSQL_NAME     || 'test';
export const DB_NOSQL_USER     = process.env.DB_NOSQL_USER     || 'admin';
export const DB_NOSQL_PASSWORD = process.env.DB_NOSQL_PASSWORD || 'Password1234';
export const DB_NOSQL_HOST     = process.env.DB_NOSQL_HOST     || 'localhost';
