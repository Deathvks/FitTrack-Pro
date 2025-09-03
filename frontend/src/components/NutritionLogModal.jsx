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
  });
  
  const [view, setView] = useState('manual');
  const [saveAsFavorite, setSaveAsFavorite] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const { favoriteMeals, addFavoriteMeal, deleteFavoriteMeal } = useAppStore(state => ({
    favoriteMeals: state.favoriteMeals,
    addFavoriteMeal: state.addFavoriteMeal,
    deleteFavoriteMeal: state.deleteFavoriteMeal,
  }));
  const { addToast } = useToast();

  // Calcular elementos paginados
  const totalPages = Math.ceil(favoriteMeals.length / itemsPerPage);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['calories', 'protein_g', 'carbs_g', 'fats_g'].includes(name)) {
      if (/^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

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
    };

    if (saveAsFavorite && !logToEdit) {
      const favMealData = { name: dataToSave.description, ...dataToSave };
      const result = await addFavoriteMeal(favMealData);
      if (!result.success) {
        addToast(result.message, 'error');
      } else {
        addToast(result.message, 'success');
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
  
  // --- INICIO DE LA MODIFICACIÓN DE ESTILOS ---
  const baseButtonClasses = "px-4 py-2 rounded-full font-semibold transition-colors flex-1";
  const activeModeClasses = "bg-accent text-bg-secondary";
  const inactiveModeClasses = "bg-bg-secondary hover:bg-white/10 text-text-secondary";
  // --- FIN DE LA MODIFICACIÓN DE ESTILOS ---

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]"
      onClick={onClose}
    >
      <GlassCard
        className="relative w-11/12 max-w-md p-6 sm:p-8 m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition">
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-center mb-4">{title}</h3>

        {/* --- INICIO DE LA MODIFICACIÓN DE ESTILOS --- */}
        <div className="flex items-center justify-center gap-1 mx-auto mb-6 p-1 rounded-full bg-bg-primary border border-glass-border w-full">
          <button onClick={() => setView('manual')} className={`${baseButtonClasses} ${view === 'manual' ? activeModeClasses : inactiveModeClasses}`}>
            <Plus size={16} className="inline mr-1" /> Manual
          </button>
          <button onClick={() => setView('favorites')} className={`${baseButtonClasses} ${view === 'favorites' ? activeModeClasses : inactiveModeClasses}`}>
            <BookMarked size={16} className="inline mr-1" /> Guardadas
          </button>
        </div>
        {/* --- FIN DE LA MODIFICACIÓN DE ESTILOS --- */}


        {view === 'manual' && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-[fade-in_0.3s]">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-2">Descripción</label>
              <input id="description" name="description" type="text" value={formData.description} onChange={handleChange} required className={baseInputClasses} placeholder="Ej: Pechuga de pollo y arroz" />
            </div>
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

            {!logToEdit && (
              <div className="pt-4 border-t border-glass-border">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={saveAsFavorite}
                    onChange={(e) => setSaveAsFavorite(e.target.checked)}
                    className="h-5 w-5 rounded bg-bg-secondary border-glass-border text-accent focus:ring-accent"
                  />
                  <span className="text-sm font-medium text-text-secondary">Guardar esta comida en mis favoritos</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center w-full mt-4 py-3 rounded-md bg-accent text-bg-secondary font-semibold transition hover:scale-105 disabled:opacity-70"
            >
              {isLoading ? <Spinner /> : 'Guardar'}
            </button>
          </form>
        )}
        
        {view === 'favorites' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto">
              {favoriteMeals.length > 0 ? (
                paginatedMeals.map(meal => (
                  <div key={meal.id} onClick={() => handleSelectFavorite(meal)} className="bg-bg-secondary p-3 rounded-md border border-glass-border group relative cursor-pointer hover:border-accent/50">
                    <p className="font-semibold pr-8">{meal.name}</p>
                    <p className="text-sm text-text-secondary">{meal.calories} kcal &bull; {meal.protein_g || 0}g Prot &bull; {meal.carbs_g || 0}g Carbs &bull; {meal.fats_g || 0}g Grasas</p>
                    <button onClick={(e) => handleDeleteFavorite(meal.id, e)} className="absolute top-1/2 -translate-y-1/2 right-2 p-2 rounded-full bg-bg-primary text-text-muted hover:text-red opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-muted text-center py-8">No tienes comidas guardadas. Puedes añadirlas al registrar una nueva comida en la pestaña "Manual".</p>
              )}
            </div>
            
            {/* Controles de paginación */}
            {favoriteMeals.length > itemsPerPage && (
              <div className="flex items-center justify-between pt-3 border-t border-glass-border">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-md bg-bg-secondary border border-glass-border text-sm font-medium text-text-secondary hover:bg-bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </button>
                
                <span className="text-sm text-text-secondary">
                  Página {currentPage} de {totalPages} ({favoriteMeals.length} comidas)
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-md bg-bg-secondary border border-glass-border text-sm font-medium text-text-secondary hover:bg-bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

      </GlassCard>
    </div>
  );
};

export default NutritionLogModal;