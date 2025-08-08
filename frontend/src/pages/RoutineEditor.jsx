import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, Trash2, Save, Link2, X, Plus, ChevronDown } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Spinner from '../components/Spinner';
import { useToast } from '../hooks/useToast';
import { searchExercises } from '../services/exerciseService';

const muscleGroups = [
    'Todos', 'Pecho', 'Espalda', 'Piernas', 'Glúteos', 'Hombros', 
    'Brazos', 'Core', 'Cardio', 'Antebrazo', 'Trapecio'
];

const ExerciseSearch = ({ exercise, exIndex, onFieldChange, onSelect }) => {
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const searchTerm = exercise.name || '';
        const selectedGroup = exercise.filterGroup || 'Todos';
        
        const shouldSearch = searchTerm.length >= 2 || selectedGroup !== 'Todos';

        if (!shouldSearch) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const handler = setTimeout(async () => {
            setIsLoading(true);
            try {
                const data = await searchExercises(searchTerm, selectedGroup);
                setResults(data);
                setIsOpen(true);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [exercise.name, exercise.filterGroup]);

    const handleSelect = (selectedEx) => {
        onSelect(exIndex, selectedEx);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full" ref={searchRef}>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={exercise.name || ''}
                    onChange={(e) => onFieldChange(exIndex, 'name', e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Buscar o escribir ejercicio..."
                    className="flex-grow w-full bg-bg-secondary border border-glass-border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition"
                />
                <div className="relative flex-shrink-0">
                    <select 
                        value={exercise.filterGroup} 
                        onChange={(e) => onFieldChange(exIndex, 'filterGroup', e.target.value)}
                        className="appearance-none h-full bg-bg-secondary border border-glass-border rounded-md pl-4 pr-10 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition"
                    >
                        {muscleGroups.map(group => (<option key={group} value={group}>{group}</option>))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted" />
                </div>
            </div>
            {isOpen && (
                <div className="absolute top-full mt-2 w-full bg-bg-secondary border border-glass-border rounded-md shadow-lg max-h-48 overflow-y-auto z-10 p-2">
                    {isLoading && <div className="flex justify-center p-4"><Spinner /></div>}
                    {!isLoading && results.length > 0 && results.map(exResult => (
                        <button key={exResult.id} type="button" onClick={() => handleSelect(exResult)} className="block w-full text-left px-3 py-2 hover:bg-accent-transparent transition-colors rounded-md">
                            {exResult.name} <span className="text-xs text-text-muted">({exResult.muscle_group})</span>
                        </button>
                    ))}
                    {!isLoading && results.length === 0 && ( (exercise.name && exercise.name.length >= 2) || exercise.filterGroup !== 'Todos') && (
                        <p className="text-center text-text-muted p-4 text-sm">No se encontraron resultados.</p>
                    )}
                </div>
            )}
        </div>
    );
};


const RoutineEditor = ({ routine, onSave, onCancel, isLoading }) => {
    const [editedRoutine, setEditedRoutine] = useState(() => {
        const initialExercises = (routine.RoutineExercises || routine.exercises || []).map(ex => ({
            ...ex,
            tempId: `ex-${Math.random()}`,
            filterGroup: 'Todos'
        }));
        if (initialExercises.length === 0) {
            initialExercises.push({
                tempId: `ex-${Math.random()}`, name: '', muscle_group: '', sets: '', reps: '', filterGroup: 'Todos'
            });
        }
        return {
            id: routine.id || null,
            name: routine.name || '',
            description: routine.description || '',
            exercises: initialExercises
        };
    });

    const [errors, setErrors] = useState({});
    const { addToast } = useToast();
    const descriptionRef = useRef(null);

    useEffect(() => {
        if (descriptionRef.current) {
            descriptionRef.current.style.height = 'auto';
            descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
        }
    }, [editedRoutine.description]);

    const handleFieldChange = (exIndex, field, value) => {
        let processedValue = value;
        if ((field === 'name' || field === 'muscle_group') && typeof value === 'string') {
            processedValue = value.replace(/[0-9]/g, '');
        } 
        else if (field === 'reps' && typeof value === 'string') {
            processedValue = value.replace(/[^0-9-]/g, '');
        }

        setEditedRoutine(prev => {
            const newExercises = [...prev.exercises];
            newExercises[exIndex] = { ...newExercises[exIndex], [field]: processedValue };
            
            if (field === 'name') {
                newExercises[exIndex].exercise_list_id = null;
            }
            return { ...prev, exercises: newExercises };
        });
    };
    
    const handleExerciseSelect = (exIndex, selectedExercise) => {
        setEditedRoutine(prev => {
            const newExercises = [...prev.exercises];
            const currentExercise = newExercises[exIndex];
            newExercises[exIndex] = {
                ...currentExercise,
                exercise_list_id: selectedExercise.id,
                name: selectedExercise.name,
                muscle_group: selectedExercise.muscle_group,
            };
            return { ...prev, exercises: newExercises };
        });
    };

    const addExercise = () => {
        setEditedRoutine(prev => ({
            ...prev,
            exercises: [
                ...prev.exercises,
                { tempId: `ex-${Math.random()}`, name: '', muscle_group: '', sets: '', reps: '', filterGroup: 'Todos' }
            ]
        }));
    };

    const validateRoutine = () => {
        const newErrors = { exercises: [] };
        let isValid = true;
        if (!editedRoutine.name.trim()) {
            newErrors.name = 'El nombre de la rutina es obligatorio.';
            isValid = false;
        }
        const nonEmptyExercises = editedRoutine.exercises.filter(ex => ex.name && ex.name.trim() !== '');
        if (nonEmptyExercises.length === 0) {
            addToast('La rutina debe tener al menos un ejercicio.', 'error');
            isValid = false;
        }
        editedRoutine.exercises.forEach((ex, index) => {
            const exerciseErrors = {};
            if (ex.name && ex.name.trim()) {
                if (!ex.sets || parseInt(ex.sets, 10) <= 0) {
                    exerciseErrors.sets = 'Debe ser > 0';
                    isValid = false;
                }
                if (!ex.reps || !ex.reps.trim()) {
                    exerciseErrors.reps = 'Requerido';
                    isValid = false;
                }
            }
            newErrors.exercises[index] = exerciseErrors;
        });
        setErrors(newErrors);
        return isValid;
    };
    
    const reorderAndGroup = (updatedExercises) => {
        let currentGroupId = null;
        let orderInGroup = 0;
        const processed = updatedExercises.map(ex => {
            const newEx = { ...ex };
            if (newEx.superset_group_id) {
                if (newEx.superset_group_id === currentGroupId) {
                    orderInGroup++;
                } else {
                    currentGroupId = newEx.superset_group_id;
                    orderInGroup = 0;
                }
                newEx.exercise_order = orderInGroup;
            } else {
                currentGroupId = null;
                newEx.exercise_order = 0;
            }
            return newEx;
        });
    
        return processed.map(ex => {
            if (!ex.superset_group_id) return ex;
    
            const group = processed.filter(e => e.superset_group_id === ex.superset_group_id);
    
            // --- INICIO DE LA CORRECCIÓN ---
            if (group.length <= 1) {
                const newEx = { ...ex };
                delete newEx.superset_group_id;
                newEx.exercise_order = 0;
                return newEx;
            }
            // --- FIN DE LA CORRECCIÓN ---
    
            return ex;
        });
    };

    const exerciseGroups = useMemo(() => {
        const exercises = editedRoutine.exercises;
        const groups = [];
        if (exercises.length === 0) return [];
        let currentGroup = [exercises[0]];
        for (let i = 1; i < exercises.length; i++) {
            if (exercises[i].superset_group_id !== null && exercises[i].superset_group_id !== undefined && exercises[i].superset_group_id === exercises[i-1].superset_group_id) {
                currentGroup.push(exercises[i]);
            } else {
                groups.push(currentGroup);
                currentGroup = [exercises[i]];
            }
        }
        groups.push(currentGroup);
        return groups;
    }, [editedRoutine.exercises]);
    
    const linkWithPrevious = (index) => {
        if (index === 0) return;
        let newExercises = [...editedRoutine.exercises];
        const prevEx = newExercises[index - 1];
        const groupId = prevEx.superset_group_id || `group_${prevEx.tempId}`;
        newExercises[index - 1].superset_group_id = groupId;
        newExercises[index].superset_group_id = groupId;
        setEditedRoutine(prev => ({ ...prev, exercises: reorderAndGroup(newExercises) }));
    };

    const unlinkExercise = (index) => {
        let newExercises = [...editedRoutine.exercises];
        const groupIdToUnlink = newExercises[index].superset_group_id;
        newExercises.forEach(ex => {
            if (ex.superset_group_id === groupIdToUnlink) {
                delete ex.superset_group_id;
                ex.exercise_order = 0;
            }
        });
        setEditedRoutine(prev => ({ ...prev, exercises: reorderAndGroup(newExercises) }));
    };
    
    const removeExercise = (index) => {
        const newExercises = editedRoutine.exercises.filter((_, i) => i !== index);
        setEditedRoutine(prev => ({ ...prev, exercises: reorderAndGroup(newExercises) }));
    };

    const handleSave = () => {
        if (!validateRoutine()) {
            if (editedRoutine.exercises.filter(ex => ex.name && ex.name.trim() !== '').length > 0) {
                 addToast('Por favor, corrige los errores antes de guardar.', 'error');
            }
            return;
        }

        const validExercises = editedRoutine.exercises.filter(ex => ex.name && ex.name.trim());
        
        const finalGroups = [];
        if (validExercises.length > 0) {
            let currentGroup = [validExercises[0]];
            for (let i = 1; i < validExercises.length; i++) {
                if (validExercises[i].superset_group_id && validExercises[i].superset_group_id === validExercises[i-1].superset_group_id) {
                    currentGroup.push(validExercises[i]);
                } else {
                    finalGroups.push(currentGroup);
                    currentGroup = [validExercises[i]];
                }
            }
            finalGroups.push(currentGroup);
        }
        
        const finalExercises = [];
        finalGroups.forEach((group, groupIndex) => {
            group.forEach((ex, exInGroupIndex) => {
                // --- INICIO DE LA CORRECCIÓN ---
                const restOfEx = { ...ex };
                delete restOfEx.filterGroup;
                delete restOfEx.superset_group_id;
                delete restOfEx.exercise_order;
                // --- FIN DE LA CORRECCIÓN ---

                finalExercises.push({
                    ...restOfEx,
                    superset_group_id: group.length > 1 ? groupIndex + 1 : null,
                    exercise_order: exInGroupIndex,
                });
            });
        });
        
        const routineToSave = { ...editedRoutine, exercises: finalExercises };
        onSave(routineToSave);
    };

    const baseInputClasses = "w-full bg-bg-secondary border border-glass-border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition";

    return (
        <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-10 animate-[fade-in_0.5s_ease-out]">
            <button onClick={onCancel} className="flex items-center gap-2 text-text-secondary font-semibold hover:text-text-primary transition mb-4">
                <ChevronLeft size={20} />
                Volver a Rutinas
            </button>
            <h1 className="text-4xl font-extrabold mb-8">{routine.id ? 'Editar Rutina' : 'Crear Rutina'}</h1>

            <GlassCard className="p-6 flex flex-col gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Nombre de la Rutina</label>
                        <input type="text" value={editedRoutine.name} onChange={(e) => setEditedRoutine({ ...editedRoutine, name: e.target.value })} className={baseInputClasses} />
                        {errors.name && <p className="form-error-text mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Descripción (Opcional)</label>
                        <textarea ref={descriptionRef} value={editedRoutine.description || ''} onChange={(e) => setEditedRoutine({ ...editedRoutine, description: e.target.value })} className={`${baseInputClasses} resize-none overflow-hidden`} rows="1" maxLength={250}></textarea>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Ejercicios</h2>
                    {editedRoutine.exercises.map((ex, exIndex) => {
                        const isPartOfSuperset = exerciseGroups.some(g => g.some(e => e.tempId === ex.tempId) && g.length > 1);
                        const currentGroup = exerciseGroups.find(g => g.some(e => e.tempId === ex.tempId)) || [ex];
                        const isFirstInGroup = currentGroup[0].tempId === ex.tempId;
                        const canLink = exIndex > 0 && !isPartOfSuperset;

                        return (
                            <div key={ex.tempId} className={`relative ${exIndex > 0 ? 'mt-8' : ''}`}>
                                {isFirstInGroup && isPartOfSuperset ? (
                                    <button onClick={() => unlinkExercise(exIndex)} className="absolute -top-4 left-1/2 -translate-x-1/2 p-2 rounded-full bg-red text-white hover:scale-110 transition z-10" title="Separar superserie"><X size={16} /></button>
                                ) : canLink ? (
                                    <button onClick={() => linkWithPrevious(exIndex)} className="absolute -top-4 left-1/2 -translate-x-1/2 p-2 rounded-full bg-accent text-bg-secondary hover:scale-110 transition z-10" title="Crear superserie con el ejercicio superior"><Link2 size={16} /></button>
                                ) : null}
                                
                                <GlassCard className={`p-4 bg-bg-secondary/50 relative ${isPartOfSuperset && !isFirstInGroup ? 'mt-2' : ''}`}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex-grow">
                                             <ExerciseSearch 
                                                exercise={ex}
                                                exIndex={exIndex}
                                                onFieldChange={handleFieldChange}
                                                onSelect={handleExerciseSelect}
                                            />
                                        </div>
                                        <div className="flex-shrink-0">
                                            <button onClick={() => removeExercise(exIndex)} className="p-2 h-full rounded-md text-text-muted hover:bg-red/20 hover:text-red transition">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <input type="number" placeholder="Series" value={ex.sets || ''} onChange={(e) => handleFieldChange(exIndex, 'sets', e.target.value)} className={baseInputClasses} />
                                            {errors.exercises?.[exIndex]?.sets && <p className="form-error-text mt-1">{errors.exercises[exIndex].sets}</p>}
                                        </div>
                                        <div>
                                            <input type="text" placeholder="Reps (ej: 8-12)" value={ex.reps || ''} onChange={(e) => handleFieldChange(exIndex, 'reps', e.target.value)} className={baseInputClasses} />
                                            {errors.exercises?.[exIndex]?.reps && <p className="form-error-text mt-1">{errors.exercises[exIndex].reps}</p>}
                                        </div>
                                        <input type="text" placeholder="Grupo Muscular" value={ex.muscle_group || ''} onChange={(e) => handleFieldChange(exIndex, 'muscle_group', e.target.value)} className={baseInputClasses} />
                                    </div>
                                </GlassCard>
                            </div>
                        );
                    })}
                </div>


                <button onClick={addExercise} className="w-full py-3 rounded-md bg-accent/10 text-accent font-semibold border border-accent/20 hover:bg-accent/20 transition flex items-center justify-center gap-2">
                    <Plus size={18} /> Añadir Ejercicio
                </button>

                <div className="flex justify-end items-center gap-4 pt-6 border-t border-glass-border">
                    <button onClick={onCancel} disabled={isLoading} className="px-6 py-2 rounded-full font-semibold text-text-secondary hover:text-text-primary transition disabled:opacity-70">Cancelar</button>
                    <button onClick={handleSave} disabled={isLoading} className="flex items-center justify-center gap-2 px-6 py-2 w-32 rounded-full bg-accent text-bg-secondary font-semibold transition hover:scale-105 disabled:opacity-70">
                        {isLoading ? <Spinner size={18} /> : <><Save size={18} /><span>Guardar</span></>}
                    </button>
                </div>
            </GlassCard>
        </div>
    );
};

export default RoutineEditor;