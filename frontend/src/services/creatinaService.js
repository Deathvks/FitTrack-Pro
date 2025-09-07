import apiClient from './apiClient';

// Obtener todos los registros de creatina del usuario
export const getCreatinaLogs = async () => {
    try {
        const response = await apiClient('/creatina');
        return response;
    } catch (error) {
        console.error('Error fetching creatina logs:', error);
        throw new Error(error.message || 'Error al obtener registros de creatina');
    }
};

// Obtener registro de creatina por fecha específica
export const getCreatinaLogByDate = async (date) => {
    try {
        const response = await apiClient(`/creatina/${date}`);
        return response;
    } catch (error) {
        // Verificar si es un error 404 (registro no encontrado)
        if (error.message?.includes('Not Found') || error.message?.includes('404')) {
            return { data: null }; // Retornar null cuando no hay registro
        }
        console.error('Error fetching creatina log by date:', error);
        throw error; // Re-lanzar otros errores
    }
};

// Crear nuevo registro de creatina
export const createCreatinaLog = async (logData) => {
    try {
        const response = await apiClient('/creatina', {
            method: 'POST',
            body: logData  // Remover JSON.stringify() aquí
        });
        return response;
    } catch (error) {
        console.error('Error creating creatina log:', error);
        throw new Error(error.message || 'Error al crear registro de creatina');
    }
};

// Actualizar registro de creatina existente
export const updateCreatinaLog = async (id, logData) => {
    try {
        const response = await apiClient(`/creatina/${id}`, {
            method: 'PUT',
            body: logData  // Remover JSON.stringify() aquí también
        });
        return response;
    } catch (error) {
        console.error('Error updating creatina log:', error);
        throw new Error(error.message || 'Error al actualizar registro de creatina');
    }
};

// Eliminar registro de creatina
export const deleteCreatinaLog = async (id) => {
    try {
        const response = await apiClient(`/creatina/${id}`, {
            method: 'DELETE'
        });
        return response;
    } catch (error) {
        console.error('Error deleting creatina log:', error);
        throw new Error(error.message || 'Error al eliminar registro de creatina');
    }
};

// Obtener estadísticas de creatina
export const getCreatinaStats = async () => {
    try {
        const response = await apiClient('/creatina/stats');
        return response;
    } catch (error) {
        console.error('Error fetching creatina stats:', error);
        throw new Error(error.message || 'Error al obtener estadísticas de creatina');
    }
};