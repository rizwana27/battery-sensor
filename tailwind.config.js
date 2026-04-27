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
          bg: '#0a0e1a',
          panel: '#0f1629',
          border: '#1e2d4a',
          accent: '#00d4ff',
          green: '#00ff88',
          amber: '#ffaa00',
          red: '#ff3d5a',
          muted: '#4a6080',
          text: '#c8d8f0',
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
