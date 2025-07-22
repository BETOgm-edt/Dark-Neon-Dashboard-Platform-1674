/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          green: '#39FF14',
          dark: '#1a1a1a',
          darker: '#0a0a0a',
          gray: '#2a2a2a',
          light: '#3a3a3a'
        }
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif']
      },
      boxShadow: {
        'neon': '0 0 20px rgba(57,255,20,0.4)',
        'neon-lg': '0 0 40px rgba(57,255,20,0.6)',
        'glass': '0 8px 32px 0 rgba(31,38,135,0.37)'
      },
      backdropBlur: {
        'xs': '2px'
      },
      width: {
        '70': '17.5rem'
      },
      animation: {
        'pulse-neon': 'neonPulse 2s ease-in-out infinite',
        'glow': 'neonGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient': 'gradientShift 3s ease infinite'
      }
    },
  },
  plugins: [],
}