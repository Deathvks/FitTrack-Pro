import { validationResult } from 'express-validator';
import models from '../models/index.js';
import { Op, Sequelize } from 'sequelize';

const { NutritionLog, WaterLog } = models;

// Obtener todos los registros de nutrición y agua para una fecha específica
export const getLogsByDate = async (req, res, next) => {
  try {
    const { date } = req.query; // Formato YYYY-MM-DD
    const { userId } = req.user;

    if (!date) {
      return res.status(400).json({ error: 'Se requiere una fecha.' });
    }

    const nutritionLogs = await NutritionLog.findAll({
      where: {
        user_id: userId,
        log_date: date,
      },
      order: [['created_at', 'ASC']],
    });

    const waterLog = await WaterLog.findOne({
      where: {
        user_id: userId,
        log_date: date,
      },
    });

    res.json({
      nutrition: nutritionLogs,
      water: waterLog || { quantity_ml: 0 },
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un resumen de nutrición para un mes específico
export const getNutritionSummary = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        const { userId } = req.user;

        if (!month || !year) {
            return res.status(400).json({ error: 'Se requiere mes y año.' });
        }
        
        const monthNumber = parseInt(month, 10);
        const yearNumber = parseInt(year, 10);

        const startDate = `${yearNumber}-${String(monthNumber).padStart(2, '0')}-01`;
        
        let nextMonth = monthNumber + 1;
        let nextYear = yearNumber;
        if (nextMonth > 12) {
            nextMonth = 1;
            nextYear += 1;
        }
        const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
        
        const dateFormatted = Sequelize.fn('DATE_FORMAT', Sequelize.col('log_date'), '%Y-%m-%d');

        const nutritionSummary = await NutritionLog.findAll({
            attributes: [
                [dateFormatted, 'date'],
                [Sequelize.fn('SUM', Sequelize.col('calories')), 'total_calories'],
                [Sequelize.fn('SUM', Sequelize.col('protein_g')), 'total_protein'],
                [Sequelize.fn('SUM', Sequelize.col('carbs_g')), 'total_carbs'],
                [Sequelize.fn('SUM', Sequelize.col('fats_g')), 'total_fats'],
            ],
            where: {
                user_id: userId,
                log_date: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate,
                }
            },
            group: [dateFormatted],
            order: [[dateFormatted, 'ASC']],
            raw: true,
        });

        const waterSummary = await WaterLog.findAll({
            where: {
                user_id: userId,
                log_date: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate,
                },
            },
            order: [['log_date', 'ASC']],
            raw: true,
        });

        res.json({ nutritionSummary, waterSummary });
    } catch (error) {
        next(error);
    }
};


// Añadir un nuevo registro de comida
export const addNutritionLog = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { userId } = req.user;
    const { log_date, meal_type, description, calories, protein_g, carbs_g, fats_g, weight_g } = req.body;
    const newLog = await NutritionLog.create({
      user_id: userId, log_date, meal_type, description, calories, protein_g, carbs_g, fats_g, weight_g
    });
    res.status(201).json(newLog);
  } catch (error) {
    next(error);
  }
};

// Actualizar un registro de comida
export const updateNutritionLog = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }
    try {
        const { logId } = req.params;
        const { userId } = req.user;
        const { description, calories, protein_g, carbs_g, fats_g, weight_g } = req.body;
        const log = await NutritionLog.findOne({ where: { id: logId, user_id: userId } });
        if (!log) { return res.status(404).json({ error: 'Registro de comida no encontrado.' }); }
        await log.update({ description, calories, protein_g, carbs_g, fats_g, weight_g });
        res.json(log);
    } catch (error) {
        next(error);
    }
};

// Eliminar un registro de comida
export const deleteNutritionLog = async (req, res, next) => {
  try {
    const { logId } = req.params;
    const { userId } = req.user;
    const log = await NutritionLog.findOne({ where: { id: logId, user_id: userId } });
    if (!log) { return res.status(404).json({ error: 'Registro de comida no encontrado.' }); }
    await log.destroy();
    res.json({ message: 'Registro de comida eliminado.' });
  } catch (error) {
    next(error);
  }
};

// Añadir o actualizar el registro de agua del día
export const upsertWaterLog = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }
  try {
    const { userId } = req.user;
    const { log_date, quantity_ml } = req.body;
    const [waterLog, created] = await WaterLog.findOrCreate({
      where: { user_id: userId, log_date: log_date },
      defaults: { quantity_ml: quantity_ml }
    });
    if (!created) {
      waterLog.quantity_ml = quantity_ml;
      await waterLog.save();
    }
    res.json(waterLog);
  } catch (error) {
    next(error);
  }
};

const nutritionController = {
    getLogsByDate,
    getNutritionSummary,
    addNutritionLog,
    updateNutritionLog,
    deleteNutritionLog,
    upsertWaterLog
};

export default nutritionController;