import express from 'express';
import templateRoutineController from '../controllers/templateRoutineController.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// Todas las rutas de este fichero requieren que el usuario esté autenticado
router.use(authenticateToken);

// --- Definición de Rutas ---

// GET /api/template-routines -> Obtener todas las rutinas predefinidas
router.get('/template-routines', templateRoutineController.getAllTemplateRoutines);

export default router;