import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/data";
import { APP_URL as BASE } from "@/lib/appUrl";
import { createSupabaseServer } from "@/lib/supabase-server";

// Se regenera cada hora: los técnicos nuevos no son tan frecuentes como para
// consultar la base en cada pedido del sitemap, pero sí lo bastante como para
// que un sitemap congelado al build quede viejo enseguida.
export const revalidate = 3600;

// Sitemap (2026-09-20). No había ninguno, y desde este rediseño hace más
// falta que antes: la home y /categoria ahora muestran 12 técnicos por tanda
// en vez de 100, o sea que el resto de los 620 perfiles ya no está linkeado
// en el HTML que ve un buscador. Sin sitemap, Google no tendría cómo llegar
// a /tecnico/[id] salvo por los pocos que caen en la primera tanda.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const estaticas: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/categorias`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/como-funciona`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/terminos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categorias: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${BASE}/categoria/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Mismos criterios que usa la home para decidir quién es público (ver
  // app/page.tsx): verificado por nosotros, o cargado por el equipo, y con
  // rubro y teléfono. Un perfil que la web no muestra tampoco va al sitemap.
  let tecnicos: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createSupabaseServer();
    const { data } = await supabase
      .from("perfiles_publicos")
      .select("user_id, creado_at")
      .or("verificado.eq.true,cargado_por_equipo.eq.true")
      .not("rubro", "is", null)
      .not("telefono", "is", null);

    tecnicos = (data ?? []).map((t: { user_id: string; creado_at: string | null }) => ({
      url: `${BASE}/tecnico/${t.user_id}`,
      lastModified: t.creado_at ? new Date(t.creado_at) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // Un sitemap con las rutas fijas sirve; uno que tira 500 no sirve para
    // nada. Si la base no contesta, se devuelve lo que sí tenemos.
  }

  return [...estaticas, ...categorias, ...tecnicos];
}
