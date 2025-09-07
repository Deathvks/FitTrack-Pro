import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Droplet, Flame, Beef, Wheat, Salad, Edit, Trash2, Zap } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import StatCard from '../components/StatCard';
import Spinner from '../components/Spinner';
import useAppStore from '../store/useAppStore';
import WaterLogModal from '../components/WaterLogModal';
import NutritionLogModal from '../components/NutritionLogModal';
import ConfirmationModal from '../components/ConfirmationModal';
import CreatinaTracker from '../components/CreatinaTracker';
import { useToast } from '../hooks/useToast';
import * as nutritionService from '../services/nutritionService';

// Componente para el selector de fecha (sin cambios)
const DateNavigator = ({ selectedDate, onDateChange }) => {
    const today = new Date();
    const date = new Date(selectedDate);

    const changeDay = (amount) => {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + amount);
        onDateChange(newDate.toISOString().split('T')[0]);
    };

    const isToday = today.toISOString().split('T')[0] === selectedDate;

    return (
        <div className="flex items-center justify-between mb-8">
            <button onClick={() => changeDay(-1)} className="p-2 rounded-full hover:bg-white/10 transition">
                <ChevronLeft />
            </button>
            <div className="text-center">
                <h2 className="text-xl font-bold">
                    {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h2>
                {isToday && <span className="text-xs font-semibold text-accent">HOY</span>}
            </div>
            <button onClick={() => changeDay(1)} disabled={isToday} className="p-2 rounded-full hover:bg-white/10 transition disabled:opacity-50">
                <ChevronRight />
            </button>
        </div>
    );
};


// Componente principal de la página de Nutrición
const Nutrition = () => {
    const { addToast } = useToast();
    const {
        userProfile,
        nutritionLog,
        waterLog,
        selectedDate,
        fetchDataForDate,
        isLoading,
        bodyWeightLog,
    } = useAppStore(state => ({
        userProfile: state.userProfile,
        nutritionLog: state.nutritionLog,
        waterLog: state.waterLog,
        selectedDate: state.selectedDate,
        fetchDataForDate: state.fetchDataForDate,
        isLoading: state.isLoading,
        bodyWeightLog: state.bodyWeightLog,
    }));

    const [modal, setModal] = useState({ type: null, data: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logToDelete, setLogToDelete] = useState(null);
    const [showCreatinaTracker, setShowCreatinaTracker] = useState(false);

    const latestWeight = useMemo(() => {
        if (!bodyWeightLog || bodyWeightLog.length === 0) return userProfile?.weight || null;
        const sortedLog = [...bodyWeightLog].sort((a, b) => new Date(b.log_date) - new Date(a.log_date));
        return parseFloat(sortedLog[0].weight_kg);
    }, [bodyWeightLog, userProfile]);

    const calorieTarget = useMemo(() => {
        if (!userProfile || !userProfile.goal || !latestWeight) return 2000;
        const { gender, age, height, activity_level, goal } = userProfile;
        let bmr = gender === 'male'
            ? 88.362 + (13.397 * latestWeight) + (4.799 * height) - (5.677 * age)
            : 447.593 + (9.247 * latestWeight) + (3.098 * height) - (4.330 * age);
        let target = bmr * activity_level;
        if (goal === 'lose') target -= 500;
        if (goal === 'gain') target += 500;
        return Math.round(target);
    }, [userProfile, latestWeight]);

    const proteinTarget = useMemo(() => {
        if (!latestWeight || !userProfile?.goal) return 0;
        const multiplier = userProfile.goal === 'gain' ? 2.0 : userProfile.goal === 'lose' ? 1.8 : 1.6;
        return Math.round(latestWeight * multiplier);
    }, [latestWeight, userProfile]);
    
    const waterTarget = useMemo(() => {
        if (!latestWeight) return 2500;
        return Math.round(latestWeight * 35);
    }, [latestWeight]);

    const handleSaveWater = async (quantity_ml) => {
        setIsSubmitting(true);
        try {
            await nutritionService.upsertWaterLog({ log_date: selectedDate, quantity_ml });
            addToast('Registro de agua actualizado.', 'success');
            await fetchDataForDate(selectedDate);
            setModal({ type: null, data: null });
        } catch (error) {
            addToast(error.message || 'Error al guardar el agua.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveFood = async (formData) => {
        setIsSubmitting(true);
        try {
            if (modal.data?.id) { // Editando
                await nutritionService.updateFoodLog(modal.data.id, formData);
                addToast('Comida actualizada.', 'success');
            } else { // Creando
                const payload = { ...formData, log_date: selectedDate, meal_type: modal.data.mealType };
                await nutritionService.addFoodLog(payload);
                addToast('Comida añadida.', 'success');
            }
            await fetchDataForDate(selectedDate);
            setModal({ type: null, data: null });
        } catch (error) {
            addToast(error.message || 'Error al guardar la comida.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteFood = async () => {
        if (!logToDelete) return;
        setIsSubmitting(true);
        try {
            await nutritionService.deleteFoodLog(logToDelete.id);
            addToast('Comida eliminada.', 'success');
            await fetchDataForDate(selectedDate);
            setLogToDelete(null);
        } catch (error) {
            addToast(error.message || 'Error al eliminar la comida.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const totals = useMemo(() => {
        const result = { calories: 0, protein: 0, carbs: 0, fats: 0 };
        nutritionLog.forEach(log => {
            result.calories += log.calories || 0;
            result.protein += parseFloat(log.protein_g) || 0;
            result.carbs += parseFloat(log.carbs_g) || 0;
            result.fats += parseFloat(log.fats_g) || 0;
        });
        return result;
    }, [nutritionLog]);

    const meals = useMemo(() => {
        const mealData = { breakfast: [], lunch: [], dinner: [], snack: [] };
        nutritionLog.forEach(log => {
            if (mealData[log.meal_type]) {
                mealData[log.meal_type].push(log);
            }
        });
        return mealData;
    }, [nutritionLog]);

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-10 animate-[fade-in_0.5s_ease-out]">
            <h1 className="text-4xl font-extrabold mb-4">Seguimiento de Nutrición</h1>
            <DateNavigator selectedDate={selectedDate} onDateChange={fetchDataForDate} />

            {isLoading && !isSubmitting ? (
                 <div className="flex justify-center items-center py-10"><Spinner size={40}/></div>
            ) : (
            <>
                {/* Sección de Resumen y Suplementos */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                    <GlassCard className="lg:col-span-3 p-6">
                         <h3 className="text-xl font-bold mb-4">Resumen del Día</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <StatCard icon={<Flame size={24} />} title="Calorías" value={totals.calories.toLocaleString('es-ES')} unit={`/ ${calorieTarget.toLocaleString('es-ES')} kcal`} />
                            <StatCard icon={<Beef size={24} />} title="Proteínas" value={totals.protein.toFixed(1)} unit={`/ ${proteinTarget} g`} />
                            <StatCard icon={<Wheat size={24} />} title="Carbs" value={totals.carbs.toFixed(1)} unit="g" />
                            <StatCard icon={<Salad size={24} />} title="Grasas" value={totals.fats.toFixed(1)} unit="g" />
                         </div>
                    </GlassCard>
                    
                    {/* Sección de Suplementos */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Agua */}
                        <GlassCard className="p-6 flex flex-col justify-between">
                            <h3 className="text-xl font-bold">Agua</h3>
                            <div className="flex items-center justify-center gap-4 my-4">
                                <Droplet size={32} className="text-blue-400" />
                                <p className="text-4xl font-bold">{waterLog.quantity_ml}<span className="text-base font-medium text-text-muted"> / {waterTarget} ml</span></p>
                            </div>
                             <button onClick={() => setModal({ type: 'water', data: null })} className="flex items-center justify-center gap-2 w-full rounded-md bg-accent/10 text-accent font-semibold py-3 border border-accent/20 hover:bg-accent/20 transition-colors">
                                <Plus size={20} />
                                <span>Añadir / Editar Agua</span>
                            </button>
                        </GlassCard>
                        
                        {/* Creatina */}
                        <GlassCard className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Zap size={24} className="text-accent" />
                                    Creatina
                                </h3>
                            </div>
                            <button 
                                onClick={() => setShowCreatinaTracker(true)} 
                                className="flex items-center justify-center gap-2 w-full rounded-md bg-accent/10 text-accent font-semibold py-3 border border-accent/20 hover:bg-accent/20 transition-colors"
                            >
                                <Zap size={20} />
                                <span>Gestionar Creatina</span>
                            </button>
                        </GlassCard>
                    </div>
                </div>

                {/* Sección de Comidas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(meals).map(([mealType, logs]) => (
                        <GlassCard key={mealType} className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold capitalize">{ {breakfast: 'Desayuno', lunch: 'Almuerzo', dinner: 'Cena', snack: 'Snacks'}[mealType] }</h3>
                                <button onClick={() => setModal({ type: 'food', data: { mealType } })} className="p-2 -m-2 rounded-full text-accent hover:bg-accent-transparent transition">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="flex flex-col gap-3">
                                {logs.length > 0 ? logs.map(log => (
                                    <div key={log.id} className="bg-bg-secondary p-3 rounded-md border border-glass-border group relative">
                                        <div className="pr-20 sm:pr-16">
                                            <p className="font-semibold">
                                                {log.description}
                                                {log.weight_g && ` (${log.weight_g}g)`}
                                            </p>
                                            <p className="text-sm text-text-secondary">
                                                {log.calories} kcal • {log.protein_g || 0}g Prot • {log.carbs_g || 0}g Carbs • {log.fats_g || 0}g Grasas
                                            </p>
                                        </div>
                                        
                                        <div className="absolute top-1/2 -translate-y-1/2 right-2 flex flex-col sm:flex-row gap-1 sm:gap-1">
                                            <button 
                                                onClick={() => setModal({ type: 'food', data: { ...log, mealType } })} 
                                                className="p-2 rounded-full bg-bg-primary hover:bg-accent/20 hover:text-accent transition-all duration-200 shadow-sm border border-glass-border"
                                                title="Editar comida"
                                            >
                                                <Edit size={14} className="sm:w-4 sm:h-4"/>
                                            </button>
                                            <button 
                                                onClick={() => setLogToDelete(log)} 
                                                className="p-2 rounded-full bg-bg-primary hover:bg-red-500/20 hover:text-red-500 transition-all duration-200 shadow-sm border border-glass-border"
                                                title="Eliminar comida"
                                            >
                                                <Trash2 size={14} className="sm:w-4 sm:h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-text-muted text-center py-4">No hay registros para esta comida.</p>
                                )}
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </>
            )}

            {modal.type === 'water' && (
                <WaterLogModal
                    initialQuantity={waterLog.quantity_ml}
                    onClose={() => setModal({ type: null, data: null })}
                    onSave={handleSaveWater}
                    isLoading={isSubmitting}
                />
            )}

            {modal.type === 'food' && (
                 <NutritionLogModal
                    onClose={() => setModal({ type: null, data: null })}
                    onSave={handleSaveFood}
                    isLoading={isSubmitting}
                    mealType={modal.data.mealType}
                    logToEdit={modal.data.id ? modal.data : null}
                 />
            )}
            
            {logToDelete && (
                <ConfirmationModal
                    message={`¿Seguro que quieres eliminar "${logToDelete.description}"?`}
                    onConfirm={handleDeleteFood}
                    onCancel={() => setLogToDelete(null)}
                    isLoading={isSubmitting}
                    confirmText="Eliminar"
                />
            )}
            
            {showCreatinaTracker && (
                <CreatinaTracker 
                    onClose={() => setShowCreatinaTracker(false)}
                    selectedDate={selectedDate}
                />
            )}
        </div>
    );
};

export default Nutrition;