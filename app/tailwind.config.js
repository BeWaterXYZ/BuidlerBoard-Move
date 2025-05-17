/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        night: "#0F1114",
        day: "#00FFFF",
        grey: {
          400: "#F8FAFC",
          500: "#64748B"
        }
      },
      fontFamily: {
        secondary: ["var(--font-secondary)", "sans-serif"],
      }
    },
  },
  plugins: [],
} 