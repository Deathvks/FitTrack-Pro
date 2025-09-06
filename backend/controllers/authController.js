import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import models from '../models/index.js';
import { generateVerificationCode, sendVerificationEmail } from '../services/emailService.js';

const { User } = models;

// Almacén temporal para códigos de verificación
const verificationCodes = new Map();

// Iniciar sesión de usuario
export const loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'La cuenta no existe.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ message: 'Inicio de sesión exitoso.', token });

  } catch (error) {
    next(error);
  }
};

// Cerrar sesión de usuario
export const logoutUser = (req, res) => {
  res.json({ message: 'Cierre de sesión exitoso.' });
};

// Registro con verificación por email
export const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;
    
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    // Generar y enviar código
    const verificationCode = generateVerificationCode();
    const emailResult = await sendVerificationEmail(email, verificationCode);
    
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Error enviando código de verificación' });
    }
    
    // Guardar código temporalmente (expira en 10 minutos)
    verificationCodes.set(email, {
      code: verificationCode,
      userData: { name, email, password },
      expires: Date.now() + 10 * 60 * 1000 // 10 minutos
    });
    
    res.status(200).json({ 
      message: 'Código de verificación enviado al email',
      email: email
    });
    
  } catch (error) {
    console.error('Error en registro:', error);
    next(error);
  }
};

// Verificar código y crear o actualizar usuario
export const verifyEmail = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, code } = req.body;
    
    const storedData = verificationCodes.get(email);
    
    if (!storedData) {
      return res.status(400).json({ error: 'Código no encontrado o expirado' });
    }
    
    if (Date.now() > storedData.expires) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: 'Código expirado' });
    }
    
    if (storedData.code !== code) {
      return res.status(400).json({ error: 'Código incorrecto' });
    }
    
    // Limpiar código usado
    verificationCodes.delete(email);

    // Si hay userData, es un registro nuevo
    if (storedData.userData) {
      const { name, password } = storedData.userData;
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      
      const user = await User.create({
        name,
        email,
        password_hash,
        is_verified: true // Marcar como verificado al crear
      });
      
      const payload = { userId: user.id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
      
      return res.status(201).json({
        message: 'Usuario registrado y verificado exitosamente',
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    } else {
      // Si no hay userData, es una verificación de un usuario existente
      const user = await User.findOne({ where: { email } });
      if (!user) {
          return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      await user.update({ is_verified: true });

      const payload = { userId: user.id, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

      return res.status(200).json({
          message: 'Email verificado exitosamente',
          token,
          user: {
              id: user.id,
              name: user.name,
              email: user.email,
              is_verified: user.is_verified
          }
      });
    }
    
  } catch (error) {
    console.error('Error verificando email:', error);
    next(error);
  }
};

// Mantener la función original para compatibilidad
export const registerUser = register;

// Reenviar código de verificación
export const resendVerificationEmail = async (req, res, next) => {
  const { email } = req.body;
  
  console.log('Email recibido para reenvío:', email);
  console.log('Códigos temporales disponibles:', Array.from(verificationCodes.keys()));

  try {
    // Primero buscar en usuarios ya creados
    let user = await User.findOne({ where: { email } });
    
    if (user) {
      // Usuario existe en BD pero no verificado
      if (user.is_verified) {
        return res.status(400).json({ error: 'La cuenta ya está verificada.' });
      }

      const verificationCode = generateVerificationCode();
      
      await user.update({
        verification_code: verificationCode,
        verification_code_expires_at: new Date(Date.now() + 10 * 60 * 1000)
      });
      
      await sendVerificationEmail(email, verificationCode);
    } else {
      // Buscar en códigos temporales (usuarios en proceso de registro)
      const tempData = verificationCodes.get(email);
      
      if (!tempData) {
        return res.status(404).json({ error: 'Usuario no encontrado. Por favor, regístrate nuevamente.' });
      }
      
      // Verificar si el código temporal no ha expirado
      if (Date.now() > tempData.expires) {
        verificationCodes.delete(email);
        return res.status(400).json({ error: 'El código ha expirado. Por favor, regístrate nuevamente.' });
      }
      
      // Generar nuevo código y actualizar datos temporales
      const verificationCode = generateVerificationCode();
      
      verificationCodes.set(email, {
        ...tempData,
        code: verificationCode,
        expires: Date.now() + 10 * 60 * 1000
      });
      
      await sendVerificationEmail(email, verificationCode);
    }
    
    res.json({ message: 'Código de verificación reenviado.' });
  } catch (error) {
    next(error);
  }
};

// Actualizar email para verificación
export const updateEmailForVerification = async (req, res, next) => {
  const { email: newEmail } = req.body;
  const { userId } = req.user;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    if (user.is_verified) {
      return res.status(400).json({ error: 'La cuenta ya está verificada.' });
    }

    // Verificar que el nuevo email no esté en uso
    const existingUser = await User.findOne({ where: { email: newEmail } });
    if (existingUser && existingUser.id !== userId) {
      return res.status(409).json({ error: 'El email ya está en uso.' });
    }

    // Actualizar email
    await user.update({ email: newEmail });

    // Enviar código de verificación al nuevo email
    const verificationCode = generateVerificationCode();
    await sendVerificationEmail(newEmail, verificationCode);

    // Guardar el nuevo código para el nuevo email
    verificationCodes.set(newEmail, {
        code: verificationCode,
        expires: Date.now() + 10 * 60 * 1000 // 10 minutos
    });

    res.json({ message: 'Email actualizado y código de verificación enviado.' });
  } catch (error) {
    next(error);
  }
};

const authController = {
  register,
  verifyEmail,
  registerUser,
  loginUser,
  logoutUser,
  resendVerificationEmail,
  updateEmailForVerification
};

export default authController;