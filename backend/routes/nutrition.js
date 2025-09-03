import express from 'express';
import { body } from 'express-validator';
import nutritionController from '../controllers/nutritionController.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// Todas las rutas en este fichero requieren que el usuario esté autenticado
router.use(authenticateToken);

// --- Reglas de Validación ---

const addNutritionLogRules = [
    body('log_date').isISO8601().toDate().withMessage('La fecha no es válida.'),
    body('meal_type').isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('El tipo de comida no es válido.'),
    body('description').trim().notEmpty().withMessage('La descripción es requerida.'),
    body('calories').isInt({ min: 0 }).withMessage('Las calorías deben ser un número positivo.'),
    body('protein_g').optional().isFloat({ min: 0 }).withMessage('Las proteínas deben ser un número positivo.'),
    body('carbs_g').optional().isFloat({ min: 0 }).withMessage('Los carbohidratos deben ser un número positivo.'),
    body('fats_g').optional().isFloat({ min: 0 }).withMessage('Las grasas deben ser un número positivo.'),
];

const updateNutritionLogRules = [
    body('description').trim().notEmpty().withMessage('La descripción es requerida.'),
    body('calories').isInt({ min: 0 }).withMessage('Las calorías deben ser un número positivo.'),
    body('protein_g').optional().isFloat({ min: 0 }).withMessage('Las proteínas deben ser un número positivo.'),
    body('carbs_g').optional().isFloat({ min: 0 }).withMessage('Los carbohidratos deben ser un número positivo.'),
    body('fats_g').optional().isFloat({ min: 0 }).withMessage('Las grasas deben ser un número positivo.'),
];

const upsertWaterLogRules = [
    body('log_date').isISO8601().toDate().withMessage('La fecha no es válida.'),
    body('quantity_ml').isInt({ min: 0 }).withMessage('La cantidad de agua debe ser un número positivo.'),
];


// --- Rutas ---

// GET /api/nutrition?date=YYYY-MM-DD -> Obtener logs de un día
router.get('/nutrition', nutritionController.getLogsByDate);

// --- INICIO DE LA MODIFICACIÓN ---
// GET /api/nutrition/summary?month=M&year=YYYY -> Obtener resumen de un mes
router.get('/nutrition/summary', nutritionController.getNutritionSummary);
// --- FIN DE LA MODIFICACIÓN ---

// POST /api/nutrition/food -> Añadir una comida
router.post('/nutrition/food', addNutritionLogRules, nutritionController.addNutritionLog);

// PUT /api/nutrition/food/:logId -> Actualizar una comida
router.put('/nutrition/food/:logId', updateNutritionLogRules, nutritionController.updateNutritionLog);

// DELETE /api/nutrition/food/:logId -> Eliminar una comida
router.delete('/nutrition/food/:logId', nutritionController.deleteNutritionLog);

// POST /api/nutrition/water -> Añadir o actualizar el agua de un día
router.post('/nutrition/water', upsertWaterLogRules, nutritionController.upsertWaterLog);


export default router;