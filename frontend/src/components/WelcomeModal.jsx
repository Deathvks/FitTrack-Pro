import React from 'react';
import { X, Palette, Smartphone, Code, Wrench, Sparkles } from 'lucide-react';

const WelcomeModal = ({ onClose }) => {
  const features = [
    {
      icon: <Palette className="w-6 h-6 text-accent" />,
      title: "Modales con Fondo Blanco",
      description: "Mejor contraste y legibilidad en modo claro con fondos blancos sólidos"
    },
    {
      icon: <Smartphone className="w-6 h-6 text-blue-400" />,
      title: "Experiencia Visual Mejorada",
      description: "Interfaz más limpia y consistente en todos los modales de la aplicación"
    },
    {
      icon: <Code className="w-6 h-6 text-accent" />,
      title: "Correcciones Técnicas",
      description: "Resolución de errores JSX y mejor mantenimiento del código"
    },
    {
      icon: <Wrench className="w-6 h-6 text-red-400" />,
      title: "Compatibilidad con Temas",
      description: "Mantiene la estética glass en modo oscuro y mejora la claridad en modo claro"
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
              <h2 className="text-xl font-bold text-text-primary">¡Bienvenido a v2.5.2!</h2>
              <p className="text-sm text-text-secondary">Mejoras de interfaz de usuario</p>
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
