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
          400: '#4AA8E4',
          500: '#228DD2',
          600: '#1880B8',
          700: '#1A4B75',
          800: '#143B5C',
          900: '#0E2940',
          DEFAULT: '#1880B8',
          light: '#2596D1',
          dark: '#143B5C'
        },
        secondary: '#1A4B75',
        sage: '#EBF4FB',
        cream: '#F8FAFD',
        gold: '#0284C7',
        dark: '#0B1E32'
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
