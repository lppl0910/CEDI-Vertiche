/**
 * Inicializador del ORM Sequelize y cargador dinámico de modelos.
 *
 * Lee todos los archivos `.js` presentes en este directorio (excepto `index.js`
 * y archivos de test), los registra como modelos de Sequelize y luego resuelve
 * las asociaciones definidas en cada modelo mediante su método `associate`.
 *
 * El objeto `db` exportado contiene:
 *   - Un atributo por cada modelo registrado (e.g. `db.Fact_Ventas`).
 *   - `db.sequelize`: instancia de conexión activa.
 *   - `db.Sequelize`: referencia a la librería Sequelize.
 */
import fs from 'fs';
import path from 'path';

const Sequelize = require('sequelize');
const basename  = path.basename(__filename);
const env       = process.env.NODE_ENV || 'development';
import config from '../config/config';

const db: any = {};
let sequelize: any;

if (env === 'development') {
  sequelize = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password,
    {
      dialect: config.development.dialect,
      host:    config.development.host,
      define: {
        timestamps:     false, // no agrega createdAt / updatedAt
        freezeTableName: true, // evita que Sequelize pluralice los nombres de tabla
      },
    }
  );
}

// Carga y registra cada modelo encontrado en este directorio
fs
  .readdirSync(__dirname)
  .filter(file =>
    file.indexOf('.') !== 0 &&
    file !== basename &&
    file.slice(-3) === '.js' &&
    file.indexOf('.test.js') === -1
  )
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    console.log(model.name);
    db[model.name] = model;
  });

// Resuelve las asociaciones entre modelos (belongsTo / hasMany)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize; // instancia de conexión
db.Sequelize = Sequelize; // librería

export default db;