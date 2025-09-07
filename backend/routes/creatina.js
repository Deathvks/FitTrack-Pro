import express from 'express';
import { body } from 'express-validator';
import authenticateToken from '../middleware/authenticateToken.js';
import {
  getCreatinaLogs,
  getCreatinaLogByDate, // Añadir esta importación
  createCreatinaLog,
  updateCreatinaLog,
  deleteCreatinaLog,
  getCreatinaStats
} from '../controllers/creatinaController.js';

const router = express.Router();

// Validaciones
const validateCreatinaLog = [
  body('log_date')
    .isDate()
    .withMessage('Fecha inválida'),
  body('grams')
    .isFloat({ min: 0.1, max: 999.99 })
    .withMessage('Los gramos deben estar entre 0.1 y 999.99'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
];

const validateCreatinaUpdate = [
  body('grams')
    .isFloat({ min: 0.1, max: 999.99 })
    .withMessage('Los gramos deben estar entre 0.1 y 999.99'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres')
];

// Rutas protegidas
router.use(authenticateToken);

// GET /api/creatina - Obtener registros
router.get('/', getCreatinaLogs);

// GET /api/creatina/stats - Obtener estadísticas
router.get('/stats', getCreatinaStats);

// GET /api/creatina/:date - Obtener registro por fecha específica
router.get('/:date', getCreatinaLogByDate); // Añadir esta ruta

// POST /api/creatina - Crear registro
router.post('/', validateCreatinaLog, createCreatinaLog);

// PUT /api/creatina/:id - Actualizar registro
router.put('/:id', validateCreatinaUpdate, updateCreatinaLog);

// DELETE /api/creatina/:id - Eliminar registro
router.delete('/:id', deleteCreatinaLog);

export default router;