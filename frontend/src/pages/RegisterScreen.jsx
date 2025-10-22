import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import Spinner from '../components/Spinner';
import { useToast } from '../hooks/useToast';
import { registerUser } from '../services/authService'; // Eliminado resendVerificationEmail (no se usa aquí)
import useAppStore from '../store/useAppStore';
import EmailVerification from '../components/EmailVerification';

const RegisterScreen = ({ showLogin }) => {
    // --- INICIO MODIFICACIÓN: Cambiar 'name' por 'username' ---
    const [username, setUsername] = useState('');
    // --- FIN MODIFICACIÓN ---
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const { addToast } = useToast();
    const fetchInitialData = useAppStore(state => state.fetchInitialData);

    const validateForm = () => {
        const newErrors = {};
        // --- INICIO MODIFICACIÓN: Validar 'username' ---
        if (!username.trim()) {
            newErrors.username = 'El nombre de usuario es requerido.';
        } else if (username.length < 3 || username.length > 30) {
            newErrors.username = 'El nombre de usuario debe tener entre 3 y 30 caracteres.';
        } else if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
             newErrors.username = 'Solo letras, números, _, . y -';
        }
        // --- FIN MODIFICACIÓN ---

        if (!email.trim()) {
            newErrors.email = 'El email es requerido.';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'El email no es válido.';
        }
        if (!password) {
            newErrors.password = 'La contraseña es requerida.';
        } else if (password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
        }
        return newErrors;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);

        try {
            // --- INICIO MODIFICACIÓN: Enviar 'username' ---
            const response = await registerUser({ username, email, password });
            // --- FIN MODIFICACIÓN ---
            addToast(response.message, 'success');
            setRegisteredEmail(email);
            setShowVerification(true);
        } catch (err) {
            const errorMessage = err.message || 'Error en el registro.';
            // --- INICIO MODIFICACIÓN: Manejar error específico de username ---
            // Mapear errores del backend (si vienen en 'errors') a nuestro estado 'errors'
            if (err.errors && Array.isArray(err.errors)) {
                 const apiErrors = {};
                 err.errors.forEach(error => {
                     if (error.param) {
                         apiErrors[error.param] = error.msg;
                     }
                 });
                 setErrors(apiErrors);
            } else if (errorMessage.toLowerCase().includes('nombre de usuario')) {
                 setErrors({ username: errorMessage });
            } else if (errorMessage.toLowerCase().includes('email')) {
                 setErrors({ email: errorMessage });
            } else {
                 setErrors({ api: errorMessage });
            }
            // --- FIN MODIFICACIÓN ---
            addToast(errorMessage, 'error');
            setPassword('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerificationSuccess = async () => {
        // Después de la verificación exitosa, obtenemos los datos del usuario
        try {
            await fetchInitialData();
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    const handleBackToRegister = () => {
        setShowVerification(false);
        setRegisteredEmail('');
    };

    // Si estamos en modo verificación, mostramos el componente de verificación
    if (showVerification) {
        return (
            <EmailVerification 
                email={registeredEmail}
                onBack={handleBackToRegister}
                onSuccess={handleVerificationSuccess}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary p-4 animate-[fade-in_0.5s_ease-out]">
            <div className="w-full max-w-sm text-center">
                <h1 className="text-4xl font-extrabold">Crear Cuenta</h1>
                <p className="text-text-secondary mb-8">Empieza a registrar tu progreso hoy mismo.</p>

                <GlassCard className="p-8">
                    <form onSubmit={handleRegister} className="flex flex-col gap-5" noValidate>
                        {errors.api && <p className="text-center text-red">{errors.api}</p>}

                        {/* --- INICIO MODIFICACIÓN: Campo 'username' --- */}
                        <div>
                            <input
                                type="text"
                                placeholder="Nombre de usuario"
                                className="w-full bg-bg-secondary border border-glass-border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                maxLength={30} // Añadido para consistencia con validación
                            />
                            {errors.username && <p className="form-error-text text-left">{errors.username}</p>}
                        </div>
                        {/* --- FIN MODIFICACIÓN --- */}

                        <div>
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full bg-bg-secondary border border-glass-border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {errors.email && <p className="form-error-text text-left">{errors.email}</p>}
                        </div>

                        <div>
                            <input
                                type="password"
                                placeholder="Contraseña"
                                className="w-full bg-bg-secondary border border-glass-border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {errors.password && <p className="form-error-text text-left">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center justify-center w-full rounded-md bg-accent text-bg-secondary font-semibold py-3 transition hover:scale-105 hover:shadow-lg hover:shadow-accent/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Spinner /> : 'Registrarse'}
                        </button>
                    </form>
                </GlassCard>

                <button onClick={showLogin} className="mt-6 text-text-muted hover:text-text-primary transition">
                    ¿Ya tienes cuenta? Inicia sesión
                </button>
            </div>
        </div>
    );
};

export default RegisterScreen;