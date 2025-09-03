import apiClient from './apiClient';

/**
 * Obtiene todas las comidas favoritas del usuario.
 */
export const getFavoriteMeals = () => {
  return apiClient('/meals');
};

/**
 * Guarda una nueva comida en la lista de favoritos.
 * @param {object} mealData - Datos de la comida (name, calories, macros).
 */
export const createFavoriteMeal = (mealData) => {
  return apiClient('/meals', {
    method: 'POST',
    body: mealData,
  });
};

/**
 * Elimina una comida de la lista de favoritos.
 * @param {number} mealId - ID de la comida a eliminar.
 */
export const deleteFavoriteMeal = (mealId) => {
  return apiClient(`/meals/${mealId}`, {
    method: 'DELETE',
  });
};