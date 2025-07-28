/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'orange-primary': '#F28C38',
        'orange-secondary': '#F5A623',
        'gray-light': '#F5F5F5',
        'gray-dark': '#333333',
      },
    },
  },
  plugins: [],
}