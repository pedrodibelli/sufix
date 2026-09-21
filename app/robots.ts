import type { MetadataRoute } from "next";
import { APP_URL as BASE } from "@/lib/appUrl";

// robots.txt (2026-09-20). Antes no existía, así que Google no tenía de dónde
// sacar el sitemap salvo que se lo cargara a mano en Search Console.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nada de esto le sirve a un buscador y varias exigen sesión: son
      // pantallas privadas o de trámite, no contenido.
      disallow: ["/admin", "/api/", "/perfil", "/mis-consultas", "/restablecer", "/auth/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
