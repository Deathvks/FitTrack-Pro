import dotenv from 'dotenv';
dotenv.config();

const config = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: "mysql",
    // --- INICIO DE LA MODIFICACIÓN ---
    // Forza a que todas las fechas se manejen en UTC para evitar problemas de zona horaria.
    timezone: '+00:00',
    // --- FIN DE LA MODIFICACIÓN ---
  },
  test: {
    username: "root",
    password: "1234",
    database: "fittrack_test",
    host: "127.0.0.1",
    dialect: "mysql",
    // --- INICIO DE LA MODIFICACIÓN ---
    timezone: '+00:00',
    // --- FIN DE LA MODIFICACIÓN ---
  },
  production: {
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    dialect: "mysql",
    // --- INICIO DE LA MODIFICACIÓN ---
    timezone: '+00:00',
    // --- FIN DE LA MODIFICACIÓN ---
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

export default config;