import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const WaterLog = sequelize.define(
  "WaterLog",
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
    log_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    quantity_ml: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'water_logs',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'log_date']
      }
    ]
  }
);

export default WaterLog;