import apiClient from './apiClient';

/**
 * Busca ejercicios en la base de datos.
 * @param {string} query - El término de búsqueda para encontrar ejercicios.
 * @param {string} muscleGroup - El grupo muscular por el que filtrar.
 */
export const searchExercises = (query, muscleGroup) => {
    // --- INICIO DE LA MODIFICACIÓN ---
    // Construye los parámetros de la URL de forma dinámica
    const params = new URLSearchParams();
    if (query) {
        params.append('search', query);
    }
    if (muscleGroup && muscleGroup !== 'Todos') {
        params.append('muscle_group', muscleGroup);
    }
    // --- FIN DE LA MODIFICACIÓN ---

    return apiClient(`/exercises?${params.toString()}`);
};