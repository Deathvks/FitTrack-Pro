import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const CreatinaLog = sequelize.define(
  "CreatinaLog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    log_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    grams: {
      type: DataTypes.DECIMAL(5, 2), // Hasta 999.99 gramos
      allowNull: false,
      validate: {
        min: 0.1,
        max: 999.99
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    tableName: 'creatina_logs',
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at',
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se elimina el índice único para permitir múltiples registros por día.
    // indexes: [
    //   {
    //     unique: true,
    //     fields: ['user_id', 'log_date']
    //   }
    // ]
    // --- FIN DE LA MODIFICACIÓN ---
  }
);

export default CreatinaLog;