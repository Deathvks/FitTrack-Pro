import React from 'react';
import { X, Palette, Smartphone, Zap, Sparkles, CheckSquare, Scale, Shield, Users } from 'lucide-react';

const WelcomeModal = ({ onClose }) => {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-purple-400" />,
      title: "Nuevo Seguimiento de Creatina",
      description: "Ahora puedes registrar y seguir tu consumo diario de creatina desde la sección de Nutrición."
    },
    {
      icon: <Shield className="w-6 h-6 text-green-400" />,
      title: "Verificación de Email Mejorada",
      description: "Se ha corregido el flujo de verificación para que sea más intuitivo y funcione a la primera."
    },
    {
      icon: <Smartphone className="w-6 h-6 text-accent" />,
      title: "Interfaz Más Pulida y Responsive",
      description: "Se han mejorado varios componentes visuales para que se adapten mejor a cualquier tamaño de pantalla."
    },
    {
      icon: <Users className="w-6 h-6 text-blue-400" />,
      title: "Mejoras de Administración",
      description: "La gestión de usuarios ahora es más robusta y segura para los administradores."
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
              <h2 className="text-xl font-bold text-text-primary">¡Bienvenido a v2.8.0!</h2>
              <p className="text-sm text-text-secondary">Seguimiento de creatina y más mejoras</p>
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
          ¡Entendido!
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;