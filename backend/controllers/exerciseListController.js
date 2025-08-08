import models from '../models/index.js';
import { Op } from 'sequelize';

const { ExerciseList } = models;

// Obtener ejercicios, con opción de búsqueda y filtro por grupo muscular
export const getExercises = async (req, res, next) => {
    try {
        const { search, muscle_group } = req.query;

        const options = {
            where: {},
            order: [['name', 'ASC']],
            limit: 20
        };

        // --- INICIO DE LA MODIFICACIÓN ---
        // Si se proporciona un término de búsqueda, se añade al filtro
        if (search) {
            options.where.name = {
                [Op.like]: `%${search}%`
            };
        }

        // Si se proporciona un grupo muscular (y no es 'Todos'), se añade al filtro
        if (muscle_group && muscle_group !== 'Todos') {
            options.where.muscle_group = muscle_group;
        }
        // --- FIN DE LA MODIFICACIÓN ---

        const exercises = await ExerciseList.findAll(options);
        res.json(exercises);
    } catch (error) {
        next(error);
    }
};

const exerciseListController = {
    getExercises
};

export default exerciseListController;