import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Play, CheckCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import ConfirmationModal from '../components/ConfirmationModal';
import RoutineEditor from './RoutineEditor';
import { useToast } from '../hooks/useToast';
import Spinner from '../components/Spinner';
import useAppStore from '../store/useAppStore';
import { saveRoutine, deleteRoutine } from '../services/routineService';
import { isSameDay } from '../utils/helpers';

const Routines = ({ setView }) => {
  const { addToast } = useToast();
  const { routines, workoutLog, fetchInitialData, startWorkout } = useAppStore(state => ({
    routines: state.routines,
    workoutLog: state.workoutLog,
    fetchInitialData: state.fetchInitialData,
    startWorkout: state.startWorkout,
  }));

  const [editingRoutine, setEditingRoutine] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const completedToday = useMemo(() => {
    if (!Array.isArray(workoutLog)) return [];
    const today = new Date();
    // Creamos un Set de IDs de rutinas completadas hoy para una búsqueda más eficiente
    return new Set(
      workoutLog
        .filter(log => isSameDay(log.workout_date, today) && log.routine_id != null)
        .map(log => log.routine_id)
    );
  }, [workoutLog]);

  const handleSave = async (routineToSave) => {
    setIsLoading(true);
    try {
      await saveRoutine(routineToSave);
      addToast('Rutina guardada con éxito.', 'success');
      setEditingRoutine(null);
      await fetchInitialData();
    } catch (error) {
      const errorMessage = error.message || 'Ocurrió un error al guardar la rutina.';
      addToast(errorMessage, 'error');
    } finally {
        setIsLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setRoutineToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await deleteRoutine(routineToDelete);
      addToast('Rutina eliminada.', 'success');
      setShowDeleteModal(false);
      setRoutineToDelete(null);
      await fetchInitialData();
    } catch (error) {
      const errorMessage = error.message || 'Error al eliminar la rutina.';
      addToast(errorMessage, 'error');
    } finally {
        setIsLoading(false);
    }
  };

  if (editingRoutine) {
    return <RoutineEditor routine={editingRoutine} onSave={handleSave} onCancel={() => setEditingRoutine(null)} isLoading={isLoading} />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-10 animate-[fade-in_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-4xl font-extrabold">Mis Rutinas</h1>
        <button
          onClick={() => setEditingRoutine({ name: '', description: '', exercises: [] })}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent text-bg-secondary font-semibold transition hover:scale-105"
        >
          <Plus size={18} />
          Crear Rutina
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {routines && routines.length > 0 ? routines.map(routine => {
          // Ahora comprobamos si el ID de la rutina está en el Set de completadas
          const isCompleted = completedToday.has(routine.id);
          return (
            <GlassCard key={routine.id} className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start pb-4 border-b border-glass-border">
                <div>
                  <h2 className="text-xl font-bold">{routine.name}</h2>
                  {routine.description && <p className="text-sm text-text-secondary mt-1">{routine.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingRoutine(routine)} className="p-2 rounded-full text-text-muted hover:bg-white/10 hover:text-text-primary transition">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDeleteClick(routine.id)} className="p-2 rounded-full text-text-muted hover:bg-red/20 hover:text-red transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {routine.RoutineExercises && routine.RoutineExercises.length > 0 && (
                <div>
                  <h3 className="font-semibold text-text-secondary mb-2">Ejercicios:</h3>
                  <ul className="flex flex-col gap-2 pl-4 list-disc text-sm text-text-secondary">
                    {routine.RoutineExercises.map(ex => (
                      <li key={ex.id}>{ex.name} ({ex.sets}x{ex.reps})</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => {
                  startWorkout(routine);
                  setView('workout');
                }}
                disabled={isCompleted}
                className={`flex items-center justify-center gap-2 w-full mt-2 py-3 rounded-md font-semibold transition ${
                  isCompleted 
                  ? 'bg-neutral/20 text-text-muted cursor-not-allowed' 
                  : 'bg-accent text-bg-secondary hover:scale-[1.02]'
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle size={20} />
                    <span>Completada Hoy</span>
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    <span>Empezar Entrenamiento</span>
                  </>
                )}
              </button>
            </GlassCard>
          )
        }) : (
          <GlassCard className="text-center p-10">
            <p className="text-text-muted">Aún no has creado ninguna rutina.</p>
            <p className="text-text-muted">¡Haz clic en "Crear Rutina" para empezar!</p>
          </GlassCard>
        )}
      </div>

      {showDeleteModal && (
        <ConfirmationModal
          message="¿Estás seguro de que quieres borrar esta rutina?"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default Routines;