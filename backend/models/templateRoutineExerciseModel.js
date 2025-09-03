import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const TemplateRoutineExercise = sequelize.define(
  "TemplateRoutineExercise",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    template_routine_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'template_routines',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    sets: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reps: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: 'template_routine_exercises',
    timestamps: false,
  }
);

export default TemplateRoutineExercise;