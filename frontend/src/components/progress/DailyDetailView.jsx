import React, { useState, useMemo } from 'react';
import { X, Trash2, Link2, Timer, Flame, BarChartHorizontal, TrendingUp } from 'lucide-react';
import GlassCard from '../GlassCard';
import ConfirmationModal from '../ConfirmationModal';
import { calculateCalories } from '../../utils/helpers';
import useAppStore from '../../store/useAppStore';
import { useToast } from '../../hooks/useToast';

const DailyDetailView = ({ logs, onClose }) => {
    const { userProfile, bodyWeightLog, deleteWorkoutLog } = useAppStore(state => ({
        userProfile: state.userProfile,
        bodyWeightLog: state.bodyWeightLog,
        deleteWorkoutLog: state.deleteWorkoutLog,
    }));
    const { addToast } = useToast();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [logToDelete, setLogToDelete] = useState(null);

    const handleDeleteClick = (log) => {
        setLogToDelete(log);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (logToDelete) {
            const result = await deleteWorkoutLog(logToDelete.id);
            if (result.success) {
                addToast(result.message, 'success');
                if (logs.length === 1) {
                    onClose();
                }
            } else {
                addToast(result.message, 'error');
            }
            setShowDeleteConfirm(false);
            setLogToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setLogToDelete(null);
    };

    const groupExercises = (exercises) => {
        if (!exercises || exercises.length === 0) return [];
        const groups = [];
        let currentGroup = [];

        for (const ex of exercises) {
            if (currentGroup.length === 0) {
                currentGroup.push(ex);
                continue;
            }

            if (ex.superset_group_id !== null && ex.superset_group_id === currentGroup[0].superset_group_id) {
                currentGroup.push(ex);
            } else {
                groups.push(currentGroup);
                currentGroup = [ex];
            }
        }
        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }
        return groups;
    };

    const latestWeight = useMemo(() => {
        if (!bodyWeightLog || bodyWeightLog.length === 0) return 75;
        const sortedLog = [...bodyWeightLog].sort((a, b) => new Date(b.log_date) - new Date(a.log_date));
        return parseFloat(sortedLog[0].weight_kg);
    }, [bodyWeightLog]);

    const visibleLogs = logs.filter(log => !logToDelete || log.id !== logToDelete.id);
    const totalDuration = visibleLogs.reduce((acc, log) => acc + log.duration_seconds, 0);
    const totalCalories = visibleLogs.reduce((acc, log) => {
        const calories = log.calories_burned || calculateCalories(log.duration_seconds, latestWeight);
        return acc + calories;
    }, 0);

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]">
                <GlassCard className="relative w-full max-w-lg p-6 flex flex-col gap-4 m-4 bg-bg-secondary shadow-2xl">
                    <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"><X size={20} /></button>
                    <div className="text-center pb-4 border-b border-glass-border">
                        <h3 className="text-xl font-bold">Resumen del Día</h3>
                        <p className="text-text-muted text-sm">{new Date(logs[0].workout_date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <span className="text-sm text-text-secondary">Duración Total: <strong>{Math.round(totalDuration / 60)} min</strong></span>
                        </div>
                        <div>
                            <span className="text-sm text-text-secondary">Calorías (est.): <strong>{totalCalories} kcal</strong></span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 border-t border-glass-border pt-4 max-h-[45vh] overflow-y-auto">
                        <h4 className="font-semibold">Entrenamientos Registrados</h4>
                        {visibleLogs.map((log) => {
                            const exerciseGroups = groupExercises(log.WorkoutLogDetails);
                            const isCardioOnly = !log.WorkoutLogDetails || log.WorkoutLogDetails.length === 0;

                            return (
                                <div key={log.id} className="bg-bg-secondary rounded-md">
                                    <div className="flex justify-between items-center p-3">
                                        <h5 className="font-bold text-accent">{log.routine_name}</h5>
                                        <button onClick={() => handleDeleteClick(log)} className="p-2 -m-2 rounded-full text-text-muted hover:bg-red/20 hover:text-red transition">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="px-3 pb-3 space-y-3">
                                        {log.notes && (
                                            <div className="bg-[--glass-bg] p-3 rounded-md border-l-2 border-accent">
                                                <p className="font-semibold text-xs text-accent mb-1">Notas de la sesión</p>
                                                <p className="text-sm text-text-secondary whitespace-pre-wrap">{log.notes}</p>
                                            </div>
                                        )}
                                        {isCardioOnly ? (
                                            <div className="bg-bg-primary rounded-md border border-glass-border p-3 flex justify-around text-center">
                                                <div>
                                                    <p className="text-xs text-text-secondary flex items-center gap-1"><Timer size={12} /> Duración</p>
                                                    <p className="font-bold">{Math.round(log.duration_seconds / 60)} min</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-text-secondary flex items-center gap-1"><Flame size={12} /> Calorías</p>
                                                    <p className="font-bold">{log.calories_burned} kcal</p>
                                                </div>
                                            </div>
                                        ) : (
                                            exerciseGroups.map((group, groupIndex) => (
                                                <div key={groupIndex} className="bg-bg-primary rounded-md border border-glass-border">
                                                    {group.length > 1 && (
                                                        <div className="flex items-center gap-2 p-2 text-accent text-sm font-semibold border-b border-glass-border bg-accent/10">
                                                            <Link2 size={14} />
                                                            <span>Superserie</span>
                                                        </div>
                                                    )}
                                                    <div className="p-3">
                                                        {group.map((exercise, exIdx) => (
                                                            <div key={exIdx} className={exIdx > 0 ? 'mt-3 pt-3 border-t border-glass-border' : ''}>
                                                                <p className="font-semibold">{exercise.exercise_name}</p>
                                                                <div className="flex gap-4 text-xs text-text-muted my-2">
                                                                    <div className="flex items-center gap-1"><BarChartHorizontal size={12} /><span>Volumen: <strong>{exercise.total_volume} kg</strong></span></div>
                                                                    <div className="flex items-center gap-1"><TrendingUp size={12} /><span>Mejor Set: <strong>{exercise.best_set_weight} kg</strong></span></div>
                                                                </div>
                                                                <ul className="space-y-1 text-sm">
                                                                    {exercise.WorkoutLogSets && exercise.WorkoutLogSets.length > 0 ? (
                                                                        exercise.WorkoutLogSets.map((set, setIdx) => (
                                                                            <li key={setIdx} className="flex items-center justify-between bg-bg-secondary/50 p-2 rounded text-xs">
                                                                                <span>
                                                                                    Serie {set.set_number}: <strong>{set.reps} reps</strong> con <strong>{set.weight_kg} kg</strong>
                                                                                </span>
                                                                                {set.is_dropset && (
                                                                                    <span className="bg-accent/20 text-accent font-bold px-2 py-0.5 rounded-full text-[10px]">
                                                                                        DROPSET
                                                                                    </span>
                                                                                )}
                                                                            </li>
                                                                        ))
                                                                    ) : (
                                                                        <li className="text-text-muted text-xs">No se registraron series.</li>
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>
            </div>
            {showDeleteConfirm && (
                <ConfirmationModal
                    message="¿Estás seguro de que quieres borrar este entrenamiento? Esta acción no se puede deshacer."
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </>
    );
};
export default DailyDetailView;