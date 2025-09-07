import sequelize from "../db.js";

// 1. Importa todos los modelos
import User from './userModel.js';
import Routine from './routineModel.js';
import RoutineExercise from './exerciseModel.js';
import WorkoutLog from './workoutModel.js';
import BodyWeightLog from './bodyweightModel.js';
import WorkoutLogDetail from './workoutLogDetailModel.js';
import WorkoutLogSet from './workoutLogSetModel.js';
import ExerciseList from './exerciseListModel.js';
import PersonalRecord from './personalRecordModel.js';
import NutritionLog from './nutritionLogModel.js';
import WaterLog from './waterLogModel.js';
import FavoriteMeal from './favoriteMealModel.js';
import CreatinaLog from './creatinaLogModel.js';
// --- INICIO DE LA MODIFICACIÓN ---
import TemplateRoutine from './templateRoutineModel.js';
import TemplateRoutineExercise from './templateRoutineExerciseModel.js';
// --- FIN DE LA MODIFICACIÓN ---


// 2. Configuración de las asociaciones (relaciones) con sus alias
User.hasMany(Routine, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'Routines' });
Routine.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(WorkoutLog, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'WorkoutLogs' });
WorkoutLog.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(BodyWeightLog, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'BodyWeightLogs' });
BodyWeightLog.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(NutritionLog, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'NutritionLogs' });
NutritionLog.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(WaterLog, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'WaterLogs' });
WaterLog.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(FavoriteMeal, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'FavoriteMeals' });
FavoriteMeal.belongsTo(User, { foreignKey: 'user_id' });

Routine.hasMany(RoutineExercise, { foreignKey: 'routine_id', onDelete: 'CASCADE', as: 'RoutineExercises' });
RoutineExercise.belongsTo(Routine, { foreignKey: 'routine_id' });

WorkoutLog.hasMany(WorkoutLogDetail, { foreignKey: 'workout_log_id', onDelete: 'CASCADE', as: 'WorkoutLogDetails' });
WorkoutLogDetail.belongsTo(WorkoutLog, { foreignKey: 'workout_log_id' });

WorkoutLogDetail.hasMany(WorkoutLogSet, { foreignKey: 'log_detail_id', onDelete: 'CASCADE', as: 'WorkoutLogSets' });
WorkoutLogSet.belongsTo(WorkoutLogDetail, { foreignKey: 'log_detail_id' });

ExerciseList.hasMany(RoutineExercise, { foreignKey: 'exercise_list_id' });
RoutineExercise.belongsTo(ExerciseList, { foreignKey: 'exercise_list_id' });

User.hasMany(PersonalRecord, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'PersonalRecords' });
PersonalRecord.belongsTo(User, { foreignKey: 'user_id' });

// --- INICIO DE LA MODIFICACIÓN ---
// Se añade la nueva relación: una rutina predefinida tiene muchos ejercicios predefinidos.
TemplateRoutine.hasMany(TemplateRoutineExercise, { foreignKey: 'template_routine_id', as: 'TemplateRoutineExercises' });
TemplateRoutineExercise.belongsTo(TemplateRoutine, { foreignKey: 'template_routine_id' });
// --- FIN DE LA MODIFICACIÓN ---

// 3. Exporta un único objeto que contiene todos los modelos
// Definir asociaciones
User.hasMany(CreatinaLog, { foreignKey: 'user_id', as: 'creatinaLogs' });
CreatinaLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
const models = {
    sequelize,
    User,
    Routine,
    RoutineExercise,
    WorkoutLog,
    WorkoutLogDetail,
    WorkoutLogSet,
    BodyWeightLog,
    ExerciseList,
    PersonalRecord,
    NutritionLog,
    WaterLog,
    FavoriteMeal,
    // --- INICIO DE LA MODIFICACIÓN ---
    TemplateRoutine,
    TemplateRoutineExercise,
    // --- FIN DE LA MODIFICACIÓN ---
    CreatinaLog
};

export default models;