/**
 * Objeto de configuración de Sequelize por entorno.
 *
 * Actualmente solo define el entorno `development` apuntando a MySQL.
 * Sequelize utiliza este objeto en `src/models/index.ts` para crear
 * la instancia de conexión correspondiente al `NODE_ENV` activo.
 */
import { defaultValueSchemable } from "sequelize/lib/utils";
import { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } from ".";

export default {
  development: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    host:     DB_HOST,
    port:     3306,
    dialect:  "mysql",
  },
};