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
        ['id', 'DESC'],
        [{ model: RoutineExercise, as: 'RoutineExercises' }, 'id', 'ASC']
      ],
    });
    res.json(routines);
  } catch (error) {
    next(error); // Pasar el error al middleware central
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
        [{ model: RoutineExercise, as: 'RoutineExercises' }, 'id', 'ASC']
      ],
    });

    if (!routine) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }
    res.json(routine);
  } catch (error) {
    next(error); // Pasar el error al middleware central
  }
};

// CREAR UNA NUEVA RUTINA
export const createRoutine = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, exercises = [] } = req.body;
  const t = await sequelize.transaction();
  try {
    const newRoutine = await Routine.create({
      name,
      description,
      user_id: req.user.userId
    }, { transaction: t });

    if (exercises.length > 0) {
      const exercisesToCreate = exercises.map(ex => ({
        name: ex.name,
        muscle_group: ex.muscle_group,
        sets: ex.sets,
        reps: ex.reps,
        exercise_list_id: ex.exercise_list_id || null,
        routine_id: newRoutine.id
      }));
      await RoutineExercise.bulkCreate(exercisesToCreate, { transaction: t });
    }

    await t.commit();
    const result = await Routine.findByPk(newRoutine.id, {
      include: [{ model: RoutineExercise, as: 'RoutineExercises' }],
      order: [[{ model: RoutineExercise, as: 'RoutineExercises' }, 'id', 'ASC']]
    });
    res.status(201).json(result);
  } catch (error) {
    await t.rollback();
    next(error); // Pasar el error al middleware central
  }
};

// --- INICIO DE LA MODIFICACIÓN ---
// ACTUALIZAR UNA RUTINA (CON LÓGICA DE ACTUALIZACIÓN EN CASCADA)
export const updateRoutine = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, description, exercises = [] } = req.body;
  const t = await sequelize.transaction();
  try {
    const routine = await Routine.findOne({
      where: { id, user_id: req.user.userId },
      include: [{ model: RoutineExercise, as: 'RoutineExercises' }],
      transaction: t,
    });

    if (!routine) {
      await t.rollback();
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }
    
    const oldExercises = routine.RoutineExercises;
    const renamedExercises = [];

    // Busca ejercicios que han sido renombrados
    exercises.forEach(newEx => {
      const oldEx = oldExercises.find(old => old.id === newEx.id);
      if (oldEx && oldEx.name !== newEx.name) {
        renamedExercises.push({ oldName: oldEx.name, newName: newEx.name });
      }
    });

    await routine.update({ name, description }, { transaction: t });
    await RoutineExercise.destroy({ where: { routine_id: id }, transaction: t });

    if (exercises.length > 0) {
      const exercisesToCreate = exercises.map(ex => ({
        name: ex.name,
        muscle_group: ex.muscle_group,
        sets: ex.sets,
        reps: ex.reps,
        exercise_list_id: ex.exercise_list_id || null,
        routine_id: id
      }));
      await RoutineExercise.bulkCreate(exercisesToCreate, { transaction: t });
    }

    // Realiza la actualización en cascada si hay ejercicios renombrados
    if (renamedExercises.length > 0) {
      for (const rename of renamedExercises) {
        // 1. Actualiza los detalles de logs de entrenamientos pasados de ESTA rutina
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
            {
              where: {
                workout_log_id: { [Op.in]: workoutLogIds },
                exercise_name: rename.oldName
              },
              transaction: t
            }
          );
        }

        // 2. Actualiza los récords personales del usuario
        await PersonalRecord.update(
          { exercise_name: rename.newName },
          {
            where: {
              user_id: req.user.userId,
              exercise_name: rename.oldName
            },
            transaction: t
          }
        );
      }
    }

    await t.commit();
    const result = await Routine.findByPk(id, {
      include: [{ model: RoutineExercise, as: 'RoutineExercises' }],
      order: [[{ model: RoutineExercise, as: 'RoutineExercises' }, 'id', 'ASC']]
    });
    res.json(result);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};
// --- FIN DE LA MODIFICACIÓN ---

// ELIMINAR UNA RUTINA
export const deleteRoutine = async (req, res, next) => {
  const { id } = req.params;
  try {
    const routine = await Routine.findOne({
      where: { id, user_id: req.user.userId }
    });
    if (!routine) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }
    await routine.destroy();
    res.json({ message: 'Rutina eliminada correctamente' });
  } catch (error) {
    next(error); // Pasar el error al middleware central
  }
};

const routineController = {
  getAllRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine
};

export default routineController;