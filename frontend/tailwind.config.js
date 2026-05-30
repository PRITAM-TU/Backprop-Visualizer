/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#0d0f1a',
          secondary: '#12152b',
          card:      '#161a30',
          border:    '#252a4a',
        },
        accent: {
          blue:   '#6366f1',
          purple: '#8b5cf6',
          pink:   '#ec4899',
          cyan:   '#22d3ee',
          green:  '#10b981',
          orange: '#f97316',
          red:    '#ef4444',
          yellow: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        glow:        '0 0 20px rgba(99,102,241,0.4)',
        'glow-lg':   '0 0 40px rgba(99,102,241,0.5)',
        'glow-cyan': '0 0 20px rgba(34,211,238,0.4)',
        'glow-green':'0 0 20px rgba(16,185,129,0.4)',
        'glow-red':  '0 0 20px rgba(239,68,68,0.4)',
        'glow-orange':'0 0 20px rgba(249,115,22,0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
