import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TecnicosGrid } from "@/components/TecnicosGrid";
import { type TecnicoPublico } from "@/components/TecnicoCard";
import { categoryBySlug } from "@/lib/data";
import { createSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 0; // siempre datos frescos, se actualiza solo con cada técnico nuevo

// Reescrita 2026-08-29: esta página era la vieja versión pre-pivot (con
// botón "Publicar problema de..." y PROS/ServiceCard hardcodeados de
// mentira, ver git history) — quedó colgando de antes del pivot al
// directorio de técnicos y nadie la había limpiado. Ahora muestra
// técnicos reales de ese rubro (mismo fetch que la home, filtrado por
// categoría del lado del servidor), nada inventado.
export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = categoryBySlug(slug);
  if (!cat) notFound();

  const supabase = await createSupabaseServer();
  const { data: tecnicosRaw } = await supabase
    .from("perfiles_publicos")
    .select("user_id, nombre, zona, rubro, verificado, foto_url, telefono, titular, creado_at")
    .contains("rubro", [slug])
    .not("telefono", "is", null)
    .order("creado_at", { ascending: false });

  const tecnicos = (tecnicosRaw ?? []) as TecnicoPublico[];
  const tecnicoIds = tecnicos.map((t) => t.user_id);
  const { data: resumenRows } = tecnicoIds.length > 0
    ? await supabase.from("resenas_resumen").select("tecnico_id, promedio, total").in("tecnico_id", tecnicoIds)
    : { data: [] as { tecnico_id: string; promedio: number; total: number }[] };
  const resumenMap = Object.fromEntries(
    (resumenRows ?? []).map((r) => [r.tecnico_id, { promedio: Number(r.promedio), total: Number(r.total) }])
  );

  // Mismo orden que la home: mejor calificación primero, sin reseñas = -1.
  const tecnicosOrdenados = [...tecnicos].sort((a, b) => {
    const ra = resumenMap[a.user_id];
    const rb = resumenMap[b.user_id];
    const pa = ra && ra.total > 0 ? ra.promedio : -1;
    const pb = rb && rb.total > 0 ? rb.promedio : -1;
    if (pb !== pa) return pb - pa;
    return new Date(b.creado_at ?? 0).getTime() - new Date(a.creado_at ?? 0).getTime();
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FBF8EF]">
        <section className={`border-b border-ink-100 bg-gradient-to-br ${cat.accent}`}>
          <div className="container-home py-14">
            <Link href="/#tecnicos" className="text-xs text-ink-600 hover:text-ink-900">
              ← Todos los técnicos
            </Link>
            <div className="mt-4">
              <div className="text-5xl">{cat.icon}</div>
              <h1 className="display mt-3 text-4xl text-sv-dark md:text-5xl">{cat.name}</h1>
              <p className="mt-2 max-w-xl text-ink-700">{cat.blurb}</p>
            </div>
            <p className="mt-6 text-sm font-medium text-ink-600">
              {tecnicos.length} {tecnicos.length === 1 ? "técnico verificado" : "técnicos verificados"} de {cat.name.toLowerCase()}
            </p>
          </div>
        </section>

        <section className="container-home py-12">
          <TecnicosGrid tecnicos={tecnicosOrdenados} resumenMap={resumenMap} />
        </section>
      </main>
      <Footer />
    </>
  );
}
