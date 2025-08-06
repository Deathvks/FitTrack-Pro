import React from 'react';
import { Sun, Moon, Monitor, User, LogOut, Shield, KeyRound } from 'lucide-react'; // Importar KeyRound
import GlassCard from '../components/GlassCard';
import useAppStore from '../store/useAppStore';

const SettingsScreen = ({ theme, setTheme, setView, onLogoutClick }) => {
    const userProfile = useAppStore(state => state.userProfile);
    const isSystemTheme = theme === 'system';

    const baseButtonClasses = "p-8 rounded-lg border bg-bg-secondary flex flex-col items-center justify-center gap-3 transition-all duration-200";
    const inactiveButtonClasses = "border-glass-border hover:border-accent-border hover:bg-white/5";
    const activeButtonClasses = "border-accent bg-accent-transparent text-accent scale-105";

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-10 animate-[fade-in_0.5s_ease-out]">
            <h1 className="text-4xl font-extrabold mb-8">Ajustes</h1>
            
            <div className="flex flex-col gap-6">
                {/* Panel de Admin condicional */}
                {userProfile && userProfile.role === 'admin' && (
                    <GlassCard className="p-6">
                        <h2 className="text-xl font-bold">Administración</h2>
                        <p className="text-text-secondary mb-4">Gestionar usuarios y datos de la aplicación.</p>
                        <button
                            onClick={() => setView('adminPanel')}
                            className="flex items-center justify-center gap-3 w-full mt-4 py-4 rounded-md font-semibold transition-colors duration-200 bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20"
                        >
                            <Shield size={20} />
                            <span>Panel de Administración</span>
                        </button>
                    </GlassCard>
                )}

                <GlassCard className="p-6">
                    <h2 className="text-xl font-bold">Perfil</h2>
                    <p className="text-text-secondary mb-4">Modifica tus datos personales y objetivos.</p>
                    <button
                        onClick={() => setView('profileEditor')}
                        className="flex items-center justify-center gap-3 w-full mt-4 py-4 rounded-md font-semibold transition-colors duration-200 bg-bg-secondary border border-glass-border hover:bg-white/10"
                    >
                        <User size={20} />
                        <span>Editar mi Perfil Físico</span>
                    </button>
                </GlassCard>
                
                {/* --- SECCIÓN NUEVA --- */}
                <GlassCard className="p-6">
                    <h2 className="text-xl font-bold">Cuenta</h2>
                    <p className="text-text-secondary mb-4">Gestiona tu nombre, email y contraseña.</p>
                    <button
                        onClick={() => setView('accountEditor')}
                        className="flex items-center justify-center gap-3 w-full mt-4 py-4 rounded-md font-semibold transition-colors duration-200 bg-bg-secondary border border-glass-border hover:bg-white/10"
                    >
                        <KeyRound size={20} />
                        <span>Configurar Cuenta</span>
                    </button>
                </GlassCard>
                {/* --- FIN DE LA SECCIÓN --- */}

                <GlassCard className="p-6">
                    <h2 className="text-xl font-bold">Apariencia</h2>
                    <p className="text-text-secondary mb-4">Elige un tema o sincronízalo con tu sistema.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                            onClick={() => setTheme('light')}
                            className={`${baseButtonClasses} ${!isSystemTheme && theme === 'light' ? activeButtonClasses : inactiveButtonClasses}`}
                        >
                            <Sun size={24} />
                            <span className="font-semibold">Claro</span>
                        </button>
                        
                        <button
                            onClick={() => setTheme('dark')}
                            className={`${baseButtonClasses} ${!isSystemTheme && theme === 'dark' ? activeButtonClasses : inactiveButtonClasses}`}
                        >
                            <Moon size={24} />
                            <span className="font-semibold">Oscuro</span>
                        </button>

                        <button
                            onClick={() => setTheme('system')}
                            className={`${baseButtonClasses} ${isSystemTheme ? activeButtonClasses : inactiveButtonClasses}`}
                        >
                            <Monitor size={24} />
                            <span className="font-semibold">Sistema</span>
                        </button>
                    </div>
                </GlassCard>
                
                <GlassCard className="p-6 md:hidden">
                     <h2 className="text-xl font-bold">Cuenta</h2>
                     <p className="text-text-secondary mb-4">Gestiona tu sesión actual.</p>
                     <button
                        onClick={onLogoutClick}
                        className="flex items-center justify-center gap-3 w-full mt-4 py-4 rounded-md font-semibold transition-colors duration-200 bg-red/10 border border-red/20 text-red hover:bg-red/20"
                    >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                    <p className="text-center text-xs text-text-muted mt-4">
                        FitTrack Pro v1.4.0
                    </p>
                </GlassCard>
            </div>
        </div>
    );
};

export default SettingsScreen;