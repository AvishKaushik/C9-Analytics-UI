/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'c9-blue': '#3eaff0',
        'c9-accent': '#e8f7fe',
      }
    },
  },
  plugins: [],
}
