import React from 'react';
import { X, Sparkles, Utensils, Weight, CheckSquare, Droplet, Copy } from 'lucide-react';

const WelcomeModal = ({ onClose }) => {
  const features = [
    {
      icon: <Copy className="w-6 h-6 text-green-400" />,
      title: "Copia Rutinas Completas con un Clic",
      description: "Añade rutinas de varios días a tu calendario con un solo botón, ahorrando tiempo y simplificando tu planificación."
    },
    {
      icon: <Droplet className="w-6 h-6 text-blue-400" />,
      title: "Corrección en el Contador de Creatina",
      description: "Hemos solucionado un error que provocaba que el contador de días de creatina se reiniciara incorrectamente."
    },
    {
      icon: <Utensils className="w-6 h-6 text-accent" />,
      title: "Precisión en Tus Comidas Favoritas",
      description: "Ahora puedes guardar los gramos exactos de tus comidas favoritas para un registro nutricional más rápido y preciso."
    },
    {
      icon: <CheckSquare className="w-6 h-6 text-purple-400" />,
      title: "Correcciones en Formularios",
      description: "Hemos mejorado la validación y el comportamiento en los modales de calorías y login para una experiencia más fluida."
    },
    {
      icon: <Weight className="w-6 h-6 text-amber-400" />,
      title: "Mejoras de Calidad de Vida",
      description: "Se han pulido varios aspectos de la interfaz, como la alineación de notificaciones y la responsividad de los componentes."
    },
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
                <h2 className="text-xl font-bold text-text-primary">¡Bienvenido a v2.10.0!</h2>
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