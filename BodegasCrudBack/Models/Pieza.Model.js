import DataTypes from "sequelize";
import db from "../Database/db.js";

const sequelize = db.sequelize;

const Pieza = sequelize.define("Piezas",
  {
    idpieza: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    serial: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "piezas",
  }
);

export default Pieza;