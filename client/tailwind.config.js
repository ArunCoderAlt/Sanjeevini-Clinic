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
          50: '#F0F7FD',
          100: '#E0EFFB',
          200: '#BCE0F7',
          300: '#87C7F1',
          400: '#3A96D4',
          500: '#1A6DA8',
          600: '#144979',
          700: '#0C2B4B',
          800: '#081D33',
          900: '#05121F',
          DEFAULT: '#144979',
          light: '#1D62A1',
          dark: '#081D33'
        },
        secondary: '#0C2B4B',
        sage: '#E3EFF9',
        cream: '#EEF6FD',
        gold: '#0284C7',
        dark: '#07192C'
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'sans-serif']
      },
      animation: {
        fadeUp: 'fadeUp 0.6s ease-out forwards',
        fadeDown: 'fadeDown 0.6s ease-out forwards',
        slideLeft: 'slideLeft 0.6s ease-out forwards',
        slideRight: 'slideRight 0.6s ease-out forwards',
        scaleIn: 'scaleIn 0.4s ease-out forwards',
        float: 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(20, 73, 121, 0.4)' },
          '50%': { opacity: '.8', boxShadow: '0 0 0 10px rgba(20, 73, 121, 0)' }
        }
      }
    },
  },
  plugins: [],
}
