import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

// --- INICIO DE LA MODIFICACIÓN ---
const commonOptions = {
  dialect: 'mysql',
  // Forza a que todas las fechas se manejen en UTC.
  // Esto previene los problemas de desfase horario entre Node.js y MySQL.
  timezone: '+00:00', 
};
// --- FIN DE LA MODIFICACIÓN ---

if (isProduction) {
  // Se añaden validaciones para las variables de entorno en producción
  const requiredVars = ['MYSQL_USERNAME', 'MYSQL_PASSWORD', 'MYSQL_HOST', 'MYSQL_PORT', 'MYSQL_DATABASE'];
  const missingVars = requiredVars.filter(v => !process.env[v]);

  if (missingVars.length > 0) {
    // Si falta alguna variable, el proceso se detendrá con un error claro
    throw new Error(`Faltan variables de entorno de producción requeridas: ${missingVars.join(', ')}`);
  }
  
  // Construye la URL de conexión para producción usando las variables de Zeabur
  const dbUrl = `mysql://${process.env.MYSQL_USERNAME}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}/${process.env.MYSQL_DATABASE}`;

  sequelize = new Sequelize(dbUrl, {
    ...commonOptions, // Aplicamos las opciones comunes
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Configuración para tu entorno de desarrollo local
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      ...commonOptions, // Aplicamos las opciones comunes
      host: process.env.DB_HOST,
    }
  );
}

export default sequelize;