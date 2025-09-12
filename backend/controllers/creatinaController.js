import { validationResult } from 'express-validator';
import models from '../models/index.js';
import { Op } from 'sequelize';

const { CreatinaLog } = models;

export const getCreatinaLogs = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, limit = 30 } = req.query;

    let whereClause = { user_id: userId };

    if (startDate && endDate) {
      whereClause.log_date = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    const logs = await CreatinaLog.findAll({
      where: whereClause,
      order: [['log_date', 'DESC'], ['id', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({ data: logs });
  } catch (error) {
    console.error('Error en getCreatinaLogs:', error);
    next(error);
  }
};

export const createCreatinaLog = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.user.userId;
    const { log_date, grams, notes } = req.body;

    const existingLogsCount = await CreatinaLog.count({
      where: {
        user_id: userId,
        log_date: log_date
      }
    });

    if (existingLogsCount >= 2) {
      return res.status(400).json({
        error: 'Ya existen dos registros de creatina para esta fecha. No se pueden añadir más.'
      });
    }

    const log = await CreatinaLog.create({
      user_id: userId,
      log_date,
      grams,
      notes
    });

    res.status(201).json({
      message: 'Registro de creatina creado exitosamente',
      log
    });
  } catch (error) {
    console.error('Error en createCreatinaLog:', error);
    next(error);
  }
};

export const updateCreatinaLog = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { grams, notes } = req.body;

    const log = await CreatinaLog.findOne({
      where: { id, user_id: userId }
    });

    if (!log) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    await log.update({ grams, notes });

    res.json({
      message: 'Registro actualizado exitosamente',
      log
    });
  } catch (error) {
    console.error('Error en updateCreatinaLog:', error);
    next(error);
  }
};

export const deleteCreatinaLog = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const log = await CreatinaLog.findOne({
      where: { id, user_id: userId }
    });

    if (!log) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }

    await log.destroy();

    res.json({ message: 'Registro eliminado exitosamente' });
  } catch (error) {
    console.error('Error en deleteCreatinaLog:', error);
    next(error);
  }
};

export const getCreatinaLogByDate = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { date } = req.params;

    const logs = await CreatinaLog.findAll({
      where: {
        user_id: userId,
        log_date: date
      },
      order: [['id', 'ASC']]
    });

    res.json({ data: logs });
  } catch (error) {
    console.error('Error en getCreatinaLogByDate:', error);
    next(error);
  }
};

// --- INICIO DE LA MODIFICACIÓN ---
export const getCreatinaStats = async (req, res, next) => {
    try {
        const { userId } = req.user;

        const allLogs = await CreatinaLog.findAll({
            where: { user_id: userId },
            order: [['log_date', 'DESC'], ['id', 'DESC']],
        });

        if (allLogs.length === 0) {
            return res.json({
                data: { totalDays: 0, currentStreak: 0, averageGrams: 0, thisWeekDays: 0 }
            });
        }
        
        // Usamos un Map para agrupar tomas por día y sumar gramos
        const dailyTotals = new Map();
        allLogs.forEach(log => {
            const date = log.log_date;
            if (!dailyTotals.has(date)) {
                dailyTotals.set(date, 0);
            }
            dailyTotals.set(date, dailyTotals.get(date) + parseFloat(log.grams));
        });

        const uniqueDates = [...dailyTotals.keys()].sort((a, b) => new Date(b) - new Date(a));
        
        const totalDays = uniqueDates.length;
        const totalGrams = allLogs.reduce((sum, log) => sum + parseFloat(log.grams), 0);
        // El promedio debe ser por DÍA, no por TOMA.
        const averageGrams = totalDays > 0 ? totalGrams / totalDays : 0;
        
        let currentStreak = 0;
        if (uniqueDates.length > 0) {
            // Obtener la fecha de hoy en UTC para una comparación consistente
            const todayUTC = new Date(new Date().toISOString().split('T')[0]);
            const lastLogDate = new Date(uniqueDates[0]);

            const timeDiff = todayUTC.getTime() - lastLogDate.getTime();
            const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));

            if (dayDiff <= 1) {
                currentStreak = 1;
                for (let i = 0; i < uniqueDates.length - 1; i++) {
                    const date1 = new Date(uniqueDates[i]);
                    const date2 = new Date(uniqueDates[i+1]);
                    const diffDays = (date1.getTime() - date2.getTime()) / (1000 * 3600 * 24);
                    
                    if (diffDays === 1) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }
        }
        
        // Cálculo de la semana actual (de Lunes a Domingo)
        const todayForWeek = new Date();
        const dayOfWeek = todayForWeek.getUTCDay(); // 0=Dom, 1=Lun, ...
        const offset = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // Lunes es 0
        const startOfWeek = new Date(todayForWeek);
        startOfWeek.setUTCDate(todayForWeek.getUTCDate() - offset);
        startOfWeek.setUTCHours(0, 0, 0, 0);

        const thisWeekDays = uniqueDates.filter(date => new Date(date) >= startOfWeek).length;
        
        res.json({
            data: {
                totalDays,
                currentStreak,
                averageGrams, // Promedio por día, no por toma
                thisWeekDays,
            }
        });
    } catch (error) {
        console.error('Error detallado en getCreatinaStats:', error);
        next(error);
    }
};
// --- FIN DE LA MODIFICACIÓN ---

const creatinaController = {
  getCreatinaLogs,
  getCreatinaLogByDate,
  createCreatinaLog,
  updateCreatinaLog,
  deleteCreatinaLog,
  getCreatinaStats
};

export default creatinaController;