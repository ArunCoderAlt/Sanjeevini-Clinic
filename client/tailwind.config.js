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
          50: '#F0F7F3',
          100: '#DFEFE6',
          200: '#BFDFCD',
          300: '#94CBB0',
          400: '#5BAF8B',
          500: '#2E7D5B',
          600: '#1B5E3B',
          700: '#164E31',
          800: '#123E27',
          900: '#0C2B1B',
          DEFAULT: '#1B5E3B',
          light: '#2a8b58',
          dark: '#123e27'
        },
        secondary: '#2E7D5B',
        sage: '#EAF4EE',
        cream: '#F8F5EC',
        gold: '#C9A227',
        dark: '#17221C'
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
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(27, 94, 59, 0.4)' },
          '50%': { opacity: '.8', boxShadow: '0 0 0 10px rgba(27, 94, 59, 0)' }
        }
      }
    },
  },
  plugins: [],
}
