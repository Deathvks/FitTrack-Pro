import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import Spinner from './Spinner';

const ConfirmationModal = ({ 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  isLoading = false
}) => {
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]"
      onClick={onCancel}
    >
      <GlassCard 
        className={`p-8 m-4 w-full max-w-sm text-center ${!isDarkTheme ? '!bg-white/95 !border-black/10' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row-reverse sm:justify-center gap-4">
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-3 sm:py-2 rounded-full font-semibold bg-red text-white hover:bg-red/80 transition disabled:opacity-70 whitespace-nowrap"
          >
            {isLoading ? <Spinner size={18} /> : confirmText}
          </button>
          <button 
            onClick={onCancel} 
            disabled={isLoading}
            className={`px-6 py-3 sm:py-2 rounded-full font-semibold transition disabled:opacity-70 ${!isDarkTheme ? 'bg-gray-200 hover:bg-gray-300' : 'bg-bg-secondary hover:bg-white/10'}`}
          >
            {cancelText}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default ConfirmationModal;