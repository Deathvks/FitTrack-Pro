import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configurar transporter - Usar createTransport (sin 'er' al final)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // tu-email@gmail.com
    pass: process.env.EMAIL_PASS  // contraseña de aplicación
  }
});

// Generar código de verificación
export const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Enviar código de verificación
export const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Código de verificación - Pro Fitness Glass',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">¡Bienvenido a Pro Fitness Glass!</h2>
        <p>Tu código de verificación es:</p>
        <div style="background: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #1F2937; font-size: 32px; margin: 0;">${code}</h1>
        </div>
        <p>Este código expira en 10 minutos.</p>
        <p>Si no solicitaste este código, puedes ignorar este email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Código enviado correctamente' };
  } catch (error) {
    console.error('Error enviando email:', error);
    return { success: false, message: 'Error enviando código' };
  }
};

// --- INICIO DE LA MODIFICACIÓN ---
// Enviar email para resetear contraseña
export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Restablecimiento de Contraseña - Pro Fitness Glass',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Restablecimiento de Contraseña</h2>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a 
            href="${resetUrl}" 
            style="background-color: #4F46E5; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;"
          >
            Restablecer Contraseña
          </a>
        </div>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste esto, puedes ignorar este email de forma segura.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email de restablecimiento enviado.' };
  } catch (error) {
    console.error('Error enviando email de reseteo:', error);
    return { success: false, message: 'Error al enviar el email.' };
  }
};
// --- FIN DE LA MODIFICACIÓN ---