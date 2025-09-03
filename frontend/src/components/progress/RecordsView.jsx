import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useAppStore from '../../store/useAppStore';
import { NutritionCharts } from './ProgressCharts';

const NutritionView = ({ axisColor }) => {
    // --- INICIO DE LA CORRECCIÓN DEFINITIVA ---
    // Seleccionamos los datos y las funciones del estado de forma individual.
    // Esto es clave para que React entienda que el componente solo debe
    // volver a renderizarse si cambia uno de estos elementos específicos.
    const nutritionSummary = useAppStore(state => state.nutritionSummary);
    const fetchNutritionSummary = useAppStore(state => state.fetchNutritionSummary);
    const isLoading = useAppStore(state => state.isLoading);
    // --- FIN DE LA CORRECCIÓN DEFINITIVA ---

    const [summaryDate, setSummaryDate] = useState(new Date());

    useEffect(() => {
        // Este efecto ahora solo se volverá a ejecutar cuando el usuario cambie el mes (`summaryDate`),
        // rompiendo el bucle infinito. La función `fetchNutritionSummary` es estable y no
        // necesita estar en el array de dependencias.
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
    
        for (let i = 1; i <= daysInMonth; i++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            dataMap.set(dateKey, {
                date: i, 
                Calorías: 0, Proteínas: 0, Carbs: 0, Grasas: 0, Agua: 0
            });
        }
    
        (nutritionSummary.nutrition || []).forEach(item => {
            // El backend ahora devuelve 'date' como un string 'YYYY-MM-DD', por lo que lo usamos directamente.
            if (dataMap.has(item.date)) {
                const dayData = dataMap.get(item.date);
                dayData.Calorías = parseFloat(item.total_calories) || 0;
                dayData.Proteínas = parseFloat(item.total_protein) || 0;
                dayData.Carbs = parseFloat(item.total_carbs) || 0;
                dayData.Grasas = parseFloat(item.total_fats) || 0;
            }
        });
    
        (nutritionSummary.water || []).forEach(item => {
            // El backend también devuelve 'log_date' como un string 'YYYY-MM-DD'.
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
                <button onClick={() => changeSummaryMonth(1)} className="p-2 rounded-full hover:bg-white/10 transition"><ChevronRight /></button>
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