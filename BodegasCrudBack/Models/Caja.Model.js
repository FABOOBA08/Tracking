  import { DataTypes } from "sequelize";
  import db from "../Database/db.js";
  import Pieza from "../Models/Pieza.Model.js";
  import Bodega from "../Models/Bodega.Model.js";

  const sequelize = db.sequelize;

  const Caja = sequelize.define('Cajas',{
      idcaja: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      estado: {
        type: DataTypes.ENUM(
          "abierta",
          "cerrada",
          "solicitada"
        ),
        defaultValue: "abierta", 
      },
    },
    {
      timestamps: false,
      tableName: "cajas",
    }
  );

  const CajaPieza = sequelize.define(
    "CajaPieza",
    {
      idcaja: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      idpieza: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      tableName: "caja_piezas",
    }
  );


  Caja.belongsTo(Bodega, { foreignKey: "idbodega" }); 
  Caja.belongsToMany(Pieza, { through: CajaPieza, foreignKey: "idcaja" });
  Pieza.belongsToMany(Caja, { through: CajaPieza, foreignKey: "idpieza" });

  export { Caja, CajaPieza };
