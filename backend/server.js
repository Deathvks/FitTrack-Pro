import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

dotenv.config();

import authRoutes from './routes/auth.js';
import routineRoutes from './routes/routines.js';
import exerciseRoutes from './routes/exercises.js';
import workoutRoutes from './routes/workouts.js';
import bodyweightRoutes from './routes/bodyweight.js';
import userRoutes from './routes/users.js';
import exerciseListRoutes from './routes/exerciseList.js';
import personalRecordRoutes from './routes/personalRecords.js';
import adminRoutes from './routes/admin.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);

const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());

// --- INICIO DE LA CORRECCIÓN ---
// Se ha cambiado 'process.env.FRONTEND_URL' por 'process.env.CORS_ORIGIN'
// para que coincida con el nombre de la variable en tu fichero .env
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};
app.use(cors(corsOptions));
// --- FIN DE LA CORRECCIÓN ---

app.use(express.json());
app.use(cookieParser());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // Rutas de admin
app.use('/api', routineRoutes);
app.use('/api', exerciseRoutes);
app.use('/api', workoutRoutes);
app.use('/api', bodyweightRoutes);
app.use('/api', userRoutes);
app.use('/api', exerciseListRoutes);
app.use('/api', personalRecordRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});