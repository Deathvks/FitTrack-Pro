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

const ExerciseSearch = ({ exercise, exIndex, onFieldChange, onSelect, isOpen, onOpen, onClose }) => {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    if (!isOpen && !isFilterOpen) return;
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) onClose();
      if (filterRef.current && !filterRef.current.contains(event.target)) setIsFilterOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isFilterOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setResults([]);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const searchTerm = exercise.name || '';
    const selectedGroup = exercise.filterGroup || 'Todos';
    const shouldSearch = searchTerm.trim().length >= 2 || selectedGroup !== 'Todos';

    if (!shouldSearch) {
      setResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchExercises(searchTerm, selectedGroup);
        setResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [exercise.name, exercise.filterGroup, isOpen]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    onFieldChange(exIndex, 'name', value);
    const selectedGroup = exercise.filterGroup || 'Todos';
    const shouldBeOpen = value.trim().length >= 2 || selectedGroup !== 'Todos';
    if (shouldBeOpen) {
      if (!isOpen) onOpen();
    } else {
      if (isOpen) onClose();
    }
  };

  const handleFilterChange = (group) => {
    onFieldChange(exIndex, 'filterGroup', group);
    onOpen();
    setIsFilterOpen(false);
  };
  
  const shouldRenderDropdown = isOpen && (isLoading || results.length > 0 || ((exercise.name?.trim().length >= 2 || exercise.filterGroup !== 'Todos')));

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="flex gap-2">
        <input
          type="text"
          autoComplete="off"
          value={exercise.name || ''}
          onChange={handleNameChange}
          onFocus={onOpen}
          placeholder="Buscar o escribir ejercicio..."
          className="flex-grow w-full bg-bg-secondary border border-glass-border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition"
        />
        <div className="relative flex-shrink-0" ref={filterRef}>
          <button
            type="button"
            onClick={() => setIsFilterOpen(prev => !prev)}
            className="w-full h-full bg-bg-secondary border border-glass-border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition flex items-center justify-between gap-2"
          >
            <span>{exercise.filterGroup || 'Todos'}</span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
          {isFilterOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-bg-secondary border border-glass-border rounded-xl shadow-lg max-h-48 overflow-y-auto z-50 p-2">
              {muscleGroups.map(group => (
                <button
                  key={group}
                  type="button"
                  onClick={() => handleFilterChange(group)}
                  className="block w-full text-left px-3 py-2 hover:bg-accent-transparent transition-colors rounded-md"
                >
                  {group}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {shouldRenderDropdown && (
        <div
          className="absolute top-full mt-2 w-full bg-bg-secondary border border-glass-border rounded-xl shadow-lg max-h-40 overflow-y-auto z-50 p-2"
          role="listbox"
          aria-expanded={isOpen}
        >
          {isLoading && <div className="flex justify-center p-4"><Spinner /></div>}
          {!isLoading && results.length > 0 && results.map(exResult => (
            <button
              key={exResult.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(exIndex, exResult)}
              className="block w-full text-left px-3 py-2 hover:bg-accent-transparent transition-colors rounded-md"
              role="option"
            >
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

// --- EDITOR ---
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
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
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
    // Comentamos o eliminamos esta validación restrictiva para 'reps'
    // else if (field === 'reps' && typeof value === 'string') {
    //     processedValue = value.replace(/[^0-9-]/g, '');
    // }

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
      newExercises[exIndex] = {
        ...newExercises[exIndex],
        exercise_list_id: selectedExercise.id,
        name: selectedExercise.name,
        muscle_group: selectedExercise.muscle_group,
      };
      return { ...prev, exercises: newExercises };
    });
    setActiveDropdownIndex(null);
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

  const reorderAndGroup = (exercises) => {
    const processed = [...exercises];
    const groups = {};
    processed.forEach(ex => {
      if (ex.superset_group_id) {
        if (!groups[ex.superset_group_id]) groups[ex.superset_group_id] = [];
        groups[ex.superset_group_id].push(ex);
      }
    });
    Object.keys(groups).forEach(groupId => {
      if (groups[groupId].length < 2) {
        processed.forEach(ex => {
          if (ex.superset_group_id === groupId) {
            delete ex.superset_group_id;
            delete ex.exercise_order;
          }
        });
      }
    });
    let currentGroupId = null;
    let orderInGroup = 0;
    return processed.map(ex => {
      if (ex.superset_group_id) {
        if (ex.superset_group_id === currentGroupId) {
          orderInGroup++;
        } else {
          currentGroupId = ex.superset_group_id;
          orderInGroup = 0;
        }
        return { ...ex, exercise_order: orderInGroup };
      }
      return { ...ex, exercise_order: 0 };
    });
  };

  const linkWithPrevious = (index) => {
    if (index === 0) return;
    setEditedRoutine(prev => {
      let newExercises = [...prev.exercises];
      const prevEx = newExercises[index - 1];
      const currEx = newExercises[index];
      const groupId = prevEx.superset_group_id || `group_${prevEx.tempId}`;
      prevEx.superset_group_id = groupId;
      currEx.superset_group_id = groupId;
      return { ...prev, exercises: reorderAndGroup(newExercises) };
    });
  };

  const unlinkGroup = (groupId) => {
    setEditedRoutine(prev => {
      const newExercises = prev.exercises.map(ex => {
        if (ex.superset_group_id === groupId) {
          const newEx = { ...ex };
          delete newEx.superset_group_id;
          delete newEx.exercise_order;
          return newEx;
        }
        return ex;
      });
      return { ...prev, exercises: newExercises };
    });
  };

  const removeExercise = (index) => {
    const exercisesAfterRemove = editedRoutine.exercises.filter((_, i) => i !== index);
    setEditedRoutine(prev => ({ ...prev, exercises: reorderAndGroup(exercisesAfterRemove) }));
  };

  const exerciseGroups = useMemo(() => {
    const exercises = editedRoutine.exercises;
    if (exercises.length === 0) return [];
    const groups = [];
    const processedIndexes = new Set();
    for (let i = 0; i < exercises.length; i++) {
      if (processedIndexes.has(i)) continue;
      const currentEx = exercises[i];
      if (currentEx.superset_group_id) {
        const group = exercises.filter((ex) => ex.superset_group_id === currentEx.superset_group_id);
        group.forEach(ex => processedIndexes.add(exercises.indexOf(ex)));
        groups.push(group);
      } else {
        groups.push([currentEx]);
        processedIndexes.add(i);
      }
    }
    return groups;
  }, [editedRoutine.exercises]);

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
        if (!ex.reps || !String(ex.reps).trim()) {
          exerciseErrors.reps = 'Requerido';
          isValid = false;
        }
      }
      newErrors.exercises[index] = exerciseErrors;
    });
    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!validateRoutine()) {
      if (editedRoutine.exercises.filter(ex => ex.name && ex.name.trim() !== '').length > 0) {
        addToast('Por favor, corrige los errores antes de guardar.', 'error');
      }
      return;
    }
    const validExercises = editedRoutine.exercises.filter(ex => ex.name && ex.name.trim());
    const finalExercises = reorderAndGroup(validExercises);
    let groupCounter = 1;
    const finalGroupedExercises = [];
    const processedGroupIds = {};
    finalExercises.forEach(ex => {
      if (ex.superset_group_id) {
        if (!processedGroupIds[ex.superset_group_id]) {
          processedGroupIds[ex.superset_group_id] = groupCounter++;
        }
        finalGroupedExercises.push({ ...ex, superset_group_id: processedGroupIds[ex.superset_group_id] });
      } else {
        finalGroupedExercises.push(ex);
      }
    });
    const routineToSave = { ...editedRoutine, exercises: finalGroupedExercises };
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
            <input
              type="text"
              value={editedRoutine.name}
              onChange={(e) => setEditedRoutine({ ...editedRoutine, name: e.target.value })}
              className={baseInputClasses}
            />
            {errors.name && <p className="text-red text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Descripción (Opcional)</label>
            <textarea
              ref={descriptionRef}
              value={editedRoutine.description || ''}
              onChange={(e) => setEditedRoutine({ ...editedRoutine, description: e.target.value })}
              className={`${baseInputClasses} resize-none overflow-hidden`}
              rows="1"
              maxLength={250}
            ></textarea>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Ejercicios</h2>
          {exerciseGroups.map((group, groupIndex) => (
            <div
              key={group[0].tempId}
              className="relative"
              style={{ paddingBottom: groupIndex < exerciseGroups.length - 1 ? '1.5rem' : '0' }}
            >
              <div className={`p-3 rounded-2xl space-y-3 ${group.length > 1 ? 'border border-accent/50 bg-accent/10' : ''}`}>
                {group.length > 1 && (
                  <div className="flex justify-between items-center px-1 pb-2">
                    <h3 className="text-sm font-bold text-accent">Superserie</h3>
                    <button
                      onClick={() => unlinkGroup(group[0].superset_group_id)}
                      className="p-1 rounded-full bg-red/20 text-red hover:bg-red/30 transition"
                      title="Deshacer superserie"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {group.map(ex => {
                  const exIndex = editedRoutine.exercises.findIndex(e => e.tempId === ex.tempId);
                  const isActive = activeDropdownIndex === exIndex;
                  return (
                    <GlassCard key={ex.tempId} className={`p-4 bg-bg-secondary/50 relative ${isActive ? 'z-20' : ''}`}>
                      <div className="flex items-start gap-2 mb-4">
                        <div className="flex-grow">
                          <ExerciseSearch
                            exercise={ex}
                            exIndex={exIndex}
                            onFieldChange={handleFieldChange}
                            onSelect={handleExerciseSelect}
                            isOpen={isActive}
                            onOpen={() => setActiveDropdownIndex(exIndex)}
                            onClose={() => setActiveDropdownIndex(null)}
                          />
                        </div>
                        <div className="flex-shrink-0 pt-1">
                          <button
                            onClick={() => removeExercise(exIndex)}
                            className="p-2 h-full rounded-md text-text-muted hover:bg-red/20 hover:text-red transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <input
                            type="number"
                            placeholder="Series"
                            value={ex.sets || ''}
                            onChange={(e) => handleFieldChange(exIndex, 'sets', e.target.value)}
                            className={baseInputClasses}
                          />
                          {errors.exercises?.[exIndex]?.sets && <p className="text-red text-xs mt-1">{errors.exercises[exIndex].sets}</p>}
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Reps (ej: 8-12)"
                            value={ex.reps || ''}
                            onChange={(e) => handleFieldChange(exIndex, 'reps', e.target.value)}
                            className={baseInputClasses}
                          />
                          {errors.exercises?.[exIndex]?.reps && <p className="text-red text-xs mt-1">{errors.exercises[exIndex].reps}</p>}
                        </div>
                        <input
                          type="text"
                          placeholder="Grupo Muscular"
                          value={ex.muscle_group || ''}
                          onChange={(e) => handleFieldChange(exIndex, 'muscle_group', e.target.value)}
                          className={baseInputClasses}
                        />
                      </div>
                    </GlassCard>
                  );
                })}
              </div>

              {groupIndex < exerciseGroups.length - 1 && (
                // --- INICIO DE LA CORRECCIÓN ---
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-3">
                {/* --- FIN DE LA CORRECCIÓN --- */}
                  <button
                    onClick={() =>
                      linkWithPrevious(editedRoutine.exercises.findIndex(e => e.tempId === exerciseGroups[groupIndex + 1][0].tempId))
                    }
                    className="p-2 rounded-full bg-bg-secondary border border-glass-border text-accent hover:bg-accent hover:text-bg-secondary hover:scale-110 transition"
                    title="Crear superserie"
                  >
                    <Link2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addExercise}
          className="w-full py-3 rounded-md bg-accent/10 text-accent font-semibold border border-accent/20 hover:bg-accent/20 transition flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Añadir Ejercicio
        </button>

        <div className="flex justify-end items-center gap-4 pt-6 border-t border-glass-border">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 rounded-full font-semibold text-text-secondary hover:text-text-primary transition disabled:opacity-70"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-2 w-32 rounded-full bg-accent text-bg-secondary font-semibold transition hover:scale-105 disabled:opacity-70"
          >
            {isLoading ? <Spinner size={18} /> : (<><Save size={18} /><span>Guardar</span></>)}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default RoutineEditor;