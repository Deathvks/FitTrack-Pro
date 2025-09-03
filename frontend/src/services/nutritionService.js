import apiClient from './apiClient';

/**
 * Obtiene los registros de nutrición y agua para una fecha específica.
 * @param {string} date - La fecha en formato YYYY-MM-DD.
 */
export const getNutritionLogsByDate = (date) => {
  return apiClient(`/nutrition?date=${date}`);
};

// --- INICIO DE LA MODIFICACIÓN ---
/**
 * Obtiene el resumen de datos de nutrición para un mes y año específicos.
 * @param {number} month - El mes (1-12).
 * @param {number} year - El año (ej: 2025).
 */
export const getNutritionSummary = (month, year) => {
    return apiClient(`/nutrition/summary?month=${month}&year=${year}`);
};
// --- FIN DE LA MODIFICACIÓN ---

/**
 * Añade un nuevo registro de comida.
 * @param {object} foodData - Datos de la comida (description, calories, macros, etc.).
 */
export const addFoodLog = (foodData) => {
  return apiClient('/nutrition/food', {
    method: 'POST',
    body: foodData,
  });
};

/**
 * Actualiza un registro de comida existente.
 * @param {number} logId - ID del registro a actualizar.
 * @param {object} foodData - Nuevos datos de la comida.
 */
export const updateFoodLog = (logId, foodData) => {
    return apiClient(`/nutrition/food/${logId}`, {
        method: 'PUT',
        body: foodData,
    });
};

/**
 * Elimina un registro de comida.
 * @param {number} logId - ID del registro a eliminar.
 */
export const deleteFoodLog = (logId) => {
  return apiClient(`/nutrition/food/${logId}`, {
    method: 'DELETE',
  });
};

/**
 * Añade o actualiza la cantidad de agua para un día.
 * @param {object} waterData - { log_date, quantity_ml }.
 */
export const upsertWaterLog = (waterData) => {
  return apiClient('/nutrition/water', {
    method: 'POST',
    body: waterData,
  });
};