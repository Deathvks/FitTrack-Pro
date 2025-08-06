import React, { useState } from 'react';
import { ChevronLeft, Play, Pause, Square, FileText, Clock } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import ConfirmationModal from '../components/ConfirmationModal';
import RestTimerModal from '../components/RestTimerModal';
import useAppStore from '../store/useAppStore';
import { useToast } from '../hooks/useToast';

const Workout = ({ timer, setView }) => {
  const { addToast } = useToast();
  const { 
    activeWorkout, 
    logWorkout, 
    stopWorkout,
    updateActiveWorkoutSet,
    isWorkoutPaused,
    togglePauseWorkout,
    workoutStartTime,
    isResting,
    openRestModal
  } = useAppStore(state => ({
    activeWorkout: state.activeWorkout,
    logWorkout: state.logWorkout,
    stopWorkout: state.stopWorkout,
    updateActiveWorkoutSet: state.updateActiveWorkoutSet,
    isWorkoutPaused: state.isWorkoutPaused,
    togglePauseWorkout: state.togglePauseWorkout,
    workoutStartTime: state.workoutStartTime,
    isResting: state.isResting,
    openRestModal: state.openRestModal,
  }));
  
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!activeWorkout) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <h2 className="text-2xl font-bold">No hay ningún entrenamiento activo.</h2>
            <p className="text-text-secondary mt-2">Puedes iniciar uno desde el Dashboard o la sección de Rutinas.</p>
            <button onClick={() => setView('routines')} className="mt-6 px-6 py-3 rounded-full bg-accent text-bg-secondary font-semibold">
                Ir a Rutinas
            </button>
        </div>
    );
  }

  const formatTime = (timeInSeconds) => {
    const hours = String(Math.floor(timeInSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((timeInSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(timeInSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleFinishClick = () => {
    if (timer === 0) {
      addToast('Debes iniciar el cronómetro para poder guardar el entrenamiento.', 'error');
      return;
    }
    setShowFinishModal(true);
  };

  const handleBackClick = () => {
    if (workoutStartTime) {
      setShowCancelModal(true);
    } else {
      stopWorkout();
      setView('routines');
    }
  };

  const confirmCancelWorkout = () => {
    stopWorkout();
    setShowCancelModal(false);
    setView('routines');
  };

  const confirmFinishWorkout = async () => {
    const isAnySetFilled = activeWorkout.exercises.some(ex =>
      ex.setsDone.some(set => (set.reps && set.reps !== '') || (set.weight_kg && set.weight_kg !== ''))
    );

    if (!isAnySetFilled) {
      addToast('No has registrado ningún dato. Completa al menos una serie para guardar.', 'error');
      setShowFinishModal(false);
      return;
    }

    setIsSaving(true);
    const workoutData = {
        routineId: activeWorkout.routineId,
        routineName: activeWorkout.routineName,
        duration_seconds: timer,
        notes: notes,
        details: activeWorkout.exercises.map(ex => ({
            exerciseName: ex.name,
            setsDone: ex.setsDone.filter(set => set.reps !== '' && set.weight_kg !== '')
        }))
    };
    
    const result = await logWorkout(workoutData);
    if (result.success) {
      addToast(result.message, 'success');
      setShowFinishModal(false);
      setView('dashboard');
    } else {
      addToast(result.message, 'error');
    }
    setIsSaving(false);
  };
  
  const baseInputClasses = "w-full text-center bg-bg-secondary border border-glass-border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition";

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-10 animate-[fade-in_0.5s_ease-out]">
      <button onClick={handleBackClick} className="flex items-center gap-2 text-text-secondary font-semibold hover:text-text-primary transition mb-4">
        <ChevronLeft size={20} />
        Volver a Rutinas
      </button>

      <GlassCard className="p-6 mb-6">
        <h1 className="text-3xl font-bold text-center sm:text-left">{activeWorkout.routineName}</h1>
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 mt-4">
            <div className="font-mono text-4xl sm:text-5xl font-bold">{formatTime(timer)}</div>
            <div className="flex gap-4">
                <button 
                    onClick={togglePauseWorkout} 
                    className="p-4 rounded-full transition text-bg-secondary bg-accent hover:bg-accent/80">
                    {isWorkoutPaused ? <Play size={24} /> : <Pause size={24} />}
                </button>
                <button onClick={handleFinishClick} className="p-4 rounded-full bg-red text-bg-secondary transition hover:bg-red/80">
                  <Square size={24} />
                </button>
            </div>
        </div>
      </GlassCard>

      <div className="flex flex-col gap-6">
        {activeWorkout.exercises.map((ex, exIndex) => (
          <GlassCard key={ex.id || exIndex} className="p-6">
            <div className="pb-4 border-b border-glass-border mb-4">
              <h2 className="text-xl font-bold">{ex.name}</h2>
              <p className="text-sm text-text-muted">Objetivo: {ex.sets} x {ex.reps} reps</p>
            </div>
            <div className="grid grid-cols-[50px_1fr_1fr_50px] gap-4 text-center text-xs font-bold text-text-secondary mb-2">
                <span>SERIE</span>
                <span>PESO (kg)</span>
                <span>REPS</span>
                <span></span>
            </div>
            <div className="flex flex-col gap-3">
                {ex.setsDone.map((set, setIndex) => (
                    <div key={setIndex} className="grid grid-cols-[50px_1fr_1fr_50px] gap-4 items-center">
                        <span className="flex items-center justify-center font-bold bg-bg-secondary p-3 rounded-md border border-glass-border h-full">
                            {set.set_number}
                        </span>
                        <input type="number" placeholder="0" value={set.weight_kg} onChange={(e) => updateActiveWorkoutSet(exIndex, setIndex, 'weight_kg', e.target.value)} className={baseInputClasses} />
                        <input type="number" placeholder="0" value={set.reps} onChange={(e) => updateActiveWorkoutSet(exIndex, setIndex, 'reps', e.target.value)} className={baseInputClasses} />
                        <button 
                          onClick={openRestModal}
                          className="p-3 rounded-md bg-bg-secondary border border-glass-border text-text-secondary hover:text-accent hover:border-accent/50 transition h-full flex items-center justify-center"
                          title="Iniciar descanso"
                        >
                            <Clock size={20} />
                        </button>
                    </div>
                ))}
            </div>
          </GlassCard>
        ))}
      </div>
      
      <GlassCard className="p-6 mt-6">
        <h2 className="flex items-center gap-2 text-xl font-bold mb-4">
          <FileText size={20} />
          Notas de la Sesión
        </h2>
        <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="¿Cómo te sentiste? ¿Alguna observación?..."
            className="w-full bg-bg-secondary border border-glass-border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition resize-none"
            rows="3"
        ></textarea>
      </GlassCard>

      {isResting && <RestTimerModal />}

      {showFinishModal &&
        <ConfirmationModal
            message="¿Finalizar y guardar el entrenamiento?"
            onConfirm={confirmFinishWorkout}
            onCancel={() => setShowFinishModal(false)}
            confirmText="Finalizar"
            isLoading={isSaving}
        />
      }

      {showCancelModal &&
        <ConfirmationModal
            message="¿Seguro que quieres descartar este entrenamiento? Perderás todo el progreso."
            onConfirm={confirmCancelWorkout}
            onCancel={() => setShowCancelModal(false)}
            confirmText="Descartar"
        />
      }
    </div>
  );
};

export default Workout;