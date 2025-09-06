import express from 'express';
import { check } from 'express-validator';
import authController from '../controllers/authController.js';
import rateLimit from 'express-rate-limit';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20, 
	message: 'Demasiados intentos de inicio de sesión desde esta IP, por favor intente de nuevo después de 15 minutos',
    standardHeaders: true,
	legacyHeaders: false,
});

// Ruta para registro con verificación
router.post('/register', authLimiter, [
    check('name', 'El nombre es requerido').not().isEmpty().trim(),
    check('email', 'Por favor, incluye un email válido').isEmail().normalizeEmail(),
    check('password', 'La contraseña debe tener 6 o más caracteres').isLength({ min: 6 })
], authController.register);

// Nueva ruta para verificar email
router.post('/verify-email', authLimiter, [
    check('email', 'Por favor, incluye un email válido').isEmail().normalizeEmail(),
    check('code', 'El código de verificación es requerido').not().isEmpty().trim()
], authController.verifyEmail);

router.post('/resend-verification', [
    check('email', 'Por favor, incluye un email válido').isEmail().normalizeEmail()
], authController.resendVerificationEmail);
router.put('/update-email-verification', authenticateToken, authController.updateEmailForVerification);

router.post('/login', authLimiter, [
    check('email', 'Por favor, incluye un email válido').isEmail().normalizeEmail(),
    check('password', 'La contraseña es requerida').not().isEmpty()
], authController.loginUser);

router.post('/logout', authController.logoutUser);

export default router;