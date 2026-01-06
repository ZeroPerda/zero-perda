/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          DEFAULT: '#52525b', // Zinc-600 (Borders)
          active: '#e4e4e7', // Zinc-200 (Active elements)
          red: '#ef4444', // Red-500
          yellow: '#fbbf24', // Amber-400
          bg: '#09090b', // Zinc-950 (Deep background)
          surface: '#18181b', // Zinc-900 (Cards)
        }
      },
      boxShadow: {
        'industrial': '4px 4px 0px 0px #000000',
        'industrial-sm': '2px 2px 0px 0px #000000',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['monospace'], // Simple mono stack for data
      },
    },
  },
  plugins: [],
}
