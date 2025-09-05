import React from 'react';
import { X, Palette, Smartphone, Code, Wrench, Sparkles, CheckSquare, Scale } from 'lucide-react';

const WelcomeModal = ({ onClose }) => {
  const features = [
    {
      icon: <Scale className="w-6 h-6 text-accent" />,
      title: "Cálculo Nutricional por 100g",
      description: "Nueva funcionalidad para calcular valores nutricionales basados en porciones de 100 gramos"
    },
    {
      icon: <CheckSquare className="w-6 h-6 text-blue-400" />,
      title: "Checkboxes Mejorados",
      description: "Checkboxes con colores de acento dinámicos que se adaptan perfectamente a temas claros y oscuros"
    },
    {
      icon: <Code className="w-6 h-6 text-accent" />,
      title: "Optimización CSS",
      description: "Estilos CSS mejorados para elementos de formulario con mejor rendimiento y consistencia"
    },
    {
      icon: <Wrench className="w-6 h-6 text-red-400" />,
      title: "Correcciones de UI",
      description: "Resolución de problemas visuales en controles de formulario y mejor experiencia de usuario"
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]"
      onClick={onClose}
    >
      <div 
        className="bg-bg-primary rounded-2xl shadow-xl p-6 m-4 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-accent/20">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">¡Bienvenido a v2.6.0!</h2>
              <p className="text-sm text-text-secondary">Nuevas funciones de nutrición y mejoras de UI</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Features List */}
        <div className="space-y-3 mb-6">
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
        <button 
          onClick={onClose}
          className="w-full px-6 py-3 rounded-xl font-semibold bg-accent text-white hover:bg-accent/90 transition-colors"
        >
          ¡Empezar a Explorar!
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;
