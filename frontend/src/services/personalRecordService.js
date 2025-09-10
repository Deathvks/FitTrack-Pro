import apiClient from './apiClient';

/**
 * Obtiene los récords personales del usuario de forma paginada.
 * @param {number} page - El número de página a solicitar.
 */
export const getPersonalRecords = (page = 1) => {
    return apiClient(`/records?page=${page}&limit=5`);
};