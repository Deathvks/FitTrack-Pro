import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const WorkoutLogSet = sequelize.define(
  "WorkoutLogSet",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    log_detail_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'workout_log_details', // Se enlaza con el detalle del ejercicio
        key: 'id',
      }
    },
    set_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reps: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    weight_kg: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
    },
    // --- INICIO DE LA MODIFICACIÓN ---
    is_dropset: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // --- FIN DE LA MODIFICACIÓN ---
  },
  {
    tableName: 'workout_log_sets',
    timestamps: false,
  }
);

export default WorkoutLogSet;