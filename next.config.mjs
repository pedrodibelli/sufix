/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "hfpdlpcjfjxxgpetaxmn.supabase.co" },
    ],
  },

  // Páginas del modelo viejo (2026-09-04). Ningún link de la navegación lleva
  // a ellas, pero respondían 200 por URL y Google las puede indexar. /buscar
  // era lo peor: ofrecía "Top Pro", "Matriculado" y "Garantía incluida", cosas
  // que Sufix no da, y sus botones llevaban a /publicar.
  //
  // /publicar es el caso más serio y por eso también entra acá: seguía
  // insertando en `publicaciones` (que ya ninguna pantalla muestra) y ese
  // INSERT dispara el webhook aviso-publicacion, o sea mails a los técnicos
  // sobre un trabajo que nadie puede ver. Redirigir corta eso.
  //
  // permanent: false (307) a propósito: no se borró nada de ese código y el
  // pivot es reversible (ver CLAUDE.md y el tag idea-publicar-problema-2026-08-20).
  // Un 308 quedaría cacheado en los navegadores y costaría revertirlo.
  async redirects() {
    return [
      { source: "/buscar", destination: "/", permanent: false },
      { source: "/oferentes", destination: "/registrar", permanent: false },
      // Los slugs de /servicio son de SERVICIO, no de categoría, así que no se
      // pueden mapear uno a uno a /categoria/:slug — irían a 404.
      { source: "/servicio/:slug", destination: "/categorias", permanent: false },
      { source: "/profesional/:slug", destination: "/", permanent: false },
      { source: "/publicar", destination: "/", permanent: false },
      { source: "/publicar/:path*", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
