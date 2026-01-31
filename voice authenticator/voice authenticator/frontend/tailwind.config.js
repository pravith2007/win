/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This scans all files in your src folder
  ],
  theme: {
    extend: {
      // You can add custom medical-themed colors here if you want
    },
  },
  plugins: [],
}