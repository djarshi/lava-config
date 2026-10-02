/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        lava: {
          orange: '#ff6b35',
          'orange-dim': '#b04a23',
          bg: '#1a1d21',
          panel: '#212529',
          border: '#34383c',
        },
      },
      fontFamily: {
        mono: ['"Fira Code"', 'Consolas', '"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
};