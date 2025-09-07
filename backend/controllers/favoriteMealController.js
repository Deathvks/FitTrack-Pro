import { validationResult } from 'express-validator';
import models from '../models/index.js';

const { FavoriteMeal } = models;

// --- OBTENER TODAS LAS COMIDAS FAVORITAS DE UN USUARIO ---
export const getFavoriteMeals = async (req, res, next) => {
  try {
    const meals = await FavoriteMeal.findAll({
      where: { user_id: req.user.userId },
      order: [['name', 'ASC']],
    });
    res.json(meals);
  } catch (error) {
    next(error);
  }
};

// --- CREAR UNA NUEVA COMIDA FAVORITA ---
export const createFavoriteMeal = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // --- INICIO DE LA MODIFICACIÓN ---
  const { name, calories, protein_g, carbs_g, fats_g, weight_g } = req.body;
  // --- FIN DE LA MODIFICACIÓN ---
  const { userId } = req.user;

  try {
    const newMeal = await FavoriteMeal.create({
      user_id: userId,
      name,
      calories,
      protein_g,
      carbs_g,
      fats_g,
      // --- INICIO DE LA MODIFICACIÓN ---
      weight_g,
      // --- FIN DE LA MODIFICACIÓN ---
    });
    res.status(201).json(newMeal);
  } catch (error) {
    // Captura el error de restricción única para evitar duplicados
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Ya existe una comida guardada con este nombre.' });
    }
    next(error);
  }
};

// --- ELIMINAR UNA COMIDA FAVORITA ---
export const deleteFavoriteMeal = async (req, res, next) => {
  const { mealId } = req.params;
  const { userId } = req.user;

  try {
    const meal = await FavoriteMeal.findOne({
      where: { id: mealId, user_id: userId },
    });

    if (!meal) {
      return res.status(404).json({ error: 'Comida no encontrada.' });
    }

    await meal.destroy();
    res.json({ message: 'Comida eliminada de tus favoritos.' });
  } catch (error) {
    next(error);
  }
};

const favoriteMealController = {
  getFavoriteMeals,
  createFavoriteMeal,
  deleteFavoriteMeal,
};

export default favoriteMealController;