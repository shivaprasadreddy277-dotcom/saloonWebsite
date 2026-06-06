/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          DEFAULT: '#0D0D0D',
          light: '#12122A',
          card: '#1A1A2E',
          border: 'rgba(212, 175, 55, 0.15)',
          sidebar: '#0F0F23',
          input: '#1E1E3A',
        },
        gold: {
          light: '#F5F5F5',
          DEFAULT: '#D4AF37',
          hover: '#FFD700',
          secondary: '#F5A623',
          silver: '#A8A8B3',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F5A623 100%)',
        'dark-gradient': 'linear-gradient(180deg, #12122A 0%, #0D0D0D 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.15)',
        'gold-glow-lg': '0 0 30px rgba(212, 175, 55, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
