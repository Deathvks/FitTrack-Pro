import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const NutritionLog = sequelize.define('NutritionLog', {
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
      key: 'id',
    }
  },
  log_date: {
    // --- INICIO DE LA CORRECCIÓN DEFINITIVA ---
    // Se cambia de DATE a DATEONLY para que coincida con la migración
    // y se elimine la información de la hora, que es la causa del problema.
    type: DataTypes.DATEONLY,
    // --- FIN DE LA CORRECCIÓN DEFINITIVA ---
    allowNull: false,
  },
  meal_type: {
    type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack'),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  calories: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  protein_g: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
  },
  carbs_g: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
  },
  fats_g: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
  },
  weight_g: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    comment: 'Peso de la comida en gramos'
  },
}, {
  tableName: 'nutrition_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default NutritionLog;