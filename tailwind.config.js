/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#e63946",
        secondary: "#f1faee",
        accent: "#a8dadc",
        "text-primary": "#1d3557",
        "text-secondary": "#457b9d",
        "accent-light": "#bde0fe",
        "primary-light": "#fca3a5",
        "yellow-200": "#fef08a",
        "yellow-700": "#b45309",
        "gray-100": "#f3f4f6",
        "gray-500": "#6b7280",
        "delicia-red": "#dc2626", // Cor vermelha específica
        brown: {
          // Adicionando uma paleta de marrons
          50: "#f8f4f0",
          100: "#e8ddd4",
          200: "#d1c1b4",
          300: "#b8a494",
          400: "#9f8774",
          500: "#866a54",
          600: "#6c5340",
          700: "#523c2c",
          800: "#382518",
          900: "#1e0e04",
        },
      },
      fontFamily: {
        heading: ["Montserrat", "sans-serif"],
        body: ["Open Sans", "sans-serif"],
        script: ["Pacifico", "cursive"], // Fonte script
        // Adicione outras fontes aqui se desejar
      },
    },
  },
  plugins: [],
};
