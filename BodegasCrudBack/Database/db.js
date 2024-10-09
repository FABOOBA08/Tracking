import { Sequelize } 
from 'sequelize';
import dbConfig from '../Config/Db.config.js'; // Asegúrate de tener este archivo correctamente configurado

const sequelize = new Sequelize( dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD,{
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle,
    },
  }
);

const db = {};
db.Sequelize = Sequelize; // Referencia a la clase Sequelize
db.sequelize = sequelize; // Referencia a la instancia

export default db; // Asegúrate de exportar `db` correctamente
