/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'accent': 'var(--color-accent)',
        'accent-transparent': 'var(--color-accent-transparent)',
        'accent-border': 'var(--color-accent-border)',
        'green': 'var(--color-green)',
        'red': 'var(--color-red)',
        'neutral': 'var(--color-neutral)',
        'glass-border': 'var(--glass-border)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
      },
      backdropBlur: {
        'glass': '12px',
      },
      keyframes: {
        'roam-blob': {
          '0%': { transform: 'translate(-50%, -50%) scale(1)' },
          '25%': { transform: 'translate(50%, -80%) scale(0.8)' },
          '50%': { transform: 'translate(80%, 80%) scale(1.2)' },
          '75%': { transform: 'translate(-80%, 50%) scale(0.9)' },
          '100%': { transform: 'translate(-50%, -50%) scale(1)' },
        },
        'fade-in-up': {
            '0%': { opacity: '0', transform: 'translateY(10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-in': {
          'from': { transform: 'translateX(100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        'toast-out': {
          'from': { transform: 'translateX(0)', opacity: '1' },
          'to': { transform: 'translateX(100%)', opacity: '0' },
        }
      },
      animation: {
        'roam-blob': 'roam-blob 40s infinite ease-in-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'toast-in': 'toast-in 0.5s ease-out forwards',
        'toast-out': 'toast-out 0.5s ease-out forwards',
      }
    },
  },
  plugins: [],
}