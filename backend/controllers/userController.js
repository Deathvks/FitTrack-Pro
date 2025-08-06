import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs'; // <-- Importar bcrypt
import models from '../models/index.js';

const { User, BodyWeightLog, sequelize } = models;

// Obtener el perfil del usuario autenticado
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Actualizar el perfil físico del usuario
export const updateMyProfile = async (req, res, next) => {
  // ... (esta función no cambia)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const t = await sequelize.transaction();
  try {
    const { userId } = req.user;
    const { gender, age, height, activityLevel, goal, weight } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    await user.update({
      gender,
      age,
      height,
      activity_level: activityLevel,
      goal
    }, { transaction: t });

    if (weight) {
      const weightValue = parseFloat(weight);
      if (weightValue > 0) {
        await BodyWeightLog.create({
          user_id: userId,
          weight_kg: weightValue,
          log_date: new Date()
        }, { transaction: t });
      }
    }

    await t.commit();

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    });
    res.json(updatedUser);

  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// --- INICIO DE LA MODIFICACIÓN: Nueva función para actualizar la cuenta ---
export const updateMyAccount = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { userId } = req.user;
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Si se intenta cambiar la contraseña
    if (newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(newPassword, salt);
    }

    // Actualizar nombre y email
    user.name = name;
    user.email = email;

    await user.save();

    const { password_hash, ...userWithoutPassword } = user.get({ plain: true });
    res.json(userWithoutPassword);

  } catch (error) {
    next(error);
  }
};
// --- FIN DE LA MODIFICACIÓN ---

const userController = {
  getMyProfile,
  updateMyProfile,
  updateMyAccount // <-- Exportar la nueva función
};

export default userController;