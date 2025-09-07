import React, { useState, useMemo, useEffect } from 'react';
import { X, Plus, Minus, GlassWater } from 'lucide-react';
import GlassCard from './GlassCard';
import Spinner from './Spinner';

const WaterLogModal = ({ initialQuantity = 0, onSave, onClose, isLoading }) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [mode, setMode] = useState('ml');
  
  // --- INICIO DE LA MODIFICACIÓN ---
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
  // --- FIN DE LA MODIFICACIÓN ---

  const glasses = useMemo(() => Math.floor(quantity / 250), [quantity]);
  const glassSize = 250;

  const handleAdjustMl = (amount) => setQuantity(prev => Math.max(0, prev + amount));
  const handleAdjustGlasses = (amount) => setQuantity(prev => Math.max(0, prev + (amount * glassSize)));
  const handleSave = () => onSave(quantity);

  const baseButtonClasses = "px-4 py-2 rounded-full font-semibold transition-colors";
  const activeModeClasses = "bg-accent text-bg-secondary";
  const inactiveModeClasses = isDarkTheme ? "bg-bg-secondary hover:bg-white/10" : "bg-gray-200 hover:bg-gray-300";
  const buttonBgClass = isDarkTheme ? 'bg-bg-secondary' : 'bg-white';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]"
      onClick={onClose}
    >
      <GlassCard
        className={`relative w-11/12 max-w-sm p-8 m-4 text-center ${!isDarkTheme ? '!bg-white/95 !border-black/10' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition">
          <X size={20} />
        </button>
        
        <div className={`flex items-center justify-center gap-2 mx-auto mb-4 p-1 rounded-full border border-glass-border w-fit ${isDarkTheme ? 'bg-bg-primary' : 'bg-gray-100'}`}>
          <button onClick={() => setMode('ml')} className={`${baseButtonClasses} ${mode === 'ml' ? activeModeClasses : inactiveModeClasses}`}>
            Cantidad (ml)
          </button>
          <button onClick={() => setMode('glasses')} className={`${baseButtonClasses} ${mode === 'glasses' ? activeModeClasses : inactiveModeClasses}`}>
            Vasos
          </button>
        </div>

        <h3 className="text-xl font-bold mb-6">Registro de Agua</h3>

        {mode === 'ml' ? (
          <>
            <div className="flex items-center justify-center gap-2">
                <button onClick={() => handleAdjustMl(-250)} className={`p-4 rounded-full border border-glass-border hover:border-accent transition flex-shrink-0 ${buttonBgClass}`}>
                    <Minus size={24} />
                </button>
                <div className="flex items-baseline justify-center flex-grow text-center min-w-0">
                    <p className="text-4xl sm:text-5xl font-extrabold">{quantity}</p>
                    <span className="text-xl sm:text-2xl font-bold text-text-muted ml-1.5 flex-shrink-0">ml</span>
                </div>
                <button onClick={() => handleAdjustMl(250)} className={`p-4 rounded-full border border-glass-border hover:border-accent transition flex-shrink-0 ${buttonBgClass}`}>
                    <Plus size={24} />
                </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-6">
                {[250, 500, 750].map(amount => (
                    <button 
                        key={amount}
                        onClick={() => handleAdjustMl(amount)}
                        className={`p-2 rounded-md border border-glass-border font-semibold hover:border-accent transition ${buttonBgClass}`}
                    >
                        +{amount} ml
                    </button>
                ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-4">
                <button onClick={() => handleAdjustGlasses(-1)} className={`p-4 rounded-full border border-glass-border hover:border-accent transition ${buttonBgClass}`}>
                    <Minus size={24} />
                </button>
                <div className="text-center w-32">
                  <p className="text-5xl font-extrabold">{glasses}</p>
                  <p className="text-sm font-bold text-text-muted -mt-1">{glasses === 1 ? 'Vaso' : 'Vasos'}</p>
                </div>
                <button onClick={() => handleAdjustGlasses(1)} className={`p-4 rounded-full border border-glass-border hover:border-accent transition ${buttonBgClass}`}>
                    <Plus size={24} />
                </button>
            </div>
             <div className="grid grid-cols-3 gap-2 mt-6">
                {[1, 2, 3].map(amount => (
                    <button 
                        key={amount}
                        onClick={() => handleAdjustGlasses(amount)}
                        className={`p-2 rounded-md border border-glass-border font-semibold hover:border-accent transition flex items-center justify-center gap-1 ${buttonBgClass}`}
                    >
                        <Plus size={14}/> <span className="text-lg">{amount}</span> <GlassWater size={16}/>
                    </button>
                ))}
            </div>
          </>
        )}

        <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center justify-center w-full mt-6 py-3 rounded-md bg-accent text-bg-secondary font-semibold transition hover:scale-105 disabled:opacity-70"
        >
            {isLoading ? <Spinner /> : 'Guardar'}
        </button>

      </GlassCard>
    </div>
  );
};

export default WaterLogModal;