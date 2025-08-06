import React, { useState, useMemo } from 'react';
import { Dumbbell, Target, Clock, Flame, Plus, Play, ArrowUp, ArrowDown, Minus, Edit } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import BodyWeightModal from '../components/BodyWeightModal';
import { calculateCalories } from '../utils/helpers';
import useAppStore from '../store/useAppStore';

const isSameDay = (dateFromServer, localDate) => {
    const serverDate = new Date(dateFromServer);
    return serverDate.getFullYear() === localDate.getFullYear() &&
        serverDate.getMonth() === localDate.getMonth() &&
        serverDate.getDate() === localDate.getDate();
};

const Dashboard = ({ setView }) => {
    // --- INICIO DE LA MODIFICACIÓN ---
    const {
        routines,
        workoutLog,
        bodyWeightLog,
        userProfile,
        logBodyWeight,
        updateTodayBodyWeight,
        startWorkout // 1. Obtenemos la acción para iniciar el entreno
    } = useAppStore(state => ({
        routines: state.routines,
        workoutLog: state.workoutLog,
        bodyWeightLog: state.bodyWeightLog,
        userProfile: state.userProfile,
        logBodyWeight: state.logBodyWeight,
        updateTodayBodyWeight: state.updateTodayBodyWeight,
        startWorkout: state.startWorkout,
    }));
    // --- FIN DE LA MODIFICACIÓN ---

    const [showWeightModal, setShowWeightModal] = useState(false);

    const sortedWeightLog = useMemo(() =>
        [...bodyWeightLog].sort((a, b) => new Date(b.log_date) - new Date(a.log_date)),
        [bodyWeightLog]
    );

    const todaysLog = useMemo(() =>
        sortedWeightLog.find(log => isSameDay(log.log_date, new Date())),
        [sortedWeightLog]
    );

    const weeklyLogs = useMemo(() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        return workoutLog.filter(log => new Date(log.workout_date) >= startOfWeek);
    }, [workoutLog]);

    const weeklySessions = weeklyLogs.length;
    const weeklyTimeInSeconds = weeklyLogs.reduce((acc, log) => acc + log.duration_seconds, 0);

    let displayTime;
    let timeUnit;

    if (weeklyTimeInSeconds < 3600) {
        displayTime = Math.round(weeklyTimeInSeconds / 60);
        timeUnit = 'minutos';
    } else {
        displayTime = (weeklyTimeInSeconds / 3600).toFixed(1);
        timeUnit = 'horas';
    }

    const latestWeight = sortedWeightLog.length > 0 ? parseFloat(sortedWeightLog[0].weight_kg) : null;

    const totalCaloriesWeekly = weeklyLogs.reduce((acc, log) =>
        acc + calculateCalories(log.duration_seconds, latestWeight ?? 75),
        0
    );

    const calorieTarget = useMemo(() => {
        if (!userProfile || !latestWeight || !userProfile.goal) return null;
        const { gender, age, height, activity_level, goal } = userProfile;
        let bmr = gender === 'male'
            ? 88.362 + (13.397 * latestWeight) + (4.799 * height) - (5.677 * age)
            : 447.593 + (9.247 * latestWeight) + (3.098 * height) - (4.330 * age);
        let target = bmr * activity_level;
        if (goal === 'lose') target -= 500;
        if (goal === 'gain') target += 500;
        return Math.round(target);
    }, [userProfile, latestWeight]);

    // --- INICIO DE LA MODIFICACIÓN ---
    // 2. Creamos una función que primero inicia el entreno y LUEGO cambia la vista
    const handleStartWorkout = (routine) => {
        startWorkout(routine);
        setView('workout');
    };
    // --- FIN DE LA MODIFICACIÓN ---


    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 animate-[fade-in_0.5s_ease-out]">
            <h1 className="text-4xl font-extrabold mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard icon={<Dumbbell size={24} />} title="Sesiones Semanales" value={weeklySessions} unit="" />
                <StatCard icon={<Target size={24} />} title="Objetivo Diario" value={calorieTarget?.toLocaleString('es-ES') ?? 'N/A'} unit="kcal" />
                <StatCard icon={<Clock size={24} />} title="Tiempo Semanal" value={displayTime} unit={timeUnit} />
                <StatCard icon={<Flame size={24} />} title="Calorías Semanales" value={totalCaloriesWeekly.toLocaleString('es-ES')} unit="kcal" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <GlassCard className="p-6 flex flex-col gap-4">
                    <h2 className="text-xl font-bold">Iniciar un Entrenamiento</h2>
                    <div className="flex flex-col gap-3">
                        {routines.length > 0 ? (
                            routines.slice(0, 3).map(routine => (
                                // --- INICIO DE LA MODIFICACIÓN ---
                                // 3. El botón ahora llama a nuestra nueva función
                                <button key={routine.id} onClick={() => handleStartWorkout(routine)} className="flex justify-between items-center w-full p-4 rounded-md border border-glass-border hover:bg-white/10 transition-colors">
                                    <span className="font-semibold">{routine.name}</span>
                                    <Play size={20} />
                                </button>
                                // --- FIN DE LA MODIFICACIÓN ---
                            ))
                        ) : (
                            <p className="text-text-muted text-center py-4">No tienes rutinas. ¡Crea una para empezar!</p>
                        )}
                    </div>
                    <button onClick={() => setView('routines')} className="flex items-center justify-center gap-2 w-full rounded-md bg-accent/10 text-accent font-semibold py-3 border border-accent/20 hover:bg-accent/20 transition-colors">
                        <Plus size={20} />
                        <span>Gestionar Rutinas</span>
                    </button>
                </GlassCard>

                <GlassCard className="p-6 flex flex-col gap-4">
                    <h2 className="text-xl font-bold">Registro de Peso</h2>
                    <div className="text-center">
                        <p className="text-sm text-text-secondary">Peso Actual</p>
                        <p className="text-5xl font-extrabold">
                            {latestWeight ? latestWeight.toFixed(1) : '--'}
                            <span className="text-2xl font-bold text-text-muted ml-1">kg</span>
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h3 className="font-semibold text-text-secondary">Historial Reciente</h3>
                        {sortedWeightLog.length > 0 ? sortedWeightLog.slice(0, 4).map((log, index) => {
                            const currentWeight = parseFloat(log.weight_kg);
                            const prevLog = sortedWeightLog[index + 1];
                            const prevWeight = prevLog ? parseFloat(prevLog.weight_kg) : null;
                            const change = prevWeight !== null ? currentWeight - prevWeight : 0;

                            const status = change > 0.01 ? 'up' : change < -0.01 ? 'down' : 'same';
                            const isGoodChange = (userProfile?.goal === 'lose' && status === 'down') || (userProfile?.goal === 'gain' && status === 'up');
                            const isBadChange = (userProfile?.goal === 'lose' && status === 'up') || (userProfile?.goal === 'gain' && status === 'down');

                            const statusColor = isGoodChange ? 'text-green' : isBadChange ? 'text-red' : 'text-neutral';

                            return (
                                <div key={log.id} className="flex justify-between items-center bg-bg-secondary/50 p-3 rounded-md">
                                    <div>
                                        <span className="font-semibold">{currentWeight.toFixed(1)} kg</span>
                                        <span className="text-sm text-text-muted ml-2">{new Date(log.log_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                                    </div>
                                    {prevLog && (
                                        <div className={`flex items-center gap-1 text-sm font-semibold ${statusColor}`}>
                                            {status === 'up' && <ArrowUp size={14} />}
                                            {status === 'down' && <ArrowDown size={14} />}
                                            {status === 'same' && <Minus size={14} />}
                                            <span>{change.toFixed(1)} kg</span>
                                        </div>
                                    )}
                                </div>
                            );
                        }) : (
                            <p className="text-text-muted text-center py-4">No hay registros de peso todavía.</p>
                        )}
                    </div>
                    <button onClick={() => setShowWeightModal(true)} className="flex items-center justify-center gap-2 w-full rounded-md bg-accent/10 text-accent font-semibold py-3 border border-accent/20 hover:bg-accent/20 transition-colors">
                        {todaysLog ? <><Edit size={20} /><span>Editar Peso de Hoy</span></> : <><Plus size={20} /><span>Registrar Peso</span></>}
                    </button>
                </GlassCard>
            </div>

            {showWeightModal &&
                <BodyWeightModal
                    onClose={() => setShowWeightModal(false)}
                    onSave={todaysLog ? updateTodayBodyWeight : logBodyWeight}
                    existingLog={todaysLog}
                />
            }
        </div>
    );
};

export default Dashboard;