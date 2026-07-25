/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // This tells Tailwind to listen to your ThemeToggle button
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  }