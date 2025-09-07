import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import creatinaRoutes from './routes/creatina.js';

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
import nutritionRoutes from './routes/nutrition.js';
import favoriteMealRoutes from './routes/favoriteMeals.js';
// --- INICIO DE LA MODIFICACIÓN ---
import templateRoutineRoutes from './routes/templateRoutines.js'; // Se importan las nuevas rutas
// --- FIN DE LA MODIFICACIÓN ---
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);

const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', routineRoutes);
app.use('/api', exerciseRoutes);
app.use('/api', workoutRoutes);
app.use('/api', bodyweightRoutes);
app.use('/api', userRoutes);
app.use('/api', exerciseListRoutes);
app.use('/api', personalRecordRoutes);
app.use('/api', nutritionRoutes);
app.use('/api', favoriteMealRoutes);
// --- INICIO DE LA MODIFICACIÓN ---
app.use('/api', templateRoutineRoutes); // Se usan las nuevas rutas
// ... Rutas
app.use('/api/creatina', creatinaRoutes);
// --- FIN DE LA MODIFICACIÓN ---


app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});