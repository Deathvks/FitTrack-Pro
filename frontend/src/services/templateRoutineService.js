import apiClient from './apiClient';

/**
 * Obtiene todas las rutinas predefinidas desde el backend.
 */
export const getTemplateRoutines = () => {
  return apiClient('/template-routines');
};