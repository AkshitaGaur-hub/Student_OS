/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FAF5F8',
          100: '#F3E8EF',
          200: '#E6D2E0',
          300: '#D1B0C7',
          400: '#A47597',
          500: '#8A5C7E',
          600: '#714B67', // Main Plum #714B67
          700: '#5C3C54',
          800: '#4A2F43',
          900: '#382233',
        },
        brand: {
          50: '#FAF5F8',
          100: '#F3E8EF',
          200: '#E6D2E0',
          300: '#D1B0C7',
          400: '#A47597',
          500: '#8A5C7E',
          600: '#714B67',
          700: '#5C3C54',
          800: '#4A2F43',
          900: '#382233',
        },
        sky: {
          50: '#FAF5F8',
          100: '#F3E8EF',
          200: '#E6D2E0',
          300: '#D1B0C7',
          400: '#A47597',
          500: '#8A5C7E',
          600: '#714B67',
          700: '#5C3C54',
          800: '#4A2F43',
          900: '#382233',
        },
      },
    },
  },
  plugins: [],
};
