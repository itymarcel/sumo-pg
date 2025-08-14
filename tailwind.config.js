/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
        libertinus: ['Libertinus Sans', 'serif'],
      },
      transitionTimingFunction: {
        'super-ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      colors: {
        'sumo-orange': 'rgba(255, 95, 66, 1)',
        'sumo-purple': 'rgba(57, 17, 100, 1)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      }
      addUtilities(newUtilities)
    }
  ],
}