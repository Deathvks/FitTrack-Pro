import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import GlassCard from '../GlassCard';
import useAppStore from '../../store/useAppStore';

const CalendarView = ({ setDetailedLog }) => {
    const { workoutLog } = useAppStore(state => ({ workoutLog: state.workoutLog }));
    const [calendarDate, setCalendarDate] = useState(new Date());

    const workoutsByDate = useMemo(() => {
        return workoutLog.reduce((acc, log) => {
            // Usar fecha local en lugar de UTC para evitar cambios de día
            const date = new Date(log.workout_date);
            const localDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            if (!acc[localDateStr]) { acc[localDateStr] = []; }
            acc[localDateStr].push(log);
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
        // Usar fecha local consistente en lugar de toISOString()
        const date = new Date(year, month, day);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

export default CalendarView;