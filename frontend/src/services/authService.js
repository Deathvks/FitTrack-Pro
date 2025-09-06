import apiClient from './apiClient';

export const loginUser = (credentials) => {
    return apiClient('/auth/login', { body: credentials, method: 'POST' });
};

export const registerUser = (userData) => {
    return apiClient('/auth/register', { body: userData, method: 'POST' });
};

// Nueva función para verificar el código de email
export const verifyEmail = (verificationData) => {
    return apiClient('/auth/verify-email', { body: verificationData, method: 'POST' });
};

export const logoutUser = () => {
    return apiClient('/auth/logout', { method: 'POST' });
};

export const resendVerificationEmail = (email) => {
  return apiClient('/auth/resend-verification', {
    method: 'POST',
    body: { email }
  });
};

export const updateEmailForVerification = (newEmail) => {
  return apiClient('/auth/update-email-verification', {
    method: 'PUT',
    body: { email: newEmail }
  });
};