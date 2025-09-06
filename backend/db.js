import { Sequelize } from 'sequelize';
import config from './config/config.cjs'; // <-- Cambio aquí

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    timezone: dbConfig.timezone,
    port: dbConfig.port,
    dialectOptions: dbConfig.dialectOptions || {},
    logging: env === 'development' ? console.log : false,
  }
);

export default sequelize;