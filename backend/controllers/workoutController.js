import { validationResult } from 'express-validator';
import models from '../models/index.js';

const { WorkoutLog, WorkoutLogDetail, WorkoutLogSet, PersonalRecord, sequelize } = models;

export const getWorkoutHistory = async (req, res, next) => {
  try {
    const history = await WorkoutLog.findAll({
      where: { user_id: req.user.userId },
      include: [{
        model: WorkoutLogDetail,
        as: 'WorkoutLogDetails',
        include: [{
          model: WorkoutLogSet,
          as: 'WorkoutLogSets',
          order: [['set_number', 'ASC']],
        }],
        order: [['id', 'ASC']],
      }],
      order: [['workout_date', 'DESC']],
    });
    res.json(history);
  } catch (error) {
    next(error);
  }
};

export const logWorkoutSession = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { routineName, duration_seconds, calories_burned, details, notes, routineId } = req.body;
  const { userId } = req.user;
  const t = await sequelize.transaction();

  try {
    const newWorkoutLog = await WorkoutLog.create({
      user_id: userId,
      routine_name: routineName,
      routine_id: routineId,
      workout_date: new Date(),
      duration_seconds,
      calories_burned, // <-- CAMBIO: Se añade el valor de calorías
      notes
    }, { transaction: t });

    let newPRs = [];

    for (const exercise of details) {
      let totalVolume = 0;
      let bestSetWeight = 0;

      if (exercise.setsDone && exercise.setsDone.length > 0) {
        exercise.setsDone.forEach(set => {
          const weight = parseFloat(set.weight_kg) || 0;
          const reps = parseInt(set.reps, 10) || 0;
          totalVolume += weight * reps;
          if (weight > bestSetWeight) {
            bestSetWeight = weight;
          }
        });
      }

      const newLogDetail = await WorkoutLogDetail.create({
        workout_log_id: newWorkoutLog.id,
        exercise_name: exercise.exerciseName,
        total_volume: totalVolume,
        best_set_weight: bestSetWeight,
        superset_group_id: exercise.superset_group_id,
      }, { transaction: t });

      if (exercise.setsDone && exercise.setsDone.length > 0) {
        const setsToCreate = exercise.setsDone.map(set => ({
          log_detail_id: newLogDetail.id,
          set_number: set.set_number,
          reps: set.reps,
          weight_kg: set.weight_kg,
          is_dropset: set.is_dropset || false,
        }));
        await WorkoutLogSet.bulkCreate(setsToCreate, { transaction: t });
      }

      if (bestSetWeight > 0) {
        const existingPR = await PersonalRecord.findOne({
          where: {
            user_id: userId,
            exercise_name: exercise.exerciseName
          },
          transaction: t
        });

        if (!existingPR) {
          await PersonalRecord.create({
            user_id: userId,
            exercise_name: exercise.exerciseName,
            weight_kg: bestSetWeight,
            date: new Date()
          }, { transaction: t });
          newPRs.push({ exercise: exercise.exerciseName, weight: bestSetWeight });
        } else if (bestSetWeight > existingPR.weight_kg) {
          existingPR.weight_kg = bestSetWeight;
          existingPR.date = new Date();
          await existingPR.save({ transaction: t });
          newPRs.push({ exercise: exercise.exerciseName, weight: bestSetWeight });
        }
      }
    }

    await t.commit();
    res.status(201).json({
      message: 'Entrenamiento guardado con éxito',
      workoutId: newWorkoutLog.id,
      newPRs: newPRs
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

export const updateWorkoutLog = async (req, res) => {
  res.status(501).json({ error: 'Funcionalidad de editar no implementada todavía.' });
};

export const deleteWorkoutLog = async (req, res, next) => {
  const { workoutId } = req.params;
  const { userId } = req.user;
  const t = await sequelize.transaction();

  try {
    const workoutLog = await WorkoutLog.findOne({
      where: { id: workoutId, user_id: userId },
      include: [{ model: WorkoutLogDetail, as: 'WorkoutLogDetails' }],
      transaction: t
    });

    if (!workoutLog) {
      await t.rollback();
      return res.status(404).json({ error: 'Registro de entrenamiento no encontrado.' });
    }

    const exercisesInWorkout = workoutLog.WorkoutLogDetails;

    await workoutLog.destroy({ transaction: t });

    for (const exercise of exercisesInWorkout) {
      const currentPR = await PersonalRecord.findOne({
        where: { user_id: userId, exercise_name: exercise.exercise_name },
        transaction: t
      });

      if (currentPR && currentPR.weight_kg == exercise.best_set_weight) {
        const newBestLogDetail = await WorkoutLogDetail.findOne({
          include: [{
            model: WorkoutLog,
            where: { user_id: userId },
            attributes: []
          }],
          where: { exercise_name: exercise.exercise_name },
          order: [['best_set_weight', 'DESC']],
          transaction: t
        });

        if (newBestLogDetail) {
          const workoutDate = await WorkoutLog.findByPk(newBestLogDetail.workout_log_id, { attributes: ['workout_date'], transaction: t });
          currentPR.weight_kg = newBestLogDetail.best_set_weight;
          currentPR.date = workoutDate.workout_date;
          await currentPR.save({ transaction: t });
        } else {
          await currentPR.destroy({ transaction: t });
        }
      }
    }

    await t.commit();
    res.json({ message: 'Entrenamiento eliminado y récords recalculados correctamente.' });

  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const workoutController = {
  getWorkoutHistory,
  logWorkoutSession,
  updateWorkoutLog,
  deleteWorkoutLog
};

export default workoutController;