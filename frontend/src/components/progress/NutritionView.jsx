import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { NutritionCharts } from './ProgressCharts';

const NutritionView = ({ axisColor }) => {
    const nutritionSummary = useAppStore(state => state.nutritionSummary);
    const fetchNutritionSummary = useAppStore(state => state.fetchNutritionSummary);
    const isLoading = useAppStore(state => state.isLoading);
    const [summaryDate, setSummaryDate] = useState(new Date());

    useEffect(() => {
        fetchNutritionSummary(summaryDate.getMonth() + 1, summaryDate.getFullYear());
    }, [summaryDate, fetchNutritionSummary]);
    
    const changeSummaryMonth = (amount) => {
        setSummaryDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };
    
    const chartData = useMemo(() => {
        if (!nutritionSummary || !summaryDate || typeof summaryDate.getMonth !== 'function') {
            return [];
        }
    
        const year = summaryDate.getFullYear();
        const month = summaryDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dataMap = new Map();

        // --- INICIO DE LA CORRECCIÓN ---
        const today = new Date();
        const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
        // Determinamos hasta qué día mostrar datos: el día actual si es el mes en curso, o el último día del mes si es un mes pasado.
        const lastDayToShow = isCurrentMonth ? today.getDate() : daysInMonth;

        // Creamos la estructura de datos solo hasta el día que corresponde.
        for (let i = 1; i <= lastDayToShow; i++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            dataMap.set(dateKey, {
                date: i, 
                Calorías: 0, Proteínas: 0, Carbs: 0, Grasas: 0, Agua: 0
            });
        }
        // --- FIN DE LA CORRECCIÓN ---
    
        (nutritionSummary.nutrition || []).forEach(item => {
            if (dataMap.has(item.date)) {
                const dayData = dataMap.get(item.date);
                dayData.Calorías = parseFloat(item.total_calories) || 0;
                dayData.Proteínas = parseFloat(item.total_protein) || 0;
                dayData.Carbs = parseFloat(item.total_carbs) || 0;
                dayData.Grasas = parseFloat(item.total_fats) || 0;
            }
        });
    
        (nutritionSummary.water || []).forEach(item => {
            if (dataMap.has(item.log_date)) {
                dataMap.get(item.log_date).Agua = item.quantity_ml || 0;
            }
        });
        
        return Array.from(dataMap.values());
    
    }, [nutritionSummary, summaryDate]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-center items-center gap-4">
                <button onClick={() => changeSummaryMonth(-1)} className="p-2 rounded-full hover:bg-white/10 transition"><ChevronLeft /></button>
                <h2 className="text-xl font-bold capitalize">{summaryDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h2>
                <button 
                    onClick={() => changeSummaryMonth(1)} 
                    // Deshabilitamos el botón si estamos en el mes actual o uno futuro
                    disabled={new Date(summaryDate.getFullYear(), summaryDate.getMonth() + 1, 1) > new Date()}
                    className="p-2 rounded-full hover:bg-white/10 transition disabled:opacity-50"
                >
                    <ChevronRight />
                </button>
            </div>
            <NutritionCharts
                chartData={chartData}
                axisColor={axisColor}
                isLoading={isLoading}
            />
        </div>
    );
};

export default NutritionView;