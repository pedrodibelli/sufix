import type { MetadataRoute } from "next";

// Manifest PWA (Android/Chrome instalable + display standalone).
// En iOS el ícono de inicio lo maneja apple-icon.tsx + appleWebApp (layout).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SolvIT",
    short_name: "SolvIT",
    description: "Soluciones para tu hogar en Buenos Aires",
    start_url: "/",
    display: "standalone",
    background_color: "#f5fdf9",
    theme_color: "#3d9b5e",
    icons: [
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
