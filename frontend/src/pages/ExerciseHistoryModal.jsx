import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const ExerciseHistoryModal = ({ exerciseName, workoutLog, onClose }) => {
    const history = useMemo(() => {
        return workoutLog
            .map(log => ({
                date: new Date(log.workout_date),
                details: log.WorkoutLogDetails.find(detail => detail.exercise_name === exerciseName),
            }))
            .filter(entry => entry.details)
            .sort((a, b) => b.date.getTime() - a.date.getTime()); 
    }, [exerciseName, workoutLog]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]">
            <GlassCard className="relative w-full max-w-lg p-6 flex flex-col gap-4 m-4">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"><X size={20} /></button>
                
                <div className="text-center pb-4 border-b border-glass-border">
                    <h3 className="text-xl font-bold">Historial de {exerciseName}</h3>
                </div>

                <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                    {history.length > 0 ? (
                        history.map((entry, index) => (
                            <div key={index} className="bg-bg-secondary p-4 rounded-md">
                                <p className="font-bold text-accent mb-2">
                                    {entry.date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                                <ul className="space-y-1 text-sm">
                                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                                    {entry.details.WorkoutLogSets
                                        .slice() // Crea una copia para no mutar el estado original
                                        .sort((a, b) => a.set_number - b.set_number) // Ordena las series por su número
                                        .map(set => (
                                            <li key={set.id} className="bg-bg-primary p-2 rounded flex justify-between items-center">
                                                <span>
                                                    Serie {set.set_number}: <strong>{set.reps} reps</strong> con <strong>{set.weight_kg} kg</strong>
                                                </span>
                                                {set.is_dropset && (
                                                    <span className="bg-accent/20 text-accent font-bold px-2 py-0.5 rounded-full text-[10px]">
                                                        DROPSET
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    {/* --- FIN DE LA MODIFICACIÓN --- */}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-text-muted py-8">No hay historial registrado para este ejercicio.</p>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

export default ExerciseHistoryModal;