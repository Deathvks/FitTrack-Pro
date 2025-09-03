import React, { useState } from 'react';
import GlassCard from '../components/GlassCard';
import Spinner from '../components/Spinner';
import { useToast } from '../hooks/useToast';
import { registerUser } from '../services/authService';

const RegisterScreen = ({ showLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const validateForm = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = 'El nombre es requerido.';
        if (!email.trim()) newErrors.email = 'El email es requerido.';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'El formato del email no es válido.';
        if (!password) newErrors.password = 'La contraseña es requerida.';
        else if (password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);

        try {
            // Se utiliza la función del servicio en lugar de fetch directamente
            await registerUser({ name, email, password });
            addToast('¡Usuario registrado! Redirigiendo al login...', 'success');
            setTimeout(() => showLogin(), 2000);
        } catch (err) {
            const errorMessage = err.message || 'Error al registrar el usuario.';
            setErrors({ api: errorMessage });
            addToast(errorMessage, 'error');
            // --- INICIO DE LA MODIFICACIÓN ---
            // Limpiamos la contraseña en caso de error.
            setPassword('');
            // --- FIN DE LA MODIFICACIÓN ---
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary p-4 animate-[fade-in_0.5s_ease-out]">
            <div className="w-full max-w-sm text-center">
                <h1 className="text-4xl font-extrabold">Crear Cuenta</h1>
                <p className="text-text-secondary mb-8">Empieza a registrar tu progreso hoy mismo.</p>

                <GlassCard className="p-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                        {errors.api && <p className="text-center text-red">{errors.api}</p>}

                        <div>
                            <input
                                type="text"
                                placeholder="Nombre de usuario"
                                className="w-full bg-bg-secondary border border-glass-border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            {errors.name && <p className="form-error-text text-left">{errors.name}</p>}
                        </div>

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