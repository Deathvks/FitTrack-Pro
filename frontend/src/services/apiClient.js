import useAppStore from '../store/useAppStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = async (endpoint, options = {}) => {
    const token = useAppStore.getState().token;
    const { body, ...customConfig } = options;
    const headers = { 'Content-Type': 'application/json' };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: body ? 'POST' : 'GET',
        ...customConfig,
        headers: { ...headers, ...customConfig.headers },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            // Si la respuesta es un error (ej: 4xx, 5xx), intentamos leer el cuerpo del error.
            if (response.status === 401 || response.status === 403) {
                useAppStore.getState().handleLogout();
            }

            let errorMessage = 'Ha ocurrido un error inesperado.';
            try {
                const errorData = await response.json();
                // Priorizamos el mensaje de error específico de nuestra API
                if (errorData.error) {
                    errorMessage = errorData.error;
                // Luego, los errores de validación de express-validator
                } else if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
                    errorMessage = errorData.errors[0].msg;
                }
            } catch (e) {
                // Si el cuerpo del error no es JSON, usamos el texto de estado (ej: "Not Found")
                errorMessage = response.statusText || 'Error del servidor.';
            }
            // Lanzamos el error con el mensaje procesado para que sea capturado por el componente.
            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return; // No hay contenido que devolver
        }

        return response.json();
    } catch (error) {
        // --- INICIO DE LA MODIFICACIÓN ---
        // Capturamos el error que hemos lanzado o un error de red (como 'Failed to fetch')
        // Si el mensaje es 'Failed to fetch', lo traducimos a algo más amigable.
        if (error.message === 'Failed to fetch') {
            throw new Error('No se pudo conectar con el servidor. Revisa tu conexión a internet.');
        }
        // Si ya hemos procesado el mensaje, simplemente lo volvemos a lanzar.
        throw error;
        // --- FIN DE LA MODIFICACIÓN ---
    }
};

export default apiClient;