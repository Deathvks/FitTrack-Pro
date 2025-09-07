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

  const [per100Mode, setPer100Mode] = useState(false);
  const [per100, setPer100] = useState({
    calories100: '',
    protein100: '',
    carbs100: '',
    fats100: '',
  });
  
  const [originalData, setOriginalData] = useState(null);

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

  const totalPages = Math.ceil(favoriteMeals.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMeals = favoriteMeals.slice(startIndex, endIndex);

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
      setOriginalData(initialData);
    }
  }, [logToEdit]);
  
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
      // --- INICIO DE LA MODIFICACIÓN ---
      weight_g: meal.weight_g || '',
      // --- FIN DE LA MODIFICACIÓN ---
    });
    setView('manual');
  };
  
  const handleDeleteFavorite = async (mealId, event) => {
    event.stopPropagation();
    const result = await deleteFavoriteMeal(mealId);
    addToast(result.message, result.success ? 'success' : 'error');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['calories', 'protein_g', 'carbs_g', 'fats_g', 'weight_g'].includes(name)) {
      if (/^\d*\.?\d*$/.test(value)) {
        if (name === 'weight_g' && per100Mode) {
          const computed = computeFromPer100(per100.calories100, per100.protein100, per100.carbs100, per100.fats100, value);
          setFormData(prev => ({ ...prev, ...computed }));
        } else {
          setFormData(prev => ({ ...prev, [name]: value }));
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleChangePer100 = (e) => {
    const { name, value } = e.target;
    if (!/^\d*\.?\d*$/.test(value)) return;
    const newPer100 = { ...per100, [name]: value };
    setPer100(newPer100);
    if (per100Mode) {
      const computed = computeFromPer100(newPer100.calories100, newPer100.protein100, newPer100.carbs100, newPer100.fats100, formData.weight_g);
      setFormData(prev => ({ ...prev, ...computed }));
    }
  };

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
  }, [per100Mode]);
  
  const isAlreadyFavorite = () => favoriteMeals.some(meal => meal.name.toLowerCase().trim() === formData.description.toLowerCase().trim());
  const getExistingFavoriteMeal = () => favoriteMeals.find(meal => meal.name.toLowerCase().trim() === formData.description.toLowerCase().trim());

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

    if (logToEdit && originalData) {
      const hasChanges = Object.keys(formData).some(key => formData[key] !== originalData[key]) || saveAsFavorite || removeFromFavorites;
      if (!hasChanges) {
        addToast('No se han realizado cambios en la comida.', 'error');
        return;
      }
    }

    if (logToEdit) {
      const existingFavorite = getExistingFavoriteMeal();
      if (removeFromFavorites && existingFavorite) {
        await deleteFavoriteMeal(existingFavorite.id);
      } else if (saveAsFavorite && !existingFavorite) {
        await addFavoriteMeal({ name: dataToSave.description, ...dataToSave });
      }
    } else if (saveAsFavorite) {
      await addFavoriteMeal({ name: dataToSave.description, ...dataToSave });
    }

    onSave(dataToSave);
  };
  
  const [isDarkTheme, setIsDarkTheme] = useState(() =>
    typeof document !== 'undefined' && !document.body.classList.contains('light-theme')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkTheme(!document.body.classList.contains('light-theme'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const mealTitles = { breakfast: 'Desayuno', lunch: 'Almuerzo', dinner: 'Cena', snack: 'Snack' };
  const title = `${logToEdit ? 'Editar' : 'Añadir'} Registro en ${mealTitles[mealType]}`;
  
  const baseInputClasses = `w-full rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition ${isDarkTheme ? 'bg-bg-secondary border-glass-border' : 'bg-white border-gray-300'}`;
  const baseButtonClasses = "px-4 py-2 rounded-full font-semibold transition-colors flex-1";
  const activeModeClasses = "bg-accent text-bg-secondary";
  const inactiveModeClasses = isDarkTheme ? "bg-bg-secondary hover:bg-white/10 text-text-secondary" : "bg-gray-200 hover:bg-gray-300";
  const toggleContainerBg = isDarkTheme ? 'bg-bg-primary' : 'bg-gray-100';
  const favoriteItemBg = isDarkTheme ? 'bg-bg-secondary hover:bg-white/5' : 'bg-white hover:bg-gray-50';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]"
      onClick={onClose}
    >
      <GlassCard
        className={`relative w-11/12 max-w-md p-6 sm:p-8 m-4 rounded-2xl ${!isDarkTheme ? '!bg-white/95 !border-black/10' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition">
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-center mb-4">{title}</h3>

        <div className={`flex items-center justify-center gap-1 mx-auto mb-6 p-1 rounded-full border border-glass-border w-full ${toggleContainerBg}`}>
          <button onClick={() => setView('manual')} className={`${baseButtonClasses} ${view === 'manual' ? activeModeClasses : inactiveModeClasses}`}>
            <Plus size={16} className="inline mr-1" /> Manual
          </button>
          <button onClick={() => setView('favorites')} className={`${baseButtonClasses} ${view === 'favorites' ? activeModeClasses : inactiveModeClasses}`}>
            <BookMarked size={16} className="inline mr-1" /> Guardadas
          </button>
        </div>

        {view === 'manual' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-[fade-in_0.3s]">
            <div className="flex items-center justify-between -mt-2">
              <label className="text-sm font-medium text-text-secondary">Introducir valores por 100 g</label>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={per100Mode} onChange={(e) => setPer100Mode(e.target.checked)} />
                <div className={`w-10 h-6 rounded-full peer-checked:bg-accent relative transition ${isDarkTheme ? 'bg-bg-secondary border-glass-border' : 'bg-gray-200 border-gray-300'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition peer-checked:translate-x-4 ${isDarkTheme ? 'bg-bg-primary' : 'bg-white'}`} />
                </div>
              </label>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-2">Descripción</label>
              <input id="description" name="description" type="text" value={formData.description} onChange={handleChange} required className={baseInputClasses} placeholder="Ej: Pechuga de pollo y arroz" />
            </div>

            {!per100Mode && (
              <>
                <div><label htmlFor="calories" className="block text-sm font-medium text-text-secondary mb-2">Calorías (kcal)</label><input id="calories" name="calories" type="text" inputMode="decimal" value={formData.calories} onChange={handleChange} required className={baseInputClasses} placeholder="Ej: 550" /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label htmlFor="protein_g" className="block text-sm font-medium text-text-secondary mb-2">Proteínas (g)</label><input id="protein_g" name="protein_g" type="text" inputMode="decimal" value={formData.protein_g} onChange={handleChange} className={baseInputClasses} placeholder="Ej: 45" /></div>
                  <div><label htmlFor="carbs_g" className="block text-sm font-medium text-text-secondary mb-2">Carbs (g)</label><input id="carbs_g" name="carbs_g" type="text" inputMode="decimal" value={formData.carbs_g} onChange={handleChange} className={baseInputClasses} placeholder="Ej: 60" /></div>
                  <div><label htmlFor="fats_g" className="block text-sm font-medium text-text-secondary mb-2">Grasas (g)</label><input id="fats_g" name="fats_g" type="text" inputMode="decimal" value={formData.fats_g} onChange={handleChange} className={baseInputClasses} placeholder="Ej: 15" /></div>
                </div>
                <div><label htmlFor="weight_g" className="block text-sm font-medium text-text-secondary mb-2">Gramos (g)</label><input id="weight_g" name="weight_g" type="text" inputMode="decimal" value={formData.weight_g} onChange={handleChange} className={baseInputClasses} placeholder="Ej: 150" /></div>
              </>
            )}

            {per100Mode && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><label htmlFor="calories100" className="block text-sm font-medium text-text-secondary mb-2">Cal/100g</label><input id="calories100" name="calories100" type="text" inputMode="decimal" value={per100.calories100} onChange={handleChangePer100} className={baseInputClasses} placeholder="Ej: 150" /></div>
                  <div><label htmlFor="protein100" className="block text-sm font-medium text-text-secondary mb-2">Prot/100g</label><input id="protein100" name="protein100" type="text" inputMode="decimal" value={per100.protein100} onChange={handleChangePer100} className={baseInputClasses} placeholder="Ej: 12" /></div>
                  <div><label htmlFor="carbs100" className="block text-sm font-medium text-text-secondary mb-2">Carbs/100g</label><input id="carbs100" name="carbs100" type="text" inputMode="decimal" value={per100.carbs100} onChange={handleChangePer100} className={baseInputClasses} placeholder="Ej: 20" /></div>
                  <div><label htmlFor="fats100" className="block text-sm font-medium text-text-secondary mb-2">Grasas/100g</label><input id="fats100" name="fats100" type="text" inputMode="decimal" value={per100.fats100} onChange={handleChangePer100} className={baseInputClasses} placeholder="Ej: 5" /></div>
                </div>
                <div><label htmlFor="weight_g" className="block text-sm font-medium text-text-secondary mb-2">Gramos totales</label><input id="weight_g" name="weight_g" type="text" inputMode="decimal" value={formData.weight_g} onChange={handleChange} className={baseInputClasses} placeholder="Ej: 150" /></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                  <div className={`p-2 rounded-md border text-center ${isDarkTheme ? 'bg-bg-secondary border-glass-border' : 'bg-gray-100 border-gray-200'}`}><p className="text-xs text-text-muted">Calorías</p><p className="font-semibold">{formData.calories || 0} kcal</p></div>
                  <div className={`p-2 rounded-md border text-center ${isDarkTheme ? 'bg-bg-secondary border-glass-border' : 'bg-gray-100 border-gray-200'}`}><p className="text-xs text-text-muted">Proteínas</p><p className="font-semibold">{formData.protein_g || 0} g</p></div>
                  <div className={`p-2 rounded-md border text-center ${isDarkTheme ? 'bg-bg-secondary border-glass-border' : 'bg-gray-100 border-gray-200'}`}><p className="text-xs text-text-muted">Carbs</p><p className="font-semibold">{formData.carbs_g || 0} g</p></div>
                  <div className={`p-2 rounded-md border text-center ${isDarkTheme ? 'bg-bg-secondary border-glass-border' : 'bg-gray-100 border-gray-200'}`}><p className="text-xs text-text-muted">Grasas</p><p className="font-semibold">{formData.fats_g || 0} g</p></div>
                </div>
              </>
            )}

            <div className={`rounded-xl p-4 ${isDarkTheme ? 'bg-bg-secondary/50 border-glass-border' : 'bg-gray-100 border-gray-200'} border`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={saveAsFavorite} onChange={(e) => setSaveAsFavorite(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm text-text-secondary">Guardar esta comida en favoritos</span>
              </label>
            </div>

            <div className="mt-6"><button type="submit" className="w-full rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold py-3 transition-colors">Guardar</button></div>
          </form>
        )}

        {view === 'favorites' && (
          <div className="space-y-3 animate-[fade-in_0.3s]">
            {favoriteMeals.length === 0 ? <p className="text-sm text-text-secondary text-center">No tienes comidas guardadas aún.</p> :
            paginatedMeals.map((meal) => (
              <div key={meal.id} onClick={() => handleSelectFavorite(meal)} className={`flex items-center justify-between p-3 border rounded-md cursor-pointer ${favoriteItemBg} ${isDarkTheme ? 'border-glass-border' : 'border-gray-200'}`}>
                <div>
                  <p className="font-semibold text-text-primary">{meal.name}</p>
                  {/* --- INICIO DE LA MODIFICACIÓN --- */}
                  <p className="text-xs text-text-secondary">
                    {meal.calories} kcal
                    {meal.weight_g && ` (${meal.weight_g}g)`}
                    {' · '}P {meal.protein_g}g · C {meal.carbs_g}g · G {meal.fats_g}g
                  </p>
                  {/* --- FIN DE LA MODIFICACIÓN --- */}
                </div>
                <button className="text-text-secondary hover:text-red-500 p-2" onClick={(e) => handleDeleteFavorite(meal.id, e)}><Trash2 size={18} /></button>
              </div>
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 gap-2">
                <button className={`px-3 py-1 rounded-md border text-sm hover:bg-white/5 disabled:opacity-40 ${isDarkTheme ? 'border-glass-border' : 'border-gray-200'}`} onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeft size={16} /></button>
                <span className="text-sm text-text-secondary">Página {currentPage} de {totalPages}</span>
                <button className={`px-3 py-1 rounded-md border text-sm hover:bg-white/5 disabled:opacity-40 ${isDarkTheme ? 'border-glass-border' : 'border-gray-200'}`} onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 grid place-items-center bg-black/30 rounded-2xl"><Spinner /></div>
        )}
      </GlassCard>
    </div>
  );
};

export default NutritionLogModal;