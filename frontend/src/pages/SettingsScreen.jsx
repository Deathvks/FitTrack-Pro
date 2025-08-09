import React from 'react';
import { ChevronLeft, Check, Palette, Sun, Moon, MonitorCog, User, UserCog, Shield, LogOut } from 'lucide-react';
import useAppStore from '../store/useAppStore';

const ACCENT_OPTIONS = [
  { id: 'green',  label: 'Verde',    hex: '#22c55e' },
  { id: 'blue',   label: 'Azul',     hex: '#3b82f6' },
  { id: 'violet', label: 'Violeta',  hex: '#8b5cf6' },
  { id: 'amber',  label: 'Ámbar',    hex: '#f59e0b' },
  { id: 'rose',   label: 'Rosa',     hex: '#f43f5e' },
  { id: 'teal',   label: 'Turquesa', hex: '#14b8a6' },
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
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {ACCENT_OPTIONS.map(opt => (
                <AccentSwatch key={opt.id} option={opt} />
              ))}
            </div>
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

          <div className="md:hidden text-center text-xs text-text-muted mt-4">
            v2.1.0
          </div>
        </aside>
      </div>
    </div>
  );
}