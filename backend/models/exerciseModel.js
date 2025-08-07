import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const RoutineExercise = sequelize.define(
  "RoutineExercise",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    routine_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'routines',
        key: 'id',
      }
    },
    exercise_list_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'exercise_list',
        key: 'id',
      }
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    muscle_group: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    sets: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reps: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    // --- INICIO DE LA MODIFICACIÓN ---
    superset_group_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    exercise_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // --- FIN DE LA MODIFICACIÓN ---
  },
  {
    tableName: 'routine_exercises',
    timestamps: false,
  }
);

export default RoutineExercise;