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
          DEFAULT: '#020408',
          paper: '#080C14',
          subtle: '#0F1623',
        },
        primary: {
          DEFAULT: '#00F0FF',
          dim: '#005F66',
        },
        status: {
          safe: '#00F0FF',
          warning: '#FFB800',
          danger: '#FF2E2E',
          neutral: '#8890A0',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#475569',
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
        'neon': '0 0 15px rgba(0, 240, 255, 0.15)',
        'deep': '0 10px 40px -10px rgba(0,0,0,0.8)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}