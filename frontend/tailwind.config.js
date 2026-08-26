/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ghost: {
          bg: "#0f1117",
          panel: "#161923",
          accent: "#7c5cff",
        },
      },
    },
  },
  plugins: [],
};
