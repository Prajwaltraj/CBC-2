/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
      }
    },
  },
  plugins: [],
}
