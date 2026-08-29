import type { MetadataRoute } from "next";

// Manifest PWA (Android/Chrome instalable + display standalone).
// En iOS el ícono de inicio lo maneja apple-icon.tsx + appleWebApp (layout).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sufix",
    short_name: "Sufix",
    description: "Soluciones para tu hogar en Buenos Aires",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF8EF",
    theme_color: "#4E7A3E",
    icons: [
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
