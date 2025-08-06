import React, { useState } from 'react';
import { ChevronLeft, Save } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import useAppStore from '../store/useAppStore';
import { useToast } from '../hooks/useToast';
import Spinner from '../components/Spinner';
import { updateUserAccount } from '../services/userService'; // Asumimos que esta función se creará

const AccountEditor = ({ onCancel }) => {
    const { userProfile, fetchInitialData } = useAppStore(state => ({
        userProfile: state.userProfile,
        fetchInitialData: state.fetchInitialData,
    }));
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        name: userProfile.name || '',
        email: userProfile.email || '',
        currentPassword: '',
        newPassword: '',
    });

    const handleChange = (e) => {
        setErrors({});
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'El nombre es requerido.';
        if (!formData.email.trim()) newErrors.email = 'El email es requerido.';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'El formato del email no es válido.';

        if (formData.newPassword) {
            if (!formData.currentPassword) {
                newErrors.currentPassword = 'La contraseña actual es requerida para cambiarla.';
            }
            if (formData.newPassword.length < 6) {
                newErrors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres.';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validate()) {
            addToast("Por favor, corrige los errores.", 'error');
            return;
        }
        setIsLoading(true);

        const payload = {
            name: formData.name,
            email: formData.email,
        };

        if (formData.newPassword) {
            payload.currentPassword = formData.currentPassword;
            payload.newPassword = formData.newPassword;
        }

        try {
            await updateUserAccount(payload);
            addToast('Datos de la cuenta actualizados.', 'success');
            await fetchInitialData();
            onCancel();
        } catch (error) {
            addToast(error.message || 'No se pudo actualizar la cuenta.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const baseInputClasses = "w-full bg-bg-secondary border border-glass-border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition";

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-10 animate-[fade-in_0.5s_ease-out]">
            <button onClick={onCancel} className="flex items-center gap-2 text-text-secondary font-semibold hover:text-text-primary transition mb-4">
                <ChevronLeft size={20} />
                Volver a Ajustes
            </button>
            <h1 className="text-4xl font-extrabold mb-8">Configuración de la Cuenta</h1>

            <GlassCard className="p-6">
                <form onSubmit={handleSave} className="flex flex-col gap-6">

                    {/* Datos Básicos */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Datos Básicos</h3>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">Nombre</label>
                                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className={baseInputClasses} />
                                {errors.name && <p className="form-error-text mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={baseInputClasses} />
                                {errors.email && <p className="form-error-text mt-1">{errors.email}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Cambiar Contraseña */}
                    <div className="pt-6 border-t border-glass-border">
                        <h3 className="text-lg font-bold mb-4">Cambiar Contraseña</h3>
                        <p className="text-sm text-text-secondary mb-4 -mt-3">Deja los campos en blanco si no quieres cambiar tu contraseña.</p>
                        <div className="flex flex-col gap-4">
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-text-secondary mb-2">Contraseña Actual</label>
                                <input id="currentPassword" name="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange} className={baseInputClasses} />
                                {errors.currentPassword && <p className="form-error-text mt-1">{errors.currentPassword}</p>}
                            </div>
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-text-secondary mb-2">Nueva Contraseña</label>
                                <input id="newPassword" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} className={baseInputClasses} />
                                {errors.newPassword && <p className="form-error-text mt-1">{errors.newPassword}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Botón Guardar */}
                    <div className="flex justify-center pt-6 border-t border-glass-border">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 px-6 py-3 w-40 rounded-full bg-accent text-bg-secondary font-semibold transition hover:scale-105 disabled:opacity-70"
                        >
                            {isLoading ? <Spinner size={18} /> : <><Save size={18} /><span>Guardar</span></>}
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

export default AccountEditor;