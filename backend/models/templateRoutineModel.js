import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const TemplateRoutine = sequelize.define(
  "TemplateRoutine",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: 'template_routines',
    timestamps: false, // No necesitamos timestamps para datos predefinidos
  }
);

export default TemplateRoutine;