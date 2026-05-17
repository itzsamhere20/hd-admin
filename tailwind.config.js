/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        luxury: ['"Playfair Display"', "serif"],
        cormorant: ['"Cormorant"', "serif"],
      },
      colors: {
        primary: "#A68A3C",
      },
    },
  },
  plugins: [],
};
