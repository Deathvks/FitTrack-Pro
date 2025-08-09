import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Home, Dumbbell, BarChart2, Settings, LogOut, Zap } from 'lucide-react';
import useAppStore from './store/useAppStore';

import Dashboard from './pages/Dashboard';
import Progress from './pages/Progress';
import Routines from './pages/Routines';
import Workout from './pages/Workout';
import SettingsScreen from './pages/SettingsScreen';
import LoginScreen from './pages/LoginScreen';
import RegisterScreen from './pages/RegisterScreen';
import OnboardingScreen from './pages/OnboardingScreen';
import ProfileEditor from './pages/ProfileEditor';
import AccountEditor from './pages/AccountEditor';
import PRToast from './components/PRToast';
import ConfirmationModal from './components/ConfirmationModal';
import AdminPanel from './pages/AdminPanel.jsx';

export default function App() {
  const {
    isAuthenticated,
    userProfile,
    isLoading,
    prNotification,
    fetchInitialData,
    handleLogout: performLogout,
    activeWorkout,
    workoutStartTime, // <-- inicio del cronómetro
  } = useAppStore();

  const [view, setView] = useState(() => {
    if (useAppStore.getState().activeWorkout) {
      return 'workout';
    }
    return localStorage.getItem('lastView') || 'dashboard';
  });

  const mainContentRef = useRef(null);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [view]);

  useEffect(() => {
    localStorage.setItem('lastView', view);
  }, [view]);

  const [isLoginView, setIsLoginView] = useState(true);

  // ---- Tema (claro/oscuro/sistema)
  const [theme, setThemeState] = useState(() => localStorage.getItem('theme') || 'system');

  // ---- NUEVO: Acento de la app (verde, azul, etc.)
  const [accent, setAccentState] = useState(() => localStorage.getItem('accent') || 'green');

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { isWorkoutPaused, workoutAccumulatedTime } = useAppStore();
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval = null;
    if (workoutStartTime && !isWorkoutPaused) {
      interval = setInterval(() => {
        const elapsed = Date.now() - workoutStartTime;
        setTimer(Math.floor((workoutAccumulatedTime + elapsed) / 1000));
      }, 1000);
    } else {
      setTimer(Math.floor(workoutAccumulatedTime / 1000));
    }
    return () => clearInterval(interval);
  }, [workoutStartTime, isWorkoutPaused, workoutAccumulatedTime]);

  const setTheme = (newTheme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };

  // NUEVO: aplicar clase accent-* al body y persistir
  const setAccent = (newAccent) => {
    localStorage.setItem('accent', newAccent);
    setAccentState(newAccent);
  };

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Aplica tema claro/oscuro
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (themeValue) => {
      document.body.classList.remove('light-theme', 'dark-theme');
      if (themeValue === 'system') {
        document.body.classList.add(mediaQuery.matches ? 'dark-theme' : 'light-theme');
      } else {
        document.body.classList.add(`${themeValue}-theme`);
      }
    };
    const handleSystemThemeChange = () => {
      if (theme === 'system') applyTheme('system');
    };
    applyTheme(theme);
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  // NUEVO: aplica la clase de acento (accent-green, accent-blue, etc.)
  useEffect(() => {
    // elimina cualquier clase accent- previa
    const toRemove = Array.from(document.body.classList).filter(c => c.startsWith('accent-'));
    toRemove.forEach(c => document.body.classList.remove(c));
    // añade la clase actual
    document.body.classList.add(`accent-${accent}`);
  }, [accent]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    performLogout();
    setShowLogoutConfirm(false);
  };

  const navigate = useCallback((viewName) => {
    setView(viewName);
  }, []);

  if (isLoading) {
    return <div className="fixed inset-0 flex items-center justify-center bg-bg-primary">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return isLoginView
      ? <LoginScreen onLogin={fetchInitialData} showRegister={() => setIsLoginView(false)} />
      : <RegisterScreen showLogin={() => setIsLoginView(true)} />;
  }

  if (userProfile && !userProfile.goal) {
    return <OnboardingScreen />;
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard setView={navigate} />;
      case 'progress': return <Progress darkMode={theme !== 'light'} />;
      case 'routines': return <Routines setView={navigate} />;
      case 'workout': return <Workout timer={timer} setView={navigate} />;
      case 'settings':
        return (
          <SettingsScreen
            theme={theme}
            setTheme={setTheme}
            /* NUEVO: pasamos acento y setter al panel de ajustes */
            accent={accent}
            setAccent={setAccent}
            setView={navigate}
            onLogoutClick={handleLogoutClick}
          />
        );
      case 'profileEditor': return <ProfileEditor onCancel={() => navigate('settings')} />;
      case 'accountEditor': return <AccountEditor onCancel={() => navigate('settings')} />;
      case 'adminPanel': return <AdminPanel onCancel={() => navigate('settings')} />;
      default: return <Dashboard setView={navigate} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={24} /> },
    { id: 'progress', label: 'Progreso', icon: <BarChart2 size={24} /> },
    { id: 'routines', label: 'Rutinas', icon: <Dumbbell size={24} /> },
    { id: 'settings', label: 'Ajustes', icon: <Settings size={24} /> },
  ];

  return (
    <div className="relative flex w-full h-full overflow-hidden">
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-accent rounded-full opacity-20 filter blur-3xl -z-10 animate-roam-blob"></div>

      <nav className="hidden md:flex flex-col gap-10 p-8 w-64 h-full border-r border-[--glass-border] bg-bg-primary">
        <button onClick={() => navigate('dashboard')} className="flex items-center gap-4 text-accent transition-transform hover:scale-105">
          <Dumbbell size={32} />
          <h1 className="text-xl font-bold text-text-primary whitespace-nowrap">FitTrack Pro</h1>
        </button>
        <div className="flex flex-col gap-4">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex items-center gap-4 w-full px-6 py-4 rounded-lg text-base font-semibold transition-all duration-200 ${view === item.id
                  ? 'bg-accent text-bg-secondary'
                  : 'text-text-secondary hover:bg-accent-transparent hover:text-accent'
                }`}>
              {item.icon}
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>
        <button onClick={handleLogoutClick} className="mt-auto flex items-center gap-4 w-full px-6 py-4 rounded-lg text-base font-semibold text-text-secondary hover:bg-white/10 hover:text-text-primary transition-colors duration-200">
          <LogOut size={24} />
          <span className="whitespace-nowrap">Cerrar Sesión</span>
        </button>
      </nav>

      <main ref={mainContentRef} className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0">
        {renderView()}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 flex justify-around items-center bg-[--glass-bg] backdrop-blur-glass border-t border-[--glass-border]">
        {navItems.map(item => (
          <button key={item.id} onClick={() => navigate(item.id)} className={`flex flex-col items-center justify-center gap-1 h-full flex-grow transition-colors duration-200 ${view === item.id ? 'text-accent' : 'text-text-secondary'}`}>
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <PRToast newPRs={prNotification} onClose={() => useAppStore.setState({ prNotification: null })} />

      {showLogoutConfirm && (
        <ConfirmationModal
          message="¿Estás seguro de que quieres cerrar sesión?"
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutConfirm(false)}
          confirmText="Cerrar Sesión"
        />
      )}

      {/* Botón volver al entreno: solo si hay entrenamiento activo con cronómetro iniciado */}
      {activeWorkout && workoutStartTime && view !== 'workout' && (
        <button
          onClick={() => navigate('workout')}
          className="fixed bottom-24 right-4 md:bottom-10 md:right-10 z-50 flex items-center gap-3 px-4 py-3 rounded-full bg-accent text-bg-secondary font-semibold shadow-lg animate-[fade-in-up_0.5s_ease-out] transition-transform hover:scale-105"
        >
          <Zap size={20} />
          <span>Volver al Entreno</span>
        </button>
      )}

      <div className="hidden md:block absolute bottom-4 right-4 z-50 bg-bg-secondary/50 text-text-muted text-xs px-2.5 py-1 rounded-full backdrop-blur-sm select-none">
        v2.1.0
      </div>
    </div>
  );
}
