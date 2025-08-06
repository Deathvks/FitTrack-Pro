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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            useAppStore.getState().handleLogout();
        }

        let errorMessage = 'Ha ocurrido un error inesperado.';
        try {
            const errorData = await response.json();
            if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
                errorMessage = errorData.errors[0].msg;
            } else if (errorData.error) {
                errorMessage = errorData.error;
            }
        } catch {
            errorMessage = response.statusText;
        }
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return;
    }

    return response.json();
};

export default apiClient;