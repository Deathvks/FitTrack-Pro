import React, { useState, useEffect } from 'react';
import { Mail, X, AlertCircle } from 'lucide-react';
import GlassCard from './GlassCard';
import Spinner from './Spinner';
import { useToast } from '../hooks/useToast';
import { resendVerificationEmail, updateEmailForVerification } from '../services/authService';

const EmailVerificationModal = ({ currentEmail, onEmailUpdated, onCodeSent }) => {
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [resendCooldown, setResendCooldown] = useState(0);
  const { addToast } = useToast();

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendToCurrentEmail = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    try {
      await resendVerificationEmail(currentEmail);
      addToast('Código de verificación enviado a tu email actual', 'success');
      setResendCooldown(10); // Iniciar cooldown de 10 segundos
      onCodeSent();
    } catch (error) {
      addToast(error.message || 'Error al enviar el código', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      setErrors({ email: 'El email es requerido' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      setErrors({ email: 'El email no es válido' });
      return;
    }

    setIsLoading(true);
    try {
      await updateEmailForVerification(newEmail);
      addToast(`Email actualizado y código enviado a ${newEmail}.`, 'success');
      onEmailUpdated(newEmail);
    } catch (error) {
      addToast(error.message || 'Error al actualizar el email', 'error');
      setErrors({ email: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]">
      <GlassCard className="relative w-full max-w-md p-8 m-4">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Verificación Requerida</h2>
          <p className="text-text-secondary">
            Tu cuenta necesita ser verificada para continuar.
          </p>
        </div>

        {!isChangingEmail ? (
          <div className="space-y-4">
            <div className="bg-bg-secondary p-4 rounded-lg border border-glass-border">
              <p className="text-sm text-text-secondary mb-2">Email actual:</p>
              <p className="font-semibold text-text-primary">{currentEmail}</p>
            </div>

            <button
              onClick={handleResendToCurrentEmail}
              disabled={isLoading || resendCooldown > 0}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-accent text-bg-secondary font-semibold rounded-md hover:scale-105 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <Mail size={18} />
                  {resendCooldown > 0 
                    ? `Reenviar en ${resendCooldown}s` 
                    : 'Enviar código a este email'
                  }
                </>
              )}
            </button>

            <button
              onClick={() => setIsChangingEmail(true)}
              className="w-full py-3 px-4 border border-glass-border text-text-primary font-semibold rounded-md hover:bg-white/5 transition"
            >
              Cambiar email
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                <strong>Importante:</strong> Al cambiar tu email, deberás usar el nuevo email en tu próximo inicio de sesión.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Nuevo email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setErrors({});
                }}
                className="w-full bg-bg-secondary border border-glass-border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition"
                placeholder="nuevo@email.com"
              />
              {errors.email && <p className="text-red text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsChangingEmail(false)}
                className="flex-1 py-3 px-4 border border-glass-border text-text-primary font-semibold rounded-md hover:bg-white/5 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangeEmail}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-accent text-bg-secondary font-semibold rounded-md hover:scale-105 transition disabled:opacity-70"
              >
                {isLoading ? <Spinner size="sm" /> : <Mail size={18} />}
                Cambiar y enviar
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default EmailVerificationModal;