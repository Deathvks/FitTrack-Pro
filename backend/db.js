import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

let sequelize;

if (isProduction) {
  // Construye la URL de conexión para producción usando las variables de Zeabur
  const dbUrl = `mysql://${process.env.MYSQL_USERNAME}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}/${process.env.MYSQL_DATABASE}?ssl=true`;

  sequelize = new Sequelize(dbUrl, {
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        // Esta opción es crucial para muchas bases de datos en la nube
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
      host: process.env.DB_HOST,
      dialect: 'mysql'
    }
  );
}

export default sequelize;