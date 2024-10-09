import DataTypes  from 'sequelize';
import db from '../Database/db.js'

const BodegaModel = db.sequelize.define( 'Bodega', // Nombre del modelo
  {
    idbodega: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique:true
    },
  },
  {
    timestamps: false, // Desactiva timestamps automáticos
    tableName: 'bodegas'
  }
);

export default BodegaModel; // Exporta el modelo
