import React, { useState, useMemo } from 'react';
import useAppStore from '../store/useAppStore';
import ExerciseHistoryModal from './ExerciseHistoryModal';
import DailyDetailView from '../components/progress/DailyDetailView';
import CalendarView from '../components/progress/CalendarView';
import { BodyWeightChart } from '../components/progress/ProgressCharts';
import ExerciseView from '../components/progress/ExerciseView';
import NutritionView from '../components/progress/NutritionView';
import RecordsView from '../components/progress/RecordsView';

const Progress = ({ darkMode }) => {
    const { workoutLog, bodyWeightLog } = useAppStore(state => ({
        workoutLog: state.workoutLog,
        bodyWeightLog: state.bodyWeightLog,
    }));

    const [viewType, setViewType] = useState('exercise');
    const [detailedLog, setDetailedLog] = useState(null);
    const [exerciseForHistory, setExerciseForHistory] = useState('');
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    const bodyWeightChartData = useMemo(() => {
        return bodyWeightLog
            .map(log => {
                const weight = parseFloat(log.weight_kg);
                if (isNaN(weight)) return null;
                return {
                    timestamp: new Date(log.log_date).getTime(),
                    'Peso (kg)': weight,
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.timestamp - b.timestamp);
    }, [bodyWeightLog]);

    const allExercises = useMemo(() => {
        const exerciseSet = new Set(
            workoutLog.flatMap(log => log.WorkoutLogDetails?.map(d => d.exercise_name) || [])
        );
        return Array.from(exerciseSet);
    }, [workoutLog]);

    const exerciseProgressData = useMemo(() => {
        const progress = {};
        if (!workoutLog || workoutLog.length === 0) return progress;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentLogs = workoutLog.filter(log => new Date(log.workout_date) >= thirtyDaysAgo);

        recentLogs.forEach(log => {
            if (log.WorkoutLogDetails) {
                log.WorkoutLogDetails.forEach(detail => {
                    if (detail.best_set_weight > 0) {
                        if (!progress[detail.exercise_name]) progress[detail.exercise_name] = [];
                        progress[detail.exercise_name].push({
                            date: new Date(log.workout_date).getTime(),
                            'Peso Máximo (kg)': detail.best_set_weight,
                        });
                    }
                });
            }
        });

        for (const exerciseName in progress) {
            progress[exerciseName].sort((a, b) => a.date - b.date);
        }
        return progress;
    }, [workoutLog]);

    const handleShowHistory = (exerciseName) => {
        setExerciseForHistory(exerciseName);
        setShowHistoryModal(true);
    };

    const axisColor = darkMode ? "#94a3b8" : "#475569";

    // --- INICIO DE LA CORRECCIÓN ---
    // Se elimina toda la lógica de gestión de estado y efectos
    // que antes estaban aquí para la vista de nutrición.
    // Ahora cada vista es independiente.
    const renderView = () => {
        switch (viewType) {
            case 'exercise':
                return <ExerciseView allExercises={allExercises} exerciseProgressData={exerciseProgressData} axisColor={axisColor} onShowHistory={handleShowHistory} />;
            case 'nutrition':
                return <NutritionView axisColor={axisColor} />;
            case 'records':
                return <RecordsView />;
            case 'bodyWeight':
                return <BodyWeightChart data={bodyWeightChartData} axisColor={axisColor} />;
            case 'calendar':
                return <CalendarView setDetailedLog={setDetailedLog} />;
            default:
                return null;
        }
    };
    // --- FIN DE LA CORRECCIÓN ---

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 animate-[fade-in_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <h1 className="text-4xl font-extrabold">Tu Progreso</h1>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setViewType('exercise')} className={`px-4 py-2 text-sm font-semibold rounded-full transition ${viewType === 'exercise' ? 'bg-accent text-bg-secondary' : 'bg-bg-secondary hover:bg-white/10'}`}>Por Ejercicio</button>
                    <button onClick={() => setViewType('nutrition')} className={`px-4 py-2 text-sm font-semibold rounded-full transition ${viewType === 'nutrition' ? 'bg-accent text-bg-secondary' : 'bg-bg-secondary hover:bg-white/10'}`}>Nutrición</button>
                    <button onClick={() => setViewType('records')} className={`px-4 py-2 text-sm font-semibold rounded-full transition ${viewType === 'records' ? 'bg-accent text-bg-secondary' : 'bg-bg-secondary hover:bg-white/10'}`}>Récords</button>
                    <button onClick={() => setViewType('bodyWeight')} className={`px-4 py-2 text-sm font-semibold rounded-full transition ${viewType === 'bodyWeight' ? 'bg-accent text-bg-secondary' : 'bg-bg-secondary hover:bg-white/10'}`}>Peso Corporal</button>
                    <button onClick={() => setViewType('calendar')} className={`px-4 py-2 text-sm font-semibold rounded-full transition ${viewType === 'calendar' ? 'bg-accent text-bg-secondary' : 'bg-bg-secondary hover:bg-white/10'}`}>Calendario</button>
                </div>
            </div>

            {renderView()}

            {detailedLog && <DailyDetailView logs={detailedLog} onClose={() => setDetailedLog(null)} />}
            {showHistoryModal && <ExerciseHistoryModal exerciseName={exerciseForHistory} workoutLog={workoutLog} onClose={() => setShowHistoryModal(false)} />}
        </div>
    );
};

export default Progress;