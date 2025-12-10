/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#FFFFFF',
          paper: '#F8F9FA',
          subtle: '#F0F1F3',
        },
        primary: {
          DEFAULT: '#51B0E6',
          dim: '#3A8FC4',
          light: '#7BC5EE',
        },
        secondary: {
          DEFAULT: '#A6A8AB',
          dark: '#7D7F82',
          light: '#C5C6C8',
        },
        status: {
          safe: '#51B0E6',
          warning: '#FFA726',
          danger: '#EF5350',
          neutral: '#A6A8AB',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#4A4A4A',
          muted: '#A6A8AB',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        body: ['Figtree', 'sans-serif'],
        mono: ['Chivo Mono', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(81, 176, 230, 0.3)',
        'deep': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}