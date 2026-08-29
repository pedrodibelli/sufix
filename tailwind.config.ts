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
        // Paleta de marca Sufix (rediseño 2026-08-28: landing "crema/salvia"
        // que armó el equipo de la facu, adoptada para toda la app — pidió
        // sacar el tema oscuro del técnico y unificar todo en un look claro).
        // Se mantienen los mismos NOMBRES de token (sv.primary, sv.olive,
        // sv.dark, zap.*) para no tener que tocar cada className del código
        // — solo cambian los valores hex, y el resto de la app hereda el
        // look nuevo solo.
        sv: {
          mint: "#EEF1E5",      // Fondos y respiración visual (antes sage-soft)
          light: "#E4EAD6",     // Elementos amigables (antes sage)
          primary: "#4E7A3E",   // Botones y acciones (antes verde marca)
          olive: "#3C6030",     // Títulos y navegación (verde oscuro)
          dark: "#1D2E20",      // Branding y confianza (texto principal)
        },
        // Escala extendida para componentes (estados, badges, etc.)
        brand: {
          50: "#f2f6ee",
          100: "#e4ead6",
          200: "#c9d6b0",
          300: "#a8c187",
          400: "#6d9856",
          500: "#4E7A3E",
          600: "#3C6030",
          700: "#2f4d27",
          800: "#263e20",
          900: "#1D2E20",
          950: "#131f16",
        },
        // Crema/salvia como escala para acentos y fondos suaves (reemplaza
        // el mint anterior — mismo rol, otra paleta).
        zap: {
          DEFAULT: "#EEF1E5",
          50: "#FBF8EF",
          100: "#F7F1E0",
          200: "#EEF1E5",
          300: "#E4EAD6",
          400: "#c7d4b3",
          500: "#a7bb8d",
          600: "#87a06c",
          700: "#6a8551",
          800: "#526a3d",
          900: "#3f532f",
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
