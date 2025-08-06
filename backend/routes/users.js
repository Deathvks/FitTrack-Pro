import express from 'express';
import { body } from 'express-validator';
import userController from '../controllers/userController.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

router.use(authenticateToken);

const profileUpdateValidationRules = [
    body('gender').isIn(['male', 'female', 'other']).withMessage('Género no válido.'),
    body('age').isInt({ min: 1, max: 120 }).withMessage('Edad no válida.'),
    body('height')
        .isFloat().withMessage('La altura debe ser un número.')
        .customSanitizer(value => {
            const num = parseFloat(String(value).replace(',', '.'));
            if (num > 0 && num < 3) return num * 100;
            return num;
        })
        .isInt({ min: 30, max: 300 }).withMessage('La altura debe estar entre 30 y 300 cm.'),
    body('activityLevel').isFloat({ min: 1, max: 2 }).withMessage('Nivel de actividad no válido.'),
    body('goal').isIn(['lose', 'maintain', 'gain']).withMessage('Objetivo no válido.'),
    body('weight').optional().isFloat({ min: 1, max: 1000 }).withMessage('El peso debe estar entre 1 y 1000 kg.')
];

const accountUpdateValidationRules = [
    body('name').trim().notEmpty().withMessage('El nombre es requerido.'),
    body('email').isEmail().withMessage('El email no es válido.').normalizeEmail(),
    body('newPassword').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres.'),
    body('currentPassword').if(body('newPassword').exists({ checkFalsy: true })).notEmpty().withMessage('La contraseña actual es requerida para establecer una nueva.')
];

router.get('/users/me', userController.getMyProfile);
router.put('/users/me', profileUpdateValidationRules, userController.updateMyProfile);

router.put('/users/me/account', accountUpdateValidationRules, userController.updateMyAccount);

export default router;