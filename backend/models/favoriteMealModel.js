import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const FavoriteMeal = sequelize.define(
  "FavoriteMeal",
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
        key: 'id',
      }
    },
    name: {
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
  },
  {
    tableName: 'favorite_meals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default FavoriteMeal;