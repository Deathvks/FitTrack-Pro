import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Plus, Minus } from 'lucide-react';
import GlassCard from './GlassCard';
import useAppStore from '../store/useAppStore';

const RestTimerModal = () => {
  const {
    restTimerEndTime,
    restTimerInitialDuration,
    startRestTimer,
    stopRestTimer,
    addRestTime,
    resetRestTimer, // <-- 1. Importar la nueva acción
  } = useAppStore(state => ({
    restTimerEndTime: state.restTimerEndTime,
    restTimerInitialDuration: state.restTimerInitialDuration,
    startRestTimer: state.startRestTimer,
    stopRestTimer: state.stopRestTimer,
    addRestTime: state.addRestTime,
    resetRestTimer: state.resetRestTimer, // <-- 1. Importar la nueva acción
  }));

  const [timeLeft, setTimeLeft] = useState(0);
  const [view, setView] = useState(restTimerEndTime ? 'timer' : 'select');
  const [customDuration, setCustomDuration] = useState('');

  useEffect(() => {
    if (!restTimerEndTime) {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.round((restTimerEndTime - Date.now()) / 1000);
      const newTimeLeft = Math.max(0, remaining);
      setTimeLeft(newTimeLeft);
      
      // Si llegó a 0, detener el timer automáticamente
      if (remaining <= 0 && restTimerEndTime) {
        // Opcional: puedes agregar una notificación aquí
        // addToast('¡Tiempo de descanso terminado!', 'info');
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 500);
    return () => clearInterval(intervalId);
  }, [restTimerEndTime]);

  const parseTimeToSeconds = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return 0;
  
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      const minutes = parseInt(parts[0] || '0', 10);
      const seconds = parseInt(parts[1] || '0', 10);
      return (minutes * 60) + seconds;
    }
  
    const parsedSeconds = parseInt(timeString, 10);
    return isNaN(parsedSeconds) ? 0 : parsedSeconds;
  };
  
  const handleStartCustom = () => {
    const durationInSeconds = parseTimeToSeconds(customDuration);
    if (durationInSeconds > 0) {
      startRestTimer(durationInSeconds);
      setTimeLeft(durationInSeconds);
      setView('timer');
    }
  };

  const handleCustomDurationChange = (e) => {
    const value = e.target.value;
    if (/^[0-9:]*$/.test(value) && (value.match(/:/g) || []).length <= 1) {
      setCustomDuration(value);
    }
  };

  const handleStartPreset = (duration) => {
    if (duration > 0) {
      startRestTimer(duration);
      setTimeLeft(duration);
      setView('timer');
    }
  };
  
  // --- INICIO DE LA MODIFICACIÓN ---
  const goBackToSelect = () => {
    // 2. Usar la nueva acción que resetea el tiempo sin cerrar el modal
    resetRestTimer();
    setView('select');
  };
  // --- FIN DE LA MODIFICACIÓN ---

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = restTimerInitialDuration > 0 && timeLeft > 0
    ? ((restTimerInitialDuration - timeLeft) / restTimerInitialDuration) * 100
    : timeLeft === 0 ? 100 : 0;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]">
      <GlassCard 
        className="relative p-8 m-4 w-full max-w-sm text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={stopRestTimer} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"><X size={20} /></button>
        
        {view === 'select' && (
          <div>
            <h3 className="text-xl font-bold mb-6">Seleccionar Descanso</h3>
            
            <div className="relative w-48 h-48 mx-auto mb-6 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-glass-border" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle
                  className="text-accent"
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={283}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
              </svg>
              <div className="absolute font-mono text-5xl font-bold text-text-secondary">
                {/* 3. Se asegura de que al volver, se muestre 0:00 */}
                {restTimerEndTime ? formatTime(timeLeft) : '0:00'}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[60, 120, 180].map(time => (
                <button 
                  key={time} 
                  onClick={() => handleStartPreset(time)}
                  className="p-4 bg-bg-secondary rounded-md border border-glass-border hover:border-accent transition"
                >
                  <span className="font-bold text-xl">{time / 60}</span>
                  <span className="text-xs text-text-muted">min</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                placeholder="M:SS"
                value={customDuration}
                onChange={handleCustomDurationChange}
                className="w-full text-center bg-bg-secondary border border-glass-border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition"
              />
              <button 
                onClick={handleStartCustom}
                className="px-6 py-3 rounded-md bg-accent text-bg-secondary font-semibold whitespace-nowrap"
              >
                Iniciar
              </button>
            </div>
          </div>
        )}

        {view === 'timer' && (
          <div>
            <button onClick={goBackToSelect} className="absolute top-4 left-4 text-text-secondary hover:text-text-primary"><ArrowLeft size={20} /></button>
            <h3 className="text-xl font-bold mb-4">Tiempo de Descanso</h3>
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-glass-border" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle
                  className={timeLeft > 0 ? "text-accent" : "text-red"}
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * progress) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.5s linear, stroke 0.5s linear' }}
                />
              </svg>
              <div className={`absolute font-mono text-5xl font-bold ${timeLeft === 0 ? 'animate-pulse text-red' : ''}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
            <div className="flex justify-center items-center gap-4 mt-6">
                <button 
                  onClick={() => addRestTime(-10)} 
                  disabled={timeLeft === 0}
                  className={`px-5 py-3 flex items-center justify-center gap-2 rounded-full border transition ${
                    timeLeft === 0 
                      ? 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed opacity-50' 
                      : 'bg-bg-secondary border-glass-border hover:border-accent'
                  }`}
                >
                    <Minus size={18} />
                    <span className="font-semibold text-sm">-10 seg</span>
                </button>
                <button 
                  onClick={() => addRestTime(10)} 
                  className="px-5 py-3 flex items-center justify-center gap-2 rounded-full bg-bg-secondary border border-glass-border hover:border-accent transition"
                >
                    <Plus size={18} />
                    <span className="font-semibold text-sm">+10 seg</span>
                </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default RestTimerModal;