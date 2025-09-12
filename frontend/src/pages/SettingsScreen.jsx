import React, { useState } from 'react';
import { ChevronLeft, Check, Palette, Sun, Moon, MonitorCog, User, UserCog, Shield, LogOut, Info, ChevronRight } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { APP_VERSION } from '../config/version';

const ACCENT_OPTIONS = [
  { id: 'green',  label: 'Verde',    hex: '#22c55e' },
  { id: 'blue',   label: 'Azul',     hex: '#3b82f6' },
  { id: 'violet', label: 'Violeta',  hex: '#8b5cf6' },
  { id: 'amber',  label: 'Ámbar',    hex: '#f59e0b' },
  { id: 'rose',   label: 'Rosa',     hex: '#f43f5e' },
  { id: 'teal',   label: 'Turquesa', hex: '#14b8a6' },
  { id: 'cyan',   label: 'Cian',     hex: '#06b6d4' },
  { id: 'orange', label: 'Naranja',  hex: '#f97316' },
  { id: 'lime',   label: 'Lima',     hex: '#84cc16' },
  { id: 'fuchsia',label: 'Fucsia',   hex: '#d946ef' },
  { id: 'emerald',label: 'Esmeralda',hex: '#10b981' },
  { id: 'indigo', label: 'Índigo',   hex: '#6366f1' },
  { id: 'purple', label: 'Púrpura',  hex: '#a855f7' },
  { id: 'pink',   label: 'Rosa Claro', hex: '#ec4899' },
  { id: 'red',    label: 'Rojo',     hex: '#ef4444' },
  { id: 'yellow', label: 'Amarillo', hex: '#eab308' },
  { id: 'sky',    label: 'Cielo',    hex: '#0ea5e9' },
  { id: 'slate',  label: 'Pizarra',  hex: '#64748b' },
  { id: 'zinc',   label: 'Zinc',     hex: '#71717a' },
  { id: 'stone',  label: 'Piedra',   hex: '#78716c' },
  { id: 'neutral', label: 'Neutral', hex: '#737373' }
];

export default function SettingsScreen({
  theme = 'system',
  setTheme,
  accent = 'green',
  setAccent,
  setView,
  onLogoutClick
}) {
  const { userProfile } = useAppStore();
  const [currentColorPage, setCurrentColorPage] = useState(0);
  
  const COLORS_PER_PAGE = 8;
  const totalPages = Math.ceil(ACCENT_OPTIONS.length / COLORS_PER_PAGE);
  const startIndex = currentColorPage * COLORS_PER_PAGE;
  const endIndex = startIndex + COLORS_PER_PAGE;
  const currentColors = ACCENT_OPTIONS.slice(startIndex, endIndex);

  const ThemeButton = ({ value, icon, label }) => {
    const Icon = icon;
    const active = theme === value;
    return (
      <button
        onClick={() => setTheme(value)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
          ${active
            ? 'bg-accent text-bg-secondary border-transparent shadow-md'
            : 'border-[--glass-border] text-text-secondary hover:bg-accent-transparent hover:text-accent'}`}
        aria-pressed={active}
      >
        <Icon size={18} />
        <span className="text-sm font-medium">{label}</span>
      </button>
    );
  };

  const AccentSwatch = ({ option }) => {
    const selected = accent === option.id;
    return (
      <button
        onClick={() => setAccent(option.id)}
        className={`group relative flex flex-col items-center gap-2`}
        aria-pressed={selected}
        title={option.label}
      >
        <span
          className="w-10 h-10 rounded-full border transition-transform group-hover:scale-105"
          style={{
            backgroundColor: option.hex,
            borderColor: selected ? option.hex : 'rgba(255,255,255,0.15)',
            boxShadow: selected ? `0 0 0 4px ${option.hex}33` : 'none'
          }}
        />
        <span className={`text-xs ${selected ? 'text-text-primary' : 'text-text-secondary'}`}>
          {option.label}
        </span>
        {selected && (
          <span className="absolute -top-1 -right-1 bg-bg-secondary rounded-full p-1 shadow">
            <Check size={14} />
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setView('dashboard')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-[--glass-border] text-text-secondary hover:text-text-primary hover:bg-accent-transparent transition"
        >
          <ChevronLeft size={18} />
          <span className="text-sm font-medium">Volver</span>
        </button>

        <h1 className="text-xl md:text-2xl font-bold">Ajustes</h1>

        <div className="w-[90px]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-2xl border border-[--glass-border] bg-[--glass-bg] backdrop-blur-glass p-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={18} className="text-accent" />
            <h2 className="text-lg font-semibold">Personalización</h2>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-text-secondary mb-3">Tema</h3>
            <div className="flex flex-wrap gap-3">
              <ThemeButton value="system" icon={MonitorCog} label="Sistema" />
              <ThemeButton value="light"  icon={Sun}        label="Claro" />
              <ThemeButton value="dark"   icon={Moon}       label="Oscuro" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-3">Color de la app</h3>
            <p className="text-xs text-text-muted mb-4">
              Cambia solo los elementos que usan el color de acento.
            </p>
            
            {/* Grid de colores con paginación */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 mb-4">
              {currentColors.map(opt => (
                <AccentSwatch key={opt.id} option={opt} />
              ))}
            </div>
            
            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentColorPage(prev => Math.max(0, prev - 1))}
                  disabled={currentColorPage === 0}
                  className="p-2 rounded-lg border border-[--glass-border] text-text-secondary hover:text-text-primary hover:bg-accent-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <span className="text-sm text-text-secondary px-3">
                  {currentColorPage + 1} de {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentColorPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentColorPage === totalPages - 1}
                  className="p-2 rounded-lg border border-[--glass-border] text-text-secondary hover:text-text-primary hover:bg-accent-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </section>

        <aside className="rounded-2xl border border-[--glass-border] bg-[--glass-bg] backdrop-blur-glass p-5 flex flex-col gap-3">
          <h2 className="text-lg font-semibold mb-1">Cuenta</h2>

          <button
            onClick={() => setView('profileEditor')}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-[--glass-border] text-left hover:bg-accent-transparent transition"
          >
            <User size={18} className="text-accent" />
            <div>
              <div className="text-sm font-semibold">Editar perfil</div>
              <div className="text-xs text-text-secondary">Nombre, objetivos, etc.</div>
            </div>
          </button>

          <button
            onClick={() => setView('accountEditor')}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-[--glass-border] text-left hover:bg-accent-transparent transition"
          >
            <UserCog size={18} className="text-accent" />
            <div>
              <div className="text-sm font-semibold">Seguridad y cuenta</div>
              <div className="text-xs text-text-secondary">Email, contraseña</div>
            </div>
          </button>

          {userProfile?.role === 'admin' && (
            <button
              onClick={() => setView('adminPanel')}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-[--glass-border] text-left hover:bg-accent-transparent transition"
            >
              <Shield size={18} className="text-accent" />
              <div>
                <div className="text-sm font-semibold">Panel de administración</div>
                <div className="text-xs text-text-secondary">Gestión avanzada</div>
              </div>
            </button>
          )}

          <div className="h-px bg-[--glass-border] my-1" />

          <button
            onClick={onLogoutClick}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-accent text-bg-secondary font-semibold hover:opacity-95 transition"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </aside>

        <aside className="lg:hidden rounded-2xl border border-[--glass-border] bg-[--glass-bg] backdrop-blur-glass p-5 flex flex-col gap-3">
          <h2 className="text-lg font-semibold mb-1">Información</h2>

          <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-[--glass-border]">
            <Info size={18} className="text-accent" />
            <div>
              <div className="text-sm font-semibold">Información de la aplicación</div>
              <div className="text-xs text-text-secondary">Versión {APP_VERSION}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}