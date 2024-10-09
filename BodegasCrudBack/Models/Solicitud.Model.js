import { DataTypes } from 'sequelize';
import db from '../Database/db.js';
import User from './User.Model.js';
import { Caja } from '../Models/Caja.Model.js';

const Solicitud = db.sequelize.define('Solicitud', {
  idsolicitud: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada'),
    defaultValue: 'pendiente',
  },
  fecha_solicitud: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    get() {
      const date = new Date(this.getDataValue('fecha_solicitud'));
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
    },
  },
  fecha_aprobacion: {
    type: DataTypes.DATE,
    allowNull: true,
    get() {
      const date = new Date(this.getDataValue('fecha_aprobacion'));
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
    },
  },
  solicitante_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  aprobador_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  solicitante_username: {
    type: DataTypes.STRING,
  },
  aprobador_username: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: false,
  tableName: 'solicitudes_cajas',
});

Solicitud.belongsTo(User, { foreignKey: 'solicitante_id', as: 'Solicitante' });
Solicitud.belongsTo(User, { foreignKey: 'aprobador_id', as: 'Aprobador' });
Solicitud.belongsTo(Caja, { foreignKey: 'idcaja' });

export default Solicitud;
