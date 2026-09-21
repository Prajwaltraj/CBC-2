/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'nav': '1200px',
      },
      colors: {
        cyber: {
          bg: '#010103',
          cyan: '#00F3FF',
          magenta: '#A855F7', // Renamed to magenta to preserve references, but using neon purple hex
          white: '#F0F0F0'
        }
      },
      fontFamily: {
        sans: ['Orbitron', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-100% / 3))' }
        }
      },
      animation: {
        'marquee-fast': 'marquee 20s linear infinite',
      }
    },
  },
  plugins: [],
}
