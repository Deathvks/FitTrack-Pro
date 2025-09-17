import React from 'react';
import { X, Sparkles, KeyRound, Wand2, Calculator, Brush, RefreshCw } from 'lucide-react';

const WelcomeModal = ({ onClose }) => {
  const features = [
    // --- INICIO DE LA MODIFICACIÓN ---
    {
      icon: <Brush className="w-6 h-6 text-emerald-400" />,
      title: "Mejoras Visuales en el Dashboard",
      description: "Hemos rediseñado el resumen diario para que todos los elementos (calorías, proteínas, agua y creatina) se muestren perfectamente alineados."
    },
    {
      icon: <Wand2 className="w-6 h-6 text-purple-400" />,
      title: "Corrección de Tema Claro",
      description: "Solucionamos varios problemas visuales en los modales para que ahora se muestren correctamente al usar el tema claro."
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-sky-400" />,
      title: "Actualización de Datos Mejorada",
      description: "El dashboard ahora refresca tus datos de nutrición y creatina automáticamente al volver a él, sin necesidad de recargar la página."
    }
    // --- FIN DE LA MODIFICACIÓN ---
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]"
      onClick={onClose}
    >
      <div
        className="bg-bg-primary rounded-2xl shadow-xl m-4 w-full max-w-md flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-accent/20">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div>
                {/* --- INICIO DE LA MODIFICACIÓN --- */}
                <h2 className="text-xl font-bold text-text-primary">¡Bienvenido a v2.12.11!</h2>
                {/* --- FIN DE LA MODIFICACIÓN --- */}
                <p className="text-sm text-text-secondary">Novedades y mejoras</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Features List (Scrollable) */}
        <div className="overflow-y-auto px-6 space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 p-4 rounded-xl
                                        bg-bg-secondary hover:bg-bg-tertiary
                                        transition-colors duration-200">
              <div className="flex-shrink-0 mt-0.5">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">{feature.title}</h3>
                <p className="text-sm text-text-secondary">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="p-6 pt-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl font-semibold bg-accent text-white hover:bg-accent/90 transition-colors"
          >
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;