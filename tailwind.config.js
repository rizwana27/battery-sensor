/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        ev: {
          bg:     'rgb(var(--ev-bg) / <alpha-value>)',
          panel:  'rgb(var(--ev-panel) / <alpha-value>)',
          border: 'rgb(var(--ev-border) / <alpha-value>)',
          accent: 'rgb(var(--ev-accent) / <alpha-value>)',
          green:  'rgb(var(--ev-green) / <alpha-value>)',
          amber:  'rgb(var(--ev-amber) / <alpha-value>)',
          red:    'rgb(var(--ev-red) / <alpha-value>)',
          muted:  'rgb(var(--ev-muted) / <alpha-value>)',
          text:   'rgb(var(--ev-text) / <alpha-value>)',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
