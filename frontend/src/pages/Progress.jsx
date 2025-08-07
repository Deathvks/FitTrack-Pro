import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ResponsiveContainer, LineChart, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { ChevronLeft, ChevronRight, X, ChevronDown, Trash2, BookOpen, TrendingUp, BarChartHorizontal, Trophy, Link2, Timer, Flame } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import ConfirmationModal from '../components/ConfirmationModal';
import ExerciseHistoryModal from './ExerciseHistoryModal';
import { calculateCalories } from '../utils/helpers';
import Spinner from '../components/Spinner';
import useAppStore from '../store/useAppStore';
import { useToast } from '../hooks/useToast';
import { getPersonalRecords } from '../services/personalRecordService';

const DailyDetailView = ({ logs, onClose }) => {
    const { userProfile, deleteWorkoutLog } = useAppStore(state => ({
        userProfile: state.userProfile,
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

    const latestWeight = userProfile?.weight || 75;
    const visibleLogs = logs.filter(log => !logToDelete || log.id !== logToDelete.id);
    const totalDuration = visibleLogs.reduce((acc, log) => acc + log.duration_seconds, 0);
    const totalCalories = visibleLogs.reduce((acc, log) => {
        const calories = log.calories_burned || calculateCalories(log.duration_seconds, latestWeight);
        return acc + calories;
    }, 0);

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]">
                <GlassCard className="relative w-full max-w-lg p-6 flex flex-col gap-4 m-4">
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
                                            <div className="bg-bg-primary p-3 rounded-md border-l-2 border-accent">
                                                <p className="font-semibold text-xs text-accent mb-1">Notas de la sesión</p>
                                                <p className="text-sm text-text-secondary whitespace-pre-wrap">{log.notes}</p>
                                            </div>
                                        )}
                                        
                                        {/* --- INICIO DE LA MODIFICACIÓN --- */}
                                        {isCardioOnly ? (
                                            <div className="bg-bg-primary rounded-md border border-glass-border p-3 flex justify-around text-center">
                                                <div>
                                                    <p className="text-xs text-text-secondary flex items-center gap-1"><Timer size={12}/> Duración</p>
                                                    <p className="font-bold">{Math.round(log.duration_seconds / 60)} min</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-text-secondary flex items-center gap-1"><Flame size={12}/> Calorías</p>
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
                                        {/* --- FIN DE LA MODIFICACIÓN --- */}
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

const CalendarView = ({ setDetailedLog }) => {
    const { workoutLog } = useAppStore(state => ({ workoutLog: state.workoutLog }));
    const [calendarDate, setCalendarDate] = useState(new Date());

    const workoutsByDate = useMemo(() => {
        return workoutLog.reduce((acc, log) => {
            const dateStr = new Date(log.workout_date).toISOString().split('T')[0];
            if (!acc[dateStr]) { acc[dateStr] = []; }
            acc[dateStr].push(log);
            return acc;
        }, {});
    }, [workoutLog]);

    const handleDayClick = (dateStr) => {
        const logsForDay = workoutsByDate[dateStr];
        if (logsForDay && logsForDay.length > 0) {
            setDetailedLog(logsForDay);
        }
    };

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const monthName = calendarDate.toLocaleString('es-ES', { month: 'long' });
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];
    const startDayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

    for (let i = 0; i < startDayOffset; i++) {
        days.push(<div key={`prev-${i}`} className="aspect-square"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = new Date(year, month, day).toISOString().split('T')[0];
        const hasWorkout = !!workoutsByDate[dateStr];
        days.push(
            <button
                key={day}
                disabled={!hasWorkout}
                onClick={() => handleDayClick(dateStr)}
                className={`flex items-center justify-center aspect-square rounded-full font-semibold transition-colors duration-200 ${hasWorkout
                    ? 'bg-accent text-bg-secondary hover:bg-accent/80 cursor-pointer'
                    : 'text-text-secondary'
                    }`}
            >
                {day}
            </button>
        );
    }

    return (
        <GlassCard className="p-6 max-w-xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCalendarDate(d => new Date(d.setMonth(d.getMonth() - 1)))} className="p-2 rounded-full hover:bg-white/10"><ChevronLeft /></button>
                <h2 className="text-xl font-bold capitalize">{monthName} {year}</h2>
                <button onClick={() => setCalendarDate(d => new Date(d.setMonth(d.getMonth() + 1)))} className="p-2 rounded-full hover:bg-white/10"><ChevronRight /></button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-text-secondary font-bold mb-2">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {days}
            </div>
        </GlassCard>
    );
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const displayLabel = typeof label === 'number'
            ? new Date(label).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
            : label;

        const value = payload[0].value;
        const key = payload[0].dataKey;

        const displayValue = `${key}: ${Number(value).toFixed(1)}`;

        return (
            <div className="p-2 bg-bg-secondary border border-glass-border rounded-md shadow-lg text-sm">
                <p className="font-semibold text-text-secondary">{displayLabel}</p>
                <p className="text-text-primary">{displayValue}</p>
            </div>
        );
    }
    return null;
};

const Progress = ({ darkMode }) => {
    const { workoutLog, bodyWeightLog, userProfile } = useAppStore(state => ({
        workoutLog: state.workoutLog,
        bodyWeightLog: state.bodyWeightLog,
        userProfile: state.userProfile,
    }));

    const [viewType, setViewType] = useState('exercise');
    const [detailedLog, setDetailedLog] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState('');
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const selectorRef = useRef(null);
    const [recordsData, setRecordsData] = useState({ records: [], totalPages: 1 });
    const [recordsPage, setRecordsPage] = useState(1);
    const [recordsLoading, setRecordsLoading] = useState(true);

    const fetchRecords = useCallback(async (page) => {
        setRecordsLoading(true);
        try {
            const data = await getPersonalRecords(page);
            setRecordsData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setRecordsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (viewType === 'records') {
            fetchRecords(recordsPage);
        }
    }, [viewType, recordsPage, fetchRecords]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target)) {
                setIsSelectorOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const bodyWeightChartData = useMemo(() => {
        return bodyWeightLog
            .map(log => {
                const weight = parseFloat(log.weight_kg);
                if (isNaN(weight)) {
                    return null;
                }
                const logDate = new Date(log.log_date);
                return {
                    timestamp: logDate.getTime(),
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
        if (!workoutLog || workoutLog.length === 0) {
            return progress;
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentLogs = workoutLog.filter(log => new Date(log.workout_date) >= thirtyDaysAgo);

        recentLogs.forEach(log => {
            if (log.WorkoutLogDetails) {
                log.WorkoutLogDetails.forEach(detail => {
                    if (detail.best_set_weight > 0) {
                        if (!progress[detail.exercise_name]) {
                            progress[detail.exercise_name] = [];
                        }
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

    useEffect(() => {
        if (allExercises.length > 0 && !selectedExercise) {
            setSelectedExercise(allExercises[0]);
        }
    }, [allExercises, selectedExercise]);

    const weeklyCaloriesData = useMemo(() => {
        const last7Days = {};
        const today = new Date();
        const latestWeight = bodyWeightLog.length > 0 ? parseFloat(bodyWeightLog[0].weight_kg) : userProfile?.weight || 75;
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            last7Days[key] = { name: d.toLocaleDateString('es-ES', { weekday: 'short' }), 'Calorías': 0 };
        }
        workoutLog.forEach(log => {
            const logDate = new Date(log.workout_date).toISOString().split('T')[0];
            if (last7Days[logDate]) {
                last7Days[logDate]['Calorías'] += calculateCalories(log.duration_seconds, latestWeight);
            }
        });
        return Object.values(last7Days);
    }, [workoutLog, bodyWeightLog, userProfile]);

    const handleSelectExercise = (exercise) => {
        setSelectedExercise(exercise);
        setIsSelectorOpen(false);
    };

    const axisColor = darkMode ? "#94a3b8" : "#475569";

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 animate-[fade-in_0.5s_ease-out]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <h1 className="text-4xl font-extrabold">Tu Progreso</h1>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setViewType('exercise')} className={`px-4 py-2 text-sm font-semibold rounded-full transition ${viewType === 'exercise' ? 'bg-accent text-bg-secondary' : 'bg-bg-secondary hover:bg-white/10'}`}>Por Ejercicio</button>
                    <button onClick={() => setViewType('records')} className={`px-4 py-2 text-sm font-semibold rounded-full transition ${viewType === 'records' ? 'bg-accent text-bg-secondary' : 'bg-bg-secondary hover:bg-white/10'}`}>Récords</button>
                    <button onClick={() => setViewType('bodyWeight')} className={`px-4 py-2 text-sm font-semibold rounded-full transition ${viewType === 'bodyWeight' ? 'bg-accent text-bg-secondary' : 'bg-bg-secondary hover:bg-white/10'}`}>Peso Corporal</button>
                    <button onClick={() => setViewType('calories')} className={`px-4 py-2 text-sm font-semibold rounded-full transition ${viewType === 'calories' ? 'bg-accent text-bg-secondary' : 'bg-bg-secondary hover:bg-white/10'}`}>Calorías</button>
                    <button onClick={() => setViewType('calendar')} className={`px-4 py-2 text-sm font-semibold rounded-full transition ${viewType === 'calendar' ? 'bg-accent text-bg-secondary' : 'bg-bg-secondary hover:bg-white/10'}`}>Calendario</button>
                </div>
            </div>

            {viewType === 'records' && (
                <GlassCard className="p-6">
                    <h2 className="text-xl font-bold mb-4">Récords Personales (PRs)</h2>
                    {recordsLoading ? (
                        <div className="flex justify-center items-center h-40"><Spinner /></div>
                    ) : recordsData.records.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recordsData.records.map(pr => (
                                    <div key={pr.id} className="bg-bg-secondary p-4 rounded-md border-l-4 border-accent">
                                        <p className="font-bold text-text-primary truncate">{pr.exercise_name}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Trophy size={20} className="text-yellow-400" />
                                            <p className="text-2xl font-extrabold">{pr.weight_kg}<span className="text-base font-medium text-text-muted"> kg</span></p>
                                        </div>
                                        <p className="text-xs text-text-muted mt-1">
                                            Establecido el: {new Date(pr.date).toLocaleDateString('es-ES')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center items-center gap-4 mt-6 pt-4 border-t border-glass-border">
                                <button
                                    onClick={() => setRecordsPage(p => p - 1)}
                                    disabled={recordsPage <= 1}
                                    className="p-2 rounded-md bg-bg-secondary disabled:opacity-50"
                                >
                                    <ChevronLeft />
                                </button>
                                <span className="font-semibold text-text-secondary">Página {recordsData.currentPage} de {recordsData.totalPages}</span>
                                <button
                                    onClick={() => setRecordsPage(p => p + 1)}
                                    disabled={recordsPage >= recordsData.totalPages}
                                    className="p-2 rounded-md bg-bg-secondary disabled:opacity-50"
                                >
                                    <ChevronRight />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-40 text-text-muted">
                            <p>Aún no has establecido ningún récord. ¡Sigue entrenando!</p>
                        </div>
                    )}
                </GlassCard>
            )}

            {viewType === 'bodyWeight' && (
                <GlassCard className="p-6">
                    <h2 className="text-xl font-bold mb-4">Evolución del Peso</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={bodyWeightChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                            <XAxis
                                type="number"
                                dataKey="timestamp"
                                domain={['dataMin', 'dataMax']}
                                tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                                stroke={axisColor}
                                fontSize={12}
                            />
                            <YAxis
                                stroke={axisColor}
                                fontSize={12}
                                domain={[
                                    dataMin => (Math.floor(dataMin / 5) * 5) - 5,
                                    dataMax => (Math.ceil(dataMax / 5) * 5) + 5
                                ]}
                                allowDataOverflow={true}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ color: axisColor }} />
                            <Line type="monotone" dataKey="Peso (kg)" stroke="#facc15" strokeWidth={2} dot={{ r: 4, fill: '#facc15' }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </GlassCard>
            )}

            {viewType === 'calories' && (
                <GlassCard className="p-6">
                    <h2 className="text-xl font-bold mb-4">Calorías Quemadas (Últimos 7 días)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={weeklyCaloriesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                            <XAxis dataKey="name" stroke={axisColor} fontSize={12} />
                            <YAxis stroke={axisColor} fontSize={12} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-accent-transparent)' }} />
                            <Bar dataKey="Calorías" fill="#facc15" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </GlassCard>
            )}

            {viewType === 'calendar' && <CalendarView setDetailedLog={setDetailedLog} />}

            {viewType === 'exercise' && (
                <div className="flex flex-col gap-6">
                    <div className="flex items-end gap-4">
                        <div className="relative w-full max-w-xs z-10" ref={selectorRef}>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Selecciona un ejercicio</label>
                            <button onClick={() => setIsSelectorOpen(!isSelectorOpen)} className="flex items-center justify-between w-full p-3 bg-bg-secondary border border-glass-border rounded-md">
                                <span>{selectedExercise || 'Elige un ejercicio'}</span>
                                <ChevronDown size={20} className={`transition-transform duration-200 ${isSelectorOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isSelectorOpen && (
                                <div className="absolute top-full mt-2 w-full bg-bg-secondary border border-glass-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {allExercises.length > 0 ? (
                                        allExercises.map(ex => <button key={ex} onClick={() => handleSelectExercise(ex)} className="block w-full text-left px-4 py-2 hover:bg-accent-transparent">{ex}</button>)
                                    ) : (<div className="px-4 py-2 text-text-muted">No hay ejercicios</div>)}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowHistoryModal(true)}
                            disabled={!selectedExercise}
                            className="p-3 rounded-md bg-bg-secondary border border-glass-border text-text-secondary transition enabled:hover:text-accent enabled:hover:border-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Ver historial detallado"
                        >
                            <BookOpen size={20} />
                        </button>
                    </div>

                    <GlassCard className="p-6">
                        <h2 className="text-xl font-bold mb-4">Progresión de Peso (Último Mes)</h2>
                        {selectedExercise && exerciseProgressData[selectedExercise] && exerciseProgressData[selectedExercise].length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={exerciseProgressData[selectedExercise]} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                                    <XAxis
                                        type="number"
                                        dataKey="date"
                                        domain={['dataMin', 'dataMax']}
                                        tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                                        stroke={axisColor}
                                        fontSize={12}
                                    />
                                    <YAxis stroke={axisColor} fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ color: axisColor }} />
                                    <Line type="monotone" dataKey="Peso Máximo (kg)" stroke="#818cf8" strokeWidth={2} dot={{ r: 4, fill: '#818cf8' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-text-muted">
                                <p>{selectedExercise ? 'No hay datos de progreso para este ejercicio en el último mes.' : 'Selecciona un ejercicio para ver tu progreso.'}</p>
                            </div>
                        )}
                    </GlassCard>
                </div>
            )}

            {detailedLog && <DailyDetailView logs={detailedLog} onClose={() => setDetailedLog(null)} />}

            {showHistoryModal && (
                <ExerciseHistoryModal
                    exerciseName={selectedExercise}
                    workoutLog={workoutLog}
                    onClose={() => setShowHistoryModal(false)}
                />
            )}
        </div>
    );
};

export default Progress;