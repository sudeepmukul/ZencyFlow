/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          DEFAULT: '#fbff00',
          50: '#feffcc',
          100: '#fdff99',
          200: '#fcff66',
          300: '#fbff33',
          400: '#fbff00',
          500: '#c7cc00',
          600: '#949900',
          700: '#626600',
          800: '#313300',
          900: '#000000',
        },
        zinc: {
          950: '#09090b', // Darker background
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
