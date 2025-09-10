import { validationResult } from 'express-validator';
import models from '../models/index.js';
import { Op } from 'sequelize';

const { Routine, RoutineExercise, WorkoutLog, WorkoutLogDetail, PersonalRecord, sequelize } = models;

// OBTENER TODAS LAS RUTINAS
export const getAllRoutines = async (req, res, next) => {
  try {
    const routines = await Routine.findAll({
      where: { user_id: req.user.userId },
      include: [
        {
          model: RoutineExercise,
          as: 'RoutineExercises',
          required: false,
        }
      ],
      order: [
        ['id', 'ASC'],
        ['RoutineExercises', 'id', 'ASC'],
      ],
    });
    res.json(routines);
  } catch (error) {
    next(error);
  }
};

// OBTENER UNA RUTINA ESPECÍFICA POR ID
export const getRoutineById = async (req, res, next) => {
  try {
    const routine = await Routine.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.userId
      },
      include: [{
        model: RoutineExercise,
        as: 'RoutineExercises'
      }],
      order: [
        ['RoutineExercises', 'id', 'ASC']
      ],
    });

    if (!routine) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }
    res.json(routine);
  } catch (error) {
    next(error);
  }
};

const processAndSaveExercises = async (exercises, routineId, transaction) => {
  if (exercises.length > 0) {
    const exercisesToCreate = exercises.map(ex => ({
      name: ex.name,
      muscle_group: ex.muscle_group,
      sets: ex.sets,
      reps: ex.reps,
      exercise_list_id: ex.exercise_list_id || null,
      routine_id: routineId,
      superset_group_id: ex.superset_group_id,
      exercise_order: ex.exercise_order,
    }));
    await RoutineExercise.bulkCreate(exercisesToCreate, { transaction });
  }
};


// CREAR UNA NUEVA RUTINA
export const createRoutine = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, exercises = [] } = req.body;
  const { userId } = req.user;
  const t = await sequelize.transaction();

  try {
    const existingRoutine = await Routine.findOne({
      where: { name, user_id: userId },
      transaction: t
    });

    if (existingRoutine) {
      await t.rollback();
      return res.status(409).json({ error: 'Ya existe una rutina con este nombre.' });
    }

    const newRoutine = await Routine.create({
      name,
      description,
      user_id: userId
    }, { transaction: t });

    await processAndSaveExercises(exercises, newRoutine.id, t);

    await t.commit();
    const result = await Routine.findByPk(newRoutine.id, {
      include: [{ model: RoutineExercise, as: 'RoutineExercises' }],
      order: [
        ['RoutineExercises', 'id', 'ASC']
      ]
    });
    res.status(201).json(result);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// ACTUALIZAR UNA RUTINA
export const updateRoutine = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, description, exercises = [] } = req.body;
  const { userId } = req.user;
  const t = await sequelize.transaction();

  try {
    const existingRoutine = await Routine.findOne({
        where: {
            name,
            user_id: userId,
            id: { [Op.ne]: id }
        },
        transaction: t
    });

    if (existingRoutine) {
        await t.rollback();
        return res.status(409).json({ error: 'Ya existe otra rutina con este nombre.' });
    }

    const routine = await Routine.findOne({
      where: { id, user_id: userId },
      include: [{ model: RoutineExercise, as: 'RoutineExercises' }],
      transaction: t,
    });

    if (!routine) {
      await t.rollback();
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }
    
    const oldExercises = routine.RoutineExercises;
    const renamedExercises = [];
    exercises.forEach(newEx => {
      const oldEx = oldExercises.find(old => old.id === newEx.id);
      if (oldEx && oldEx.name !== newEx.name) {
        renamedExercises.push({ oldName: oldEx.name, newName: newEx.name });
      }
    });

    await routine.update({ name, description }, { transaction: t });
    await RoutineExercise.destroy({ where: { routine_id: id }, transaction: t });
    
    await processAndSaveExercises(exercises, id, t);

    if (renamedExercises.length > 0) {
        for (const rename of renamedExercises) {
            const workoutLogsForRoutine = await WorkoutLog.findAll({
              where: { routine_id: id, user_id: req.user.userId },
              attributes: ['id'],
              raw: true,
              transaction: t
            });
            const workoutLogIds = workoutLogsForRoutine.map(log => log.id);
    
            if (workoutLogIds.length > 0) {
              await WorkoutLogDetail.update(
                { exercise_name: rename.newName },
                { where: { workout_log_id: { [Op.in]: workoutLogIds }, exercise_name: rename.oldName }, transaction: t }
              );
            }
    
            await PersonalRecord.update(
              { exercise_name: rename.newName },
              { where: { user_id: req.user.userId, exercise_name: rename.oldName }, transaction: t }
            );
        }
    }

    await t.commit();
    const result = await Routine.findByPk(id, {
      include: [{ model: RoutineExercise, as: 'RoutineExercises' }],
      order: [
        ['RoutineExercises', 'id', 'ASC']
      ]
    });
    res.json(result);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// --- INICIO DE LA CORRECCIÓN ---
// ELIMINAR UNA RUTINA
export const deleteRoutine = async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;
  const t = await sequelize.transaction();

  try {
    const routine = await Routine.findOne({
      where: { id, user_id: userId },
      transaction: t
    });

    if (!routine) {
      await t.rollback();
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }

    // 1. Recolectar todos los detalles de los entrenamientos que se van a borrar
    const logsToDelete = await WorkoutLog.findAll({
      where: { routine_id: id, user_id: userId },
      include: [{ model: WorkoutLogDetail, as: 'WorkoutLogDetails' }],
      transaction: t
    });
    const detailsToDelete = logsToDelete.flatMap(log => log.WorkoutLogDetails);
    const affectedExercises = [...new Set(detailsToDelete.map(d => d.exercise_name))];

    // 2. Eliminar la rutina (esto borrará en cascada los logs, detalles y series)
    await routine.destroy({ transaction: t });

    // 3. Recalcular PRs para los ejercicios afectados
    for (const exerciseName of affectedExercises) {
      const currentPR = await PersonalRecord.findOne({
        where: { user_id: userId, exercise_name: exerciseName },
        transaction: t
      });

      if (currentPR) {
        // Buscar el nuevo mejor set en el resto de entrenamientos (los que no hemos borrado)
        const newBestLogDetail = await WorkoutLogDetail.findOne({
          include: [{
            model: WorkoutLog,
            as: 'WorkoutLog',
            where: { user_id: userId },
            attributes: []
          }],
          where: { exercise_name: exerciseName },
          order: [['best_set_weight', 'DESC']],
          transaction: t
        });

        if (newBestLogDetail) {
          // Si encontramos un nuevo mejor, actualizamos el PR
          const newBestWorkout = await WorkoutLog.findByPk(newBestLogDetail.workout_log_id, { attributes: ['workout_date'], transaction: t });
          currentPR.weight_kg = newBestLogDetail.best_set_weight;
          currentPR.date = newBestWorkout.workout_date;
          await currentPR.save({ transaction: t });
        } else {
          // Si no quedan registros para ese ejercicio, borramos el PR
          await currentPR.destroy({ transaction: t });
        }
      }
    }

    await t.commit();
    res.json({ message: 'Rutina y su historial eliminados, récords recalculados.' });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
// --- FIN DE LA CORRECCIÓN ---

const routineController = {
  getAllRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine
};

export default routineController;