/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f4f7ff',
          100: '#e8eeff',
          200: '#d1deff',
          300: '#a6c2ff',
          400: '#709eff',
          500: '#347bff',
          600: '#1555ff',
          700: '#0041eb',
          800: '#0035c3',
          900: '#002e99',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae6ff',
          200: '#f5ceff',
          300: '#eba7ff',
          400: '#db74ff',
          500: '#c741ff',
          600: '#b020f3',
          700: '#9314cc',
          800: '#7814a5',
          900: '#611583',
        },
        accent: {
          50: '#fff8f1',
          100: '#ffedd5',
          200: '#ffd6aa',
          300: '#ffb870',
          400: '#ff9136',
          500: '#ff7a0d',
          600: '#ff6600',
          700: '#cc4e00',
          800: '#a33e00',
          900: '#853400',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cabinet Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
} 