import React from 'react';
import { X, Utensils, Droplets, Dumbbell, Bug, Sparkles } from 'lucide-react';
import GlassCard from './GlassCard';

const WelcomeModal = ({ onClose }) => {
  const features = [
    {
      icon: <Utensils className="w-6 h-6 text-accent" />,
      title: "Página de Nutrición",
      description: "Registra tus comidas, controla calorías y gestiona tus favoritos"
    },
    {
      icon: <Droplets className="w-6 h-6 text-blue-400" />,
      title: "Seguimiento de Agua",
      description: "Mantén un registro diario de tu hidratación"
    },
    {
      icon: <Dumbbell className="w-6 h-6 text-accent" />,
      title: "Ejercicios por Defecto",
      description: "Rutinas predefinidas listas para usar"
    },
    {
      icon: <Bug className="w-6 h-6 text-red-400" />,
      title: "Correcciones de Errores",
      description: "Mejoras en rendimiento y estabilidad"
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]"
      onClick={onClose}
    >
      <GlassCard 
        className="p-6 m-4 w-full max-w-md" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-accent/20">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">¡Bienvenido a v2.5!</h2>
              <p className="text-sm text-text-secondary">Nuevas características disponibles</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Features List */}
        <div className="space-y-4 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
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
          className="w-full px-6 py-3 rounded-full font-semibold bg-accent text-bg-secondary hover:bg-accent/80 transition-colors"
        >
          ¡Empezar a Explorar!
        </button>
      </GlassCard>
    </div>
  );
};

export default WelcomeModal;