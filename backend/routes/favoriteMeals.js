import express from 'express';
import { body } from 'express-validator';
import favoriteMealController from '../controllers/favoriteMealController.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// Todas las rutas de este fichero requieren que el usuario esté autenticado
router.use(authenticateToken);

// --- Reglas de Validación para Crear/Actualizar una Comida Favorita ---
const favoriteMealValidationRules = [
  body('name').trim().notEmpty().withMessage('El nombre de la comida es requerido.'),
  body('calories').isInt({ min: 0 }).withMessage('Las calorías deben ser un número positivo.'),
  body('protein_g').optional().isFloat({ min: 0 }).withMessage('Las proteínas deben ser un número positivo.'),
  body('carbs_g').optional().isFloat({ min: 0 }).withMessage('Los carbohidratos deben ser un número positivo.'),
  body('fats_g').optional().isFloat({ min: 0 }).withMessage('Las grasas deben ser un número positivo.'),
  // --- INICIO DE LA MODIFICACIÓN ---
  body('weight_g').optional().isFloat({ min: 0 }).withMessage('Los gramos deben ser un número positivo.'),
  // --- FIN DE LA MODIFICACIÓN ---
];

// --- Definición de Rutas ---

// GET /api/meals -> Obtener todas las comidas favoritas del usuario
router.get('/meals', favoriteMealController.getFavoriteMeals);

// POST /api/meals -> Crear una nueva comida favorita
router.post('/meals', favoriteMealValidationRules, favoriteMealController.createFavoriteMeal);

// DELETE /api/meals/:mealId -> Eliminar una comida favorita
router.delete('/meals/:mealId', favoriteMealController.deleteFavoriteMeal);

export default router;