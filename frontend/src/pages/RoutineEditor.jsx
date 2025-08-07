import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, Trash2, Save, Link2, X, Plus } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import ExerciseSearchInput from '../components/ExerciseSearchInput';
import Spinner from '../components/Spinner';
import { useToast } from '../hooks/useToast';

const RoutineEditor = ({ routine, onSave, onCancel, isLoading }) => {
    const [editedRoutine, setEditedRoutine] = useState(() => {
        const initialRoutine = {
            id: routine.id || null,
            name: routine.name || '',
            description: routine.description || '',
            exercises: (routine.RoutineExercises || routine.exercises || []).map(ex => ({
                ...ex,
                tempId: `ex-${Math.random()}`
            }))
        };
        if (initialRoutine.exercises.length === 0) {
            initialRoutine.exercises = [{
                tempId: `ex-${Math.random()}`, name: '', muscle_group: '', sets: '', reps: ''
            }];
        }
        return initialRoutine;
    });

    const [errors, setErrors] = useState({});
    const { addToast } = useToast();
    const descriptionRef = useRef(null);
    const CHAR_LIMIT = 250;

    useEffect(() => {
        if (descriptionRef.current) {
            descriptionRef.current.style.height = 'auto';
            descriptionRef.current.style.height = `${descriptionRef.current.scrollHeight}px`;
        }
    }, [editedRoutine.description]);

    const handleFieldChange = (exIndex, field, value) => {
        let processedValue = value;
        // --- INICIO DE LA MODIFICACIÓN ---
        // Para el nombre y el grupo muscular, elimina cualquier número
        if (field === 'name' || field === 'muscle_group') {
            processedValue = value.replace(/[0-9]/g, '');
        } 
        // --- FIN DE LA MODIFICACIÓN ---
        // Para las repeticiones, permite solo números y guiones
        else if (field === 'reps') {
            processedValue = value.replace(/[^0-9-]/g, '');
        }

        setEditedRoutine(prev => {
            const newExercises = [...prev.exercises];
            newExercises[exIndex][field] = processedValue;
            if (field === 'name') {
                newExercises[exIndex].exercise_list_id = null;
            }
            return { ...prev, exercises: newExercises };
        });
    };
    
    const handleExerciseSelect = (exIndex, selectedExercise) => {
        setEditedRoutine(prev => {
            const newExercises = [...prev.exercises];
            newExercises[exIndex] = {
                ...newExercises[exIndex],
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
                { tempId: `ex-${Math.random()}`, name: '', muscle_group: '', sets: '', reps: '' }
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
    
            if (group.length <= 1) {
                const newEx = { ...ex };
                delete newEx.superset_group_id;
                newEx.exercise_order = 0;
                return newEx;
            }
    
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
            if (editedRoutine.exercises.filter(ex => ex.name.trim() !== '').length > 0) {
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
                const restOfEx = { ...ex };
                delete restOfEx.superset_group_id;
                delete restOfEx.exercise_order;

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
                        <textarea ref={descriptionRef} value={editedRoutine.description || ''} onChange={(e) => setEditedRoutine({ ...editedRoutine, description: e.target.value })} className={`${baseInputClasses} resize-none overflow-hidden`} rows="1" maxLength={CHAR_LIMIT}></textarea>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Ejercicios</h2>
                    {exerciseGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className={`p-1 rounded-lg ${group.length > 1 ? 'bg-accent/10 border border-accent/20' : ''}`}>
                            <div className="flex flex-col">
                                {group.map((ex, indexInGroup) => {
                                    const exIndex = editedRoutine.exercises.findIndex(e => e.tempId === ex.tempId);
                                    
                                    const isPartOfSuperset = group.length > 1;
                                    const isFirstInGroup = indexInGroup === 0;
                                    const canLink = exIndex > 0 && isFirstInGroup;
                                    const needsMargin = exIndex > 0;

                                    return (
                                        <div key={ex.tempId} className={`relative ${needsMargin ? 'mt-8' : ''}`}>
                                            {isFirstInGroup && isPartOfSuperset ? (
                                                <button 
                                                    onClick={() => unlinkExercise(exIndex)} 
                                                    className="absolute -top-4 left-1/2 -translate-x-1/2 p-2 rounded-full bg-red text-white hover:scale-110 transition z-10" 
                                                    title="Separar superserie"
                                                >
                                                    <X size={16} />
                                                </button>
                                            ) : canLink ? (
                                                <button 
                                                    onClick={() => linkWithPrevious(exIndex)} 
                                                    className="absolute -top-4 left-1/2 -translate-x-1/2 p-2 rounded-full bg-accent text-bg-secondary hover:scale-110 transition z-10" 
                                                    title="Crear superserie con el ejercicio superior"
                                                >
                                                    <Link2 size={16} />
                                                </button>
                                            ) : null}
                                            
                                            <GlassCard className="p-4 bg-bg-secondary/50 relative">
                                                <div className="flex items-center gap-4 mb-4 pr-8">
                                                    <ExerciseSearchInput value={ex.name} onChange={(e) => handleFieldChange(exIndex, 'name', e.target.value)} onSelect={(selected) => handleExerciseSelect(exIndex, selected)} />
                                                </div>
                                                <button onClick={() => removeExercise(exIndex)} className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:bg-red/20 hover:text-red transition">
                                                    <Trash2 size={16} />
                                                </button>
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
                        </div>
                    ))}
                </div>


                <button onClick={addExercise} className="w-full py-3 rounded-md bg-accent/10 text-accent font-semibold border border-accent/20 hover:bg-accent/20 transition flex items-center justify-center gap-2">
                    <Plus size={18} />
                    Añadir Ejercicio
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