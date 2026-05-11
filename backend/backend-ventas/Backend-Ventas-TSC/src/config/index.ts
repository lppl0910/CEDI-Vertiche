// Variables de entorno del proyecto
export const PORT:number = process.env.PORT ? parseInt(process.env.PORT):8080;
export const NODE_ENV : string = process.env.NODE_ENV || 'development';
export const POSTFIX_NAME = NODE_ENV === 'production'?'':'-DEV';
// Variables de entorno de la base de datos
export const DB_NAME = process.env.DB_NAME || 'prueba';
export const DB_USER = process.env.DB_USER || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'Password1234';
export const DB_HOST = process.env.DB_HOST || 'localhost';

// Mongo
export const DB_NOSQL_NAME = process.env.DB_NOSQL_NAME || 'test';
export const DB_NOSQL_USER = process.env.DB_NOSQL_USER || 'admin';
export const DB_NOSQL_PASSWORD = process.env.DB_NOSQL_PASSWORD || 'Password1234';
export const DB_NOSQL_HOST = process.env.DB_NOSQL_HOST || 'localhost';
