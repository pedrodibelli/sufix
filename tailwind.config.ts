import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neutrales para texto y fondos neutros
        ink: {
          50: "#f6f7f5",
          100: "#e8eae5",
          200: "#cfd3ca",
          300: "#a9b1a1",
          400: "#7c8773",
          500: "#5b6753",
          600: "#475141",
          700: "#3a4135",
          800: "#30362d",
          900: "#1e221c",
          950: "#0e110d",
        },
        // Paleta de marca Sufix (informe de diseño)
        sv: {
          mint: "#99DDC8",      // Fondos y respiración visual
          light: "#95BF74",     // Elementos amigables
          primary: "#659B5E",   // Botones y acciones
          olive: "#556F44",     // Títulos y navegación
          dark: "#283F3B",      // Branding y confianza
        },
        // Escala extendida para componentes (estados, badges, etc.)
        brand: {
          50: "#f0f7ee",
          100: "#d5edda",
          200: "#add9b5",
          300: "#95BF74",
          400: "#7aac60",
          500: "#659B5E",
          600: "#556F44",
          700: "#445937",
          800: "#364829",
          900: "#283F3B",
          950: "#1a2b27",
        },
        // Mint como escala para acentos y highlights
        zap: {
          DEFAULT: "#99DDC8",
          50: "#f0faf7",
          100: "#d5f0e7",
          200: "#aadfd0",
          300: "#99DDC8",
          400: "#75c9af",
          500: "#4dab8e",
          600: "#3a8a71",
          700: "#2e6e5a",
          800: "#255847",
          900: "#1c4537",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        jakarta: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
        "3xl": "28px",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(40,63,59,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(40,63,59,0.05) 1px, transparent 1px)",
        "dot-pattern":
          "radial-gradient(rgba(40,63,59,0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "32px 32px",
        dots: "18px 18px",
      },
    },
  },
  plugins: [],
} satisfies Config;
