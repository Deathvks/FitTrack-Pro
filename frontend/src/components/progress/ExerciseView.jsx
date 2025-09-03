import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import { ExerciseChart } from './ProgressCharts';

const ExerciseView = ({ allExercises, exerciseProgressData, axisColor, onShowHistory }) => {
    const [selectedExercise, setSelectedExercise] = useState('');
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const selectorRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target)) {
                setIsSelectorOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (allExercises.length > 0 && !selectedExercise) {
            setSelectedExercise(allExercises[0]);
        }
    }, [allExercises, selectedExercise]);

    const handleSelectExercise = (exercise) => {
        setSelectedExercise(exercise);
        setIsSelectorOpen(false);
    };

    return (
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
                    onClick={() => onShowHistory(selectedExercise)}
                    disabled={!selectedExercise}
                    className="p-3 rounded-md bg-bg-secondary border border-glass-border text-text-secondary transition enabled:hover:text-accent enabled:hover:border-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Ver historial detallado">
                    <BookOpen size={20} />
                </button>
            </div>
            <ExerciseChart
                data={exerciseProgressData[selectedExercise]}
                axisColor={axisColor}
                exerciseName={selectedExercise}
            />
        </div>
    );
};

export default ExerciseView;