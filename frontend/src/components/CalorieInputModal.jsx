import React, { useState } from 'react';
import { X, CheckCircle, Target } from 'lucide-react';
import GlassCard from './GlassCard';
import Spinner from './Spinner';

const CalorieInputModal = ({ estimatedCalories, onComplete, onCancel, isSaving }) => {
  const [selection, setSelection] = useState(null);
  const [customCalories, setCustomCalories] = useState('');
  
  // --- INICIO DE LA MODIFICACIÓN ---
  const [error, setError] = useState(''); // Estado para el mensaje de error

  const handleCustomChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomCalories(value);
    if (error) {
      setError(''); // Limpia el error al empezar a escribir de nuevo
    }
  };

  const handleSubmit = () => {
    if (selection === 'custom') {
      const calValue = parseInt(customCalories, 10);
      if (!isNaN(calValue) && calValue > 0) {
        onComplete(calValue);
      } else {
        // En lugar de una alerta, establecemos el mensaje de error
        setError('Por favor, introduce un valor de calorías válido.');
      }
    } else if (selection === 'estimated') {
      onComplete(estimatedCalories);
    }
  };
  // --- FIN DE LA MODIFICACIÓN ---

  const baseButtonClasses = "w-full text-left p-4 rounded-md border-2 transition-all duration-200 flex items-start gap-4";
  const inactiveButtonClasses = "border-glass-border hover:border-accent/50";
  const activeButtonClasses = "border-accent bg-accent-transparent";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]"
      onClick={onCancel}
    >
      <GlassCard
        className="relative w-full max-w-md p-8 m-4 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onCancel} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition">
          <X size={20} />
        </button>

        <div>
          <h3 className="text-xl font-bold text-center">Registrar Calorías</h3>
          <p className="text-text-secondary text-center text-sm mt-1">¿Has medido las calorías quemadas con un dispositivo?</p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => setSelection('custom')}
            className={`${baseButtonClasses} ${selection === 'custom' ? activeButtonClasses : inactiveButtonClasses}`}
          >
            <CheckCircle className={`mt-1 flex-shrink-0 ${selection === 'custom' ? 'text-accent' : 'text-text-muted'}`} size={20} />
            <div>
              <p className="font-semibold">Sí, introducir manualmente</p>
              <p className="text-sm text-text-secondary">Usa el valor exacto de tu reloj o monitor.</p>
            </div>
          </button>
          {selection === 'custom' && (
            <div className="pl-10 animate-[fade-in-up_0.3s_ease-out]">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Ej: 350"
                value={customCalories}
                onChange={handleCustomChange}
                className={`w-full bg-bg-secondary border rounded-md px-4 py-3 text-text-primary focus:border-accent focus:ring-accent/50 focus:ring-2 outline-none transition ${error ? 'border-red' : 'border-glass-border'}`}
                autoFocus
              />
              {/* --- INICIO DE LA MODIFICACIÓN --- */}
              {/* Se muestra el mensaje de error aquí */}
              {error && <p className="text-red text-sm mt-1">{error}</p>}
              {/* --- FIN DE LA MODIFICACIÓN --- */}
            </div>
          )}

          <button 
            onClick={() => setSelection('estimated')}
            className={`${baseButtonClasses} ${selection === 'estimated' ? activeButtonClasses : inactiveButtonClasses}`}
          >
            <Target className={`mt-1 flex-shrink-0 ${selection === 'estimated' ? 'text-accent' : 'text-text-muted'}`} size={20} />
            <div>
              <p className="font-semibold">No, usar estimación de la app</p>
              <p className="text-sm text-text-secondary">Se guardará un valor aproximado de <strong>{estimatedCalories} kcal</strong>.</p>
            </div>
          </button>
        </div>
        
        <button
            onClick={handleSubmit}
            disabled={!selection || isSaving}
            className="flex items-center justify-center gap-2 w-full mt-2 py-3 rounded-md bg-accent text-bg-secondary font-semibold transition hover:scale-105 disabled:opacity-70"
        >
            {isSaving ? <Spinner /> : 'Guardar Entrenamiento'}
        </button>
      </GlassCard>
    </div>
  );
};

export default CalorieInputModal;