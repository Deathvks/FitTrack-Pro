import React, { useState, useEffect } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import GlassCard from './GlassCard';
import Spinner from './Spinner';
import { useToast } from '../hooks/useToast';
import { verifyEmail, resendVerificationEmail } from '../services/authService';
import useAppStore from '../store/useAppStore';

const EmailVerification = ({ email, onBack, onSuccess, backButtonText = 'Volver al registro' }) => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { addToast } = useToast();
    const fetchInitialData = useAppStore(state => state.fetchInitialData);
    const [resendCooldown, setResendCooldown] = useState(10); // Iniciar con 10 segundos

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!code.trim()) {
            setErrors({ code: 'El código de verificación es requerido' });
            return;
        }

        if (code.length !== 6) {
            setErrors({ code: 'El código debe tener 6 dígitos' });
            return;
        }

        setErrors({});
        setIsLoading(true);

        try {
            const response = await verifyEmail({ email, code });
            
            if (response.token) {
                localStorage.setItem('fittrack_token', response.token);
                
                useAppStore.setState({ 
                    token: response.token, 
                    isAuthenticated: true 
                });
                
                await fetchInitialData();
                
                addToast('¡Cuenta verificada exitosamente!', 'success');
                onSuccess();
            }
        } catch (err) {
            const errorMessage = err.message || 'Error al verificar el código';
            setErrors({ api: errorMessage });
            addToast(errorMessage, 'error');
            setCode('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;

        try {
            await resendVerificationEmail(email);
            addToast('Se ha reenviado un nuevo código de verificación.', 'success');
            setResendCooldown(10); // Reiniciar cooldown de 10 segundos
        } catch (error) {
            addToast(error.message || 'Error al reenviar el código.', 'error');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary p-4 animate-[fade-in_0.5s_ease-out]">
            <div className="w-full max-w-sm text-center">
                <div className="mb-8">
                    <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                        <Mail className="w-8 h-8 text-bg-secondary" />
                    </div>
                    <h1 className="text-4xl font-extrabold mb-2">Verificar Email</h1>
                    <p className="text-text-secondary">
                        Hemos enviado un código de 6 dígitos a <strong className="text-text-primary">{email}</strong>
                    </p>
                </div>

                <GlassCard className="p-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                        {errors.api && <p className="text-center text-red">{errors.api}</p>}

                        <div>
                            <input
                                type="text"
                                placeholder="000000"
                                className="w-full bg-bg-secondary border border-glass-border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition text-center text-2xl tracking-widest font-mono"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                autoComplete="one-time-code"
                            />
                            {errors.code && <p className="form-error-text text-left">{errors.code}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || code.length !== 6}
                            className="flex items-center justify-center w-full rounded-md bg-accent text-bg-secondary font-semibold py-3 transition hover:scale-105 hover:shadow-lg hover:shadow-accent/20 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Spinner /> : 'Verificar Código'}
                        </button>
                    </form>

                    <div className="mt-6 flex flex-col gap-3">
                        <button
                            onClick={handleResendCode}
                            disabled={resendCooldown > 0}
                            className="text-sm text-accent hover:text-accent/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : '¿No recibiste el código? Reenviar'}
                        </button>
                        
                        <button
                            onClick={onBack}
                            className="flex items-center justify-center text-sm text-text-muted hover:text-text-primary transition"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            {backButtonText}
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default EmailVerification;