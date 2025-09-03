import models from '../models/index.js';

const { TemplateRoutine, TemplateRoutineExercise } = models;

// --- OBTENER TODAS LAS RUTINAS PREDEFINIDAS ---
export const getAllTemplateRoutines = async (req, res, next) => {
  try {
    const routines = await TemplateRoutine.findAll({
      include: [
        {
          model: TemplateRoutineExercise,
          as: 'TemplateRoutineExercises',
          // No es necesario 'required: false' porque siempre queremos los ejercicios
        }
      ],
      order: [
        // Ordena primero por categoría y luego por nombre de rutina
        ['category', 'ASC'],
        ['name', 'ASC'],
        // Asegura que los ejercicios dentro de cada rutina mantengan un orden consistente
        ['TemplateRoutineExercises', 'id', 'ASC'],
      ],
    });

    // Agrupamos las rutinas por categoría para facilitar su visualización en el frontend
    const groupedByCategory = routines.reduce((acc, routine) => {
      const { category } = routine;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(routine);
      return acc;
    }, {});

    res.json(groupedByCategory);
  } catch (error) {
    next(error);
  }
};

const templateRoutineController = {
  getAllTemplateRoutines,
};

export default templateRoutineController;