import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StarRating } from "@/components/StarRating";
import { CATEGORIES } from "@/lib/data";
import { createSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 0;

type Resena = {
  id: string;
  estrellas: number;
  comentario: string | null;
  creado_at: string;
};

export default async function TecnicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const { data: perfil } = await supabase
    .from("perfiles_publicos")
    .select("user_id, nombre, zona, rubro, verificado")
    .eq("user_id", id)
    .maybeSingle();

  if (!perfil) notFound();

  const [{ data: resumen }, { data: resenas }, { count: completados }] = await Promise.all([
    supabase.from("resenas_resumen").select("promedio, total").eq("tecnico_id", id).maybeSingle(),
    supabase.from("resenas").select("id, estrellas, comentario, creado_at").eq("tecnico_id", id).order("creado_at", { ascending: false }),
    supabase.from("propuestas").select("id", { count: "exact", head: true }).eq("profesional_id", id).eq("estado", "completada"),
  ]);

  const nombre = perfil.nombre ?? "Profesional";
  const initials = nombre.split(" ").filter(Boolean).map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const rubroNombre = CATEGORIES.find((c) => c.slug === perfil.rubro)?.name ?? perfil.rubro;
  const promedio = resumen ? Number(resumen.promedio) : 0;
  const total = resumen ? Number(resumen.total) : 0;
  const lista = (resenas ?? []) as Resena[];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f5fdf9]">
        {/* Encabezado */}
        <section className="border-b border-ink-100 bg-white">
          <div className="container-pad py-10">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sv-dark to-sv-primary font-display text-2xl font-semibold text-white">
                {initials}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="display text-3xl text-sv-dark">{nombre}</h1>
                  {perfil.verificado && (
                    <span className="rounded-full bg-sv-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-sv-olive">
                      ✓ Verificado
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
                  {total > 0 ? (
                    <StarRating rating={promedio} reviews={total} size="md" />
                  ) : (
                    <span className="text-ink-400">Sin reseñas aún</span>
                  )}
                  {rubroNombre && <span>🔧 {rubroNombre}</span>}
                  {perfil.zona && <span>📍 {perfil.zona}</span>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:max-w-md">
              <div className="card p-4">
                <div className="text-xs uppercase tracking-wider text-ink-500">Trabajos completados</div>
                <div className="display mt-1 text-2xl">{completados ?? 0}</div>
              </div>
              <div className="card p-4">
                <div className="text-xs uppercase tracking-wider text-ink-500">Calificación</div>
                <div className="display mt-1 text-2xl">{total > 0 ? promedio.toFixed(2) : "—"}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Reseñas */}
        <section className="container-pad py-10">
          <h2 className="display text-2xl text-sv-dark">
            Reseñas {total > 0 && <span className="text-ink-400">({total})</span>}
          </h2>

          {lista.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-ink-200 p-10 text-center text-ink-400">
              Todavía no tiene reseñas. ¡Sé el primero en calificarlo después de un trabajo!
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {lista.map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-sv-dark">Cliente verificado</span>
                    <StarRating rating={r.estrellas} />
                  </div>
                  {r.comentario && <p className="mt-2 text-sm text-ink-700">{r.comentario}</p>}
                  <p className="mt-2 text-[11.5px] text-ink-400">
                    {new Date(r.creado_at).toLocaleDateString("es-AR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
