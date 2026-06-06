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
          DEFAULT: '#070709',
          light: '#0d0d12',
          card: '#121217',
          border: '#1c1c24',
        },
        gold: {
          light: '#f6e6dc',
          DEFAULT: '#dca587',
          dark: '#b57756',
          cream: '#fdf9f6',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Outfit"', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #b57756 0%, #dca587 50%, #f6e6dc 100%)',
        'dark-gradient': 'linear-gradient(180deg, #121217 0%, #070709 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(220, 165, 135, 0.15)',
        'gold-glow-lg': '0 0 25px rgba(220, 165, 135, 0.25)',
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
