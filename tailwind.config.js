// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        surface: {
          900: 'rgb(var(--s900) / <alpha-value>)',
          800: 'rgb(var(--s800) / <alpha-value>)',
          700: 'rgb(var(--s700) / <alpha-value>)',
          600: 'rgb(var(--s600) / <alpha-value>)',
          500: 'rgb(var(--s500) / <alpha-value>)',
        },
        accent: {
          blue: '#4f8ef7',
          green: '#22d3a0',
          red: '#f7596f',
          yellow: '#f7c948',
          purple: '#a78bfa',
        },
      },
    },
  },
  plugins: [],
}
