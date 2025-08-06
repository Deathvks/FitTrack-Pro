import apiClient from './apiClient';

export const getMyProfile = () => {
    return apiClient('/users/me');
};

export const updateUserProfile = (profileData) => {
    return apiClient('/users/me', { body: profileData, method: 'PUT' });
};

// --- FUNCIÓN AÑADIDA ---
export const updateUserAccount = (accountData) => {
    return apiClient('/users/me/account', { body: accountData, method: 'PUT' });
};