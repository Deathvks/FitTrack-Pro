// NutritionLogModal component
import React, { useState, useEffect } from 'react';
import { X, BookMarked, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import GlassCard from './GlassCard';
import Spinner from './Spinner';
import useAppStore from '../store/useAppStore';
import { useToast } from '../hooks/useToast';

const NutritionLogModal = ({ logToEdit, mealType, onSave, onClose, isLoading }) => {
  const [formData, setFormData] = useState({
    description: '',
    calories: '',
    protein_g: '',
    carbs_g: '',
    fats_g: '',
    weight_g: '',
  });
  
  const [view, setView] = useState('manual');
  const [saveAsFavorite, setSaveAsFavorite] = useState(false);
  const [removeFromFavorites, setRemoveFromFavorites] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // NUEVO: modo por 100 g y estado de valores por 100 g
  const [per100Mode, setPer100Mode] = useState(false);
  const [per100, setPer100] = useState({
    calories100: '',
    protein100: '',
    carbs100: '',
    fats100: '',
  });
  
  // Agregar el estado faltante para almacenar los valores originales
  const [originalData, setOriginalData] = useState(null);

  // Helpers de cálculo
  const round = (val, decimals = 0) => {
    const n = parseFloat(val);
    if (isNaN(n)) return 0;
    const p = Math.pow(10, decimals);
    return Math.round(n * p) / p;
  };

  const computeFromPer100 = (cal100, p100, c100, f100, grams) => {
    const factor = (parseFloat(grams) || 0) / 100;
    return {
      calories: Math.round((parseFloat(cal100) || 0) * factor),
      protein_g: round((parseFloat(p100) || 0) * factor, 1),
      carbs_g: round((parseFloat(c100) || 0) * factor, 1),
      fats_g: round((parseFloat(f100) || 0) * factor, 1),
      weight_g: parseFloat(grams) || 0,
    };
  };

  const { favoriteMeals, addFavoriteMeal, deleteFavoriteMeal } = useAppStore(state => ({
    favoriteMeals: state.favoriteMeals,
    addFavoriteMeal: state.addFavoriteMeal,
    deleteFavoriteMeal: state.deleteFavoriteMeal,
  }));
  const { addToast } = useToast();

  // Calcular elementos paginados
  const totalPages = Math.ceil(favoriteMeals.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMeals = favoriteMeals.slice(startIndex, endIndex);

  useEffect(() => {
    if (logToEdit) {
      setFormData({
        description: logToEdit.description || '',
        calories: logToEdit.calories || '',
        protein_g: logToEdit.protein_g || '',
        carbs_g: logToEdit.carbs_g || '',
        fats_g: logToEdit.fats_g || '',
        weight_g: logToEdit.weight_g || '',
      });
    }
  }, [logToEdit]);
  
  // Resetear página cuando cambie la vista
  useEffect(() => {
    if (view === 'favorites') {
      setCurrentPage(1);
    }
  }, [view]);
  
  const handleSelectFavorite = (meal) => {
    setFormData({
      description: meal.name,
      calories: meal.calories,
      protein_g: meal.protein_g,
      carbs_g: meal.carbs_g,
      fats_g: meal.fats_g,
      weight_g: meal.weight_g || '',
    });
    setView('manual');
  };
  
  const handleDeleteFavorite = async (mealId, event) => {
    event.stopPropagation();
    const result = await deleteFavoriteMeal(mealId);
    if (result.success) {
      addToast(result.message, 'success');
    } else {
      addToast(result.message, 'error');
    }
  };

  // NUEVO: cambios para soportar recálculo al cambiar 'weight_g' en modo por 100 g
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['calories', 'protein_g', 'carbs_g', 'fats_g', 'weight_g'].includes(name)) {
      if (/^\d*\.?\d*$/.test(value)) {
        if (name === 'weight_g' && per100Mode) {
          const computed = computeFromPer100(
            per100.calories100,
            per100.protein100,
            per100.carbs100,
            per100.fats100,
            value
          );
          setFormData(prev => ({ ...prev, ...computed }));
        } else {
          setFormData(prev => ({ ...prev, [name]: value }));
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // NUEVO: handler para inputs por 100 g
  const handleChangePer100 = (e) => {
    const { name, value } = e.target; // calories100 | protein100 | carbs100 | fats100
    if (!/^\d*\.?\d*$/.test(value)) return;
    setPer100(prev => ({ ...prev, [name]: value }));
    if (per100Mode) {
      const computed = computeFromPer100(
        name === 'calories100' ? value : per100.calories100,
        name === 'protein100' ? value : per100.protein100,
        name === 'carbs100' ? value : per100.carbs100,
        name === 'fats100' ? value : per100.fats100,
        formData.weight_g
      );
      setFormData(prev => ({ ...prev, ...computed }));
    }
  };

  // NUEVO: al activar el modo por 100 g, intentar pre-rellenar per100 desde los datos actuales
  useEffect(() => {
    if (per100Mode) {
      const w = parseFloat(formData.weight_g);
      if (w > 0) {
        setPer100({
          calories100: ((parseFloat(formData.calories) || 0) / w * 100).toFixed(0),
          protein100: ((parseFloat(formData.protein_g) || 0) / w * 100).toFixed(1),
          carbs100: ((parseFloat(formData.carbs_g) || 0) / w * 100).toFixed(1),
          fats100: ((parseFloat(formData.fats_g) || 0) / w * 100).toFixed(1),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [per100Mode]);
  
  // Función para verificar si una comida ya existe en favoritos
  const isAlreadyFavorite = () => {
    if (!logToEdit || !formData.description) return false;
    return favoriteMeals.some(meal => 
      meal.name.toLowerCase().trim() === formData.description.toLowerCase().trim()
    );
  };

  // Función para obtener la comida favorita existente
  const getExistingFavoriteMeal = () => {
    if (!logToEdit || !formData.description) return null;
    return favoriteMeals.find(meal => 
      meal.name.toLowerCase().trim() === formData.description.toLowerCase().trim()
    );
  };

  useEffect(() => {
    if (logToEdit) {
      const initialData = {
        description: logToEdit.description || '',
        calories: logToEdit.calories || '',
        protein_g: logToEdit.protein_g || '',
        carbs_g: logToEdit.carbs_g || '',
        fats_g: logToEdit.fats_g || '',
        weight_g: logToEdit.weight_g || '',
      };
      setFormData(initialData);
      setOriginalData(initialData); // Guardar los valores originales
    }
  }, [logToEdit]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.calories) {
      addToast('La descripción y las calorías son obligatorias.', 'error');
      return;
    }

    const dataToSave = {
      ...formData,
      calories: parseInt(formData.calories, 10) || 0,
      protein_g: parseFloat(formData.protein_g) || 0,
      carbs_g: parseFloat(formData.carbs_g) || 0,
      fats_g: parseFloat(formData.fats_g) || 0,
      weight_g: parseFloat(formData.weight_g) || 0,
    };

    // Verificar si hay cambios cuando se está editando
    if (logToEdit && originalData) {
      const hasChanges = 
        formData.description !== originalData.description ||
        formData.calories !== originalData.calories ||
        formData.protein_g !== originalData.protein_g ||
        formData.carbs_g !== originalData.carbs_g ||
        formData.fats_g !== originalData.fats_g ||
        formData.weight_g !== originalData.weight_g ||
        saveAsFavorite || removeFromFavorites;
      
      if (!hasChanges) {
        addToast('No se han realizado cambios en la comida.', 'error');
        return;
      }
    }

    // Lógica para manejar favoritos
    if (logToEdit) {
      // Editando una comida
      const existingFavorite = getExistingFavoriteMeal();
      
      if (removeFromFavorites && existingFavorite) {
        const result = await deleteFavoriteMeal(existingFavorite.id);
        if (result.success) {
          addToast(result.message, 'success');
        } else {
          addToast(result.message, 'error');
        }
      } else if (saveAsFavorite && !existingFavorite) {
        const favMealData = { name: dataToSave.description, ...dataToSave };
        const result = await addFavoriteMeal(favMealData);
        if (result.success) {
          addToast(result.message, 'success');
        } else {
          addToast(result.message, 'error');
        }
      }
    } else {
      // Nueva comida
      if (saveAsFavorite) {
        const favMealData = { name: dataToSave.description, ...dataToSave };
        const result = await addFavoriteMeal(favMealData);
        if (!result.success) {
          addToast(result.message, 'error');
        } else {
          addToast(result.message, 'success');
        }
      }
    }

    onSave(dataToSave);
  };

  const mealTitles = {
    breakfast: 'Desayuno',
    lunch: 'Almuerzo',
    dinner: 'Cena',
    snack: 'Snack'
  };
  
  const title = `${logToEdit ? 'Editar' : 'Añadir'} Registro en ${mealTitles[mealType]}`;
  const baseInputClasses = "w-full bg-bg-secondary border border-glass-border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition";
  
  const baseButtonClasses = "px-4 py-2 rounded-full font-semibold transition-colors flex-1";
  const activeModeClasses = "bg-accent text-bg-secondary";
  const inactiveModeClasses = "bg-bg-secondary hover:bg-white/10 text-text-secondary";

  // Detectar tema actual (según clase en <body>) y reaccionar a cambios
  const [isDarkTheme, setIsDarkTheme] = useState(() =>
    typeof document !== 'undefined' && document.body.classList.contains('dark-theme')
  );

  useEffect(() => {
    const update = () => setIsDarkTheme(document.body.classList.contains('dark-theme'));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]"
      onClick={onClose}
    >
      <GlassCard
        className={`relative w-11/12 max-w-md p-6 sm:p-8 m-4 rounded-2xl border backdrop-blur-glass ${isDarkTheme ? '' : '!bg-white/95 !border-black/10'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition">
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-center mb-4">{title}</h3>

        <div className="flex items-center justify-center gap-1 mx-auto mb-6 p-1 rounded-full bg-bg-primary border border-glass-border w-full">
          <button onClick={() => setView('manual')} className={`${baseButtonClasses} ${view === 'manual' ? activeModeClasses : inactiveModeClasses}`}>
            <Plus size={16} className="inline mr-1" /> Manual
          </button>
          <button onClick={() => setView('favorites')} className={`${baseButtonClasses} ${view === 'favorites' ? activeModeClasses : inactiveModeClasses}`}>
            <BookMarked size={16} className="inline mr-1" /> Guardadas
          </button>
        </div>

        {view === 'manual' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-[fade-in_0.3s]">
            {/* NUEVO: interruptor 'Por 100 g' */}
            <div className="flex items-center justify-between -mt-2">
              <label className="text-sm font-medium text-text-secondary">Introducir valores por 100 g</label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={per100Mode}
                  onChange={(e) => setPer100Mode(e.target.checked)}
                />
                <div className="w-10 h-6 bg-bg-secondary border border-glass-border rounded-full peer-checked:bg-accent relative transition">
                  <div className="absolute top-1 left-1 w-4 h-4 bg-bg-primary rounded-full transition peer-checked:translate-x-4" />
                </div>
              </label>
            </div>

            {/* Siempre: Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-2">Descripción</label>
              <input id="description" name="description" type="text" value={formData.description} onChange={handleChange} required className={baseInputClasses} placeholder="Ej: Pechuga de pollo y arroz" />
            </div>

            {/* Modo normal (directo) */}
            {!per100Mode && (
              <>
                <div>
                  <label htmlFor="calories" className="block text-sm font-medium text-text-secondary mb-2">Calorías (kcal)</label>
                  <input id="calories" name="calories" type="text" inputMode="decimal" value={formData.calories} onChange={handleChange} required className={baseInputClasses} placeholder="Ej: 550" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="protein_g" className="block text-sm font-medium text-text-secondary mb-2">Proteínas (g)</label>
                    <input id="protein_g" name="protein_g" type="text" inputMode="decimal" value={formData.protein_g} onChange={handleChange} className={baseInputClasses} placeholder="Ej: 45" />
                  </div>
                  <div>
                    <label htmlFor="carbs_g" className="block text-sm font-medium text-text-secondary mb-2">Carbs (g)</label>
                    <input id="carbs_g" name="carbs_g" type="text" inputMode="decimal" value={formData.carbs_g} onChange={handleChange} className={baseInputClasses} placeholder="Ej: 60" />
                  </div>
                  <div>
                    <label htmlFor="fats_g" className="block text-sm font-medium text-text-secondary mb-2">Grasas (g)</label>
                    <input id="fats_g" name="fats_g" type="text" inputMode="decimal" value={formData.fats_g} onChange={handleChange} className={baseInputClasses} placeholder="Ej: 15" />
                  </div>
                </div>
                <div>
                  <label htmlFor="weight_g" className="block text-sm font-medium text-text-secondary mb-2">Gramos (g)</label>
                  <input id="weight_g" name="weight_g" type="text" inputMode="decimal" value={formData.weight_g} onChange={handleChange} className={baseInputClasses} placeholder="Ej: 150" />
                </div>
              </>
            )}

            {/* Modo por 100 g */}
            {per100Mode && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="calories100" className="block text-sm font-medium text-text-secondary mb-2">Calorías (kcal) por 100 g</label>
                    <input id="calories100" name="calories100" type="text" inputMode="decimal" value={per100.calories100} onChange={handleChangePer100} className={baseInputClasses} placeholder="Ej: 150" />
                  </div>
                  <div>
                    <label htmlFor="protein100" className="block text-sm font-medium text-text-secondary mb-2">Proteínas (g) por 100 g</label>
                    <input id="protein100" name="protein100" type="text" inputMode="decimal" value={per100.protein100} onChange={handleChangePer100} className={baseInputClasses} placeholder="Ej: 12" />
                  </div>
                  <div>
                    <label htmlFor="carbs100" className="block text-sm font-medium text-text-secondary mb-2">Carbs (g) por 100 g</label>
                    <input id="carbs100" name="carbs100" type="text" inputMode="decimal" value={per100.carbs100} onChange={handleChangePer100} className={baseInputClasses} placeholder="Ej: 20" />
                  </div>
                  <div>
                    <label htmlFor="fats100" className="block text-sm font-medium text-text-secondary mb-2">Grasas (g) por 100 g</label>
                    <input id="fats100" name="fats100" type="text" inputMode="decimal" value={per100.fats100} onChange={handleChangePer100} className={baseInputClasses} placeholder="Ej: 5" />
                  </div>
                </div>

                <div>
                  <label htmlFor="weight_g" className="block text-sm font-medium text-text-secondary mb-2">Gramos que comerás (g)</label>
                  <input id="weight_g" name="weight_g" type="text" inputMode="decimal" value={formData.weight_g} onChange={handleChange} className={baseInputClasses} placeholder="Ej: 150" />
                </div>

                {/* Resumen de cálculo */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                  <div className="p-2 rounded-md bg-bg-secondary border border-glass-border text-center">
                    <p className="text-xs text-text-muted">Calorías</p>
                    <p className="font-semibold">{formData.calories || 0} kcal</p>
                  </div>
                  <div className="p-2 rounded-md bg-bg-secondary border border-glass-border text-center">
                    <p className="text-xs text-text-muted">Proteínas</p>
                    <p className="font-semibold">{formData.protein_g || 0} g</p>
                  </div>
                  <div className="p-2 rounded-md bg-bg-secondary border border-glass-border text-center">
                    <p className="text-xs text-text-muted">Carbs</p>
                    <p className="font-semibold">{formData.carbs_g || 0} g</p>
                  </div>
                  <div className="p-2 rounded-md bg-bg-secondary border border-glass-border text-center">
                    <p className="text-xs text-text-muted">Grasas</p>
                    <p className="font-semibold">{formData.fats_g || 0} g</p>
                  </div>
                </div>
              </>
            )}

            {/* Opciones de favoritos */}
            <div className="border border-glass-border rounded-xl p-4 bg-bg-secondary/50">
              {!logToEdit && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAsFavorite}
                    onChange={(e) => setSaveAsFavorite(e.target.checked)}
                    className="w-4 h-4 border-glass-border rounded focus:ring-accent focus:ring-2"
                    style={{ accentColor: 'var(--color-accent)' }}
                  />
                  <span className="text-sm text-text-secondary">Guardar esta comida en favoritos</span>
                </label>
              )}
              
              {logToEdit && (
                <>
                  {!isAlreadyFavorite() && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveAsFavorite}
                        onChange={(e) => setSaveAsFavorite(e.target.checked)}
                        className="w-4 h-4 border-glass-border rounded focus:ring-accent focus:ring-2"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                      <span className="text-sm text-text-secondary">Guardar esta comida en favoritos</span>
                    </label>
                  )}
                  
                  {isAlreadyFavorite() && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={removeFromFavorites}
                        onChange={(e) => setRemoveFromFavorites(e.target.checked)}
                        className="w-4 h-4 border-glass-border rounded focus:ring-accent focus:ring-2"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                      <span className="text-sm text-text-secondary">Eliminar de favoritos</span>
                    </label>
                  )}
                </>
              )}
            </div>

            {/* Botón Guardar */}
            <div className="mt-6">
              <button
                type="submit"
                className="w-full rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 dark:focus:ring-offset-transparent"
              >
                Guardar
              </button>
            </div>
          </form>
        )}

        {view === 'favorites' && (
          <div className="space-y-3 animate-[fade-in_0.3s]">
            {favoriteMeals.length === 0 && (
              <p className="text-sm text-text-secondary text-center">
                No tienes comidas guardadas aún.
              </p>
            )}

            {paginatedMeals.map((meal) => (
              <div
                key={meal.id}
                onClick={() => handleSelectFavorite(meal)}
                className="flex items-center justify-between p-3 bg-bg-secondary border border-glass-border rounded-md hover:bg-white/5 cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-text-primary">{meal.name}</p>
                  <p className="text-xs text-text-secondary">
                    {meal.calories} kcal · P {meal.protein_g} g · C {meal.carbs_g} g · G {meal.fats_g} g
                  </p>
                </div>
                <button
                  className="text-text-secondary hover:text-red-500 p-2"
                  onClick={(e) => handleDeleteFavorite(meal.id, e)}
                  aria-label="Eliminar de favoritos"
                  title="Eliminar de favoritos"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            {favoriteMeals.length > 0 && (
              <div className="flex items-center justify-between pt-2 gap-2">
                <button
                  className="flex-shrink-0 px-2 sm:px-3 py-1 rounded-md border border-glass-border text-text-secondary hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <span className="inline-flex items-center gap-1">
                    <ChevronLeft size={14} className="sm:hidden" />
                    <ChevronLeft size={16} className="hidden sm:inline" />
                    <span className="hidden xs:inline">Anterior</span>
                  </span>
                </button>
                <span className="text-xs sm:text-sm text-text-secondary text-center flex-1 px-1">
                  <span className="hidden xs:inline">Página </span>
                  {currentPage}<span className="hidden xs:inline"> de {totalPages}</span>
                  <span className="xs:hidden">/{totalPages}</span>
                </span>
                <button
                  className="flex-shrink-0 px-2 sm:px-3 py-1 rounded-md border border-glass-border text-text-secondary hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <span className="inline-flex items-center gap-1">
                    <span className="hidden xs:inline">Siguiente</span>
                    <ChevronRight size={14} className="sm:hidden" />
                    <ChevronRight size={16} className="hidden sm:inline" />
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 grid place-items-center bg-black/30 rounded-2xl">
            <Spinner />
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default NutritionLogModal;