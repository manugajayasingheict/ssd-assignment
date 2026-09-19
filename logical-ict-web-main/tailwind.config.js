/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0A3D62',
        'navy-dark': '#1E3A8A',
        orange: '#FF8C00',
        'orange-bright': '#FFA500',
      }
    },
  },
  plugins: [],
}