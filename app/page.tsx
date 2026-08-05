import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FilterDropdown } from "@/components/FilterDropdown";
import { MarketplaceGrid } from "@/components/MarketplaceGrid";
import { CATEGORIES, ZONES, type PostedJob } from "@/lib/data";
import { type Publicacion } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 0; // siempre datos frescos

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; zona?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.toLowerCase().trim() ?? "";
  const cat = params.cat ?? "";
  const zona = params.zona ?? "";

  // Rol del usuario actual
  const supabaseServer = await createSupabaseServer();
  const { data: { user } } = await supabaseServer.auth.getUser();
  const esProfesional = user?.user_metadata?.es_profesional === true;
  const sinSesion = !user;

  // Publicaciones de Supabase
  const { data: dbJobs } = await supabaseServer
    .from("publicaciones")
    .select("*")
    .neq("status", "cerrado")
    .order("created_at", { ascending: false });

  // Conteo real de propuestas por publicación (vista pública, no expone datos sensibles)
  const pubIds = (dbJobs ?? []).map((p: Publicacion) => p.id);
  const { data: bidCounts } = pubIds.length > 0
    ? await supabaseServer
        .from("propuestas_count_por_publicacion")
        .select("publicacion_id, total")
        .in("publicacion_id", pubIds)
    : { data: [] };
  const bidsMap: Record<string, number> = Object.fromEntries(
    (bidCounts ?? []).map((c: { publicacion_id: string; total: number }) => [c.publicacion_id, Number(c.total)])
  );

  // IDs de publicaciones del usuario actual
  const misPublicacionesIds = user
    ? (dbJobs ?? []).filter((p: Publicacion) => p.user_id === user.id).map((p: Publicacion) => p.id)
    : [];

  // Convertir al formato interno para filtrar igual que los estáticos
  const supabaseJobs: PostedJob[] = (dbJobs ?? []).map((p: Publicacion) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    categorySlug: p.category_slug,
    zone: p.zone,
    urgency: p.urgency as PostedJob["urgency"],
    photo: p.photo ?? null,
    photos: p.photos ?? [],
    postedBy: p.posted_by,
    postedAgo: "reciente",
    budget: { min: 0, max: 0 },
    bidsCount: bidsMap[p.id] ?? 0,
    status: p.status as PostedJob["status"],
  }));

  const allJobs = supabaseJobs;

  const filtered = allJobs.filter((j) => {
    if (cat && j.categorySlug !== cat) return false;
    if (zona && !j.zone.toLowerCase().includes(zona.toLowerCase())) return false;
    if (q) {
      const hay = `${j.title} ${j.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // IDs de publicaciones donde el profesional ya tiene propuesta pendiente o ya
  // avisó que quiere hacer el trabajo (flujo de contacto directo gratis).
  let yaContactadoIds: string[] = [];
  if (esProfesional && user) {
    const { data: propsPendientes } = await supabaseServer
      .from("propuestas")
      .select("publicacion_id")
      .eq("profesional_id", user.id)
      .in("estado", ["pendiente", "interesado"]);
    yaContactadoIds = (propsPendientes ?? []).map((p: { publicacion_id: string }) => p.publicacion_id);
  }

  const activeCount = (cat ? 1 : 0) + (zona ? 1 : 0);
  const supabaseJobIds = supabaseJobs.map((j) => j.id);

  // Pedidos URGENTES (hoy) del rubro del técnico, abiertos y sin propuesta suya
  const miCategoria = esProfesional ? (user?.user_metadata?.categoria as string | undefined) : undefined;
  const esUrgenteDeMiRubro = (j: PostedJob) =>
    j.urgency === "hoy" &&
    j.categorySlug === miCategoria &&
    j.status === "abierto" &&
    !yaContactadoIds.includes(j.id);
  const urgentesDeMiRubro = miCategoria ? allJobs.filter(esUrgenteDeMiRubro) : [];
  const rubroNombre = CATEGORIES.find((c) => c.slug === miCategoria)?.name;

  // Para el técnico, los urgentes de su rubro van primero en la grilla
  const jobsParaGrid = esProfesional
    ? [...filtered].sort((a, b) => Number(esUrgenteDeMiRubro(b)) - Number(esUrgenteDeMiRubro(a)))
    : filtered;

  return (
    <>
      <Header />
      <main className={`overflow-x-hidden ${esProfesional ? "bg-[#0e1a17]" : ""}`}>

        {/* Hero — solo para visitantes sin sesión */}
        {sinSesion && (
          <section className="border-b border-ink-100/60 bg-white py-14 sm:py-20 lg:py-28">
            <div className="container-pad">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="display text-4xl leading-[1.12] text-sv-dark sm:text-5xl lg:text-6xl">
                  Tu problema<br />tiene solución.
                </h1>
                <p className="mt-4 text-base leading-relaxed text-ink-500 sm:text-lg lg:text-xl">
                  Describí lo que necesitás. Técnicos certificados te contactan
                  por WhatsApp en minutos — gratis por lanzamiento.
                </p>
                <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
                  <Link href="/publicar" className="btn-primary w-full py-4 text-base sm:w-auto sm:px-10">
                    Publicar mi problema
                  </Link>
                  <Link href="/registrar" className="btn-ghost w-full py-4 text-base text-ink-500 sm:w-auto sm:px-10">
                    Soy técnico, quiero trabajar →
                  </Link>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-400">
                  <span>✓ Gratis por lanzamiento</span>
                  <span>✓ Técnicos verificados</span>
                  <span>✓ Respuesta en minutos</span>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="min-h-screen py-10">
          <div className="container-pad">

            {/* Intro */}
            <div className="mb-8">
              <div className={`flex items-center gap-2 text-xs ${esProfesional ? "text-zap-500" : "text-ink-400"}`}>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sv-primary" />
                <span className="font-medium uppercase tracking-widest">En vivo</span>
              </div>
              <h1 className={`display mt-1.5 text-3xl md:text-4xl ${esProfesional ? "text-white" : "text-sv-dark"}`}>
                Consultas activas
              </h1>
              <p className={`mt-1 text-sm ${esProfesional ? "text-zap-400" : "text-ink-400"}`}>
                {allJobs.length === 0
                  ? "Todavía no hay consultas publicadas."
                  : `${allJobs.length} ${allJobs.length === 1 ? "problema esperando un técnico" : "problemas esperando un técnico"}`}
              </p>
            </div>

            {/* Cartel: pedidos urgentes del rubro del técnico */}
            {esProfesional && urgentesDeMiRubro.length > 0 && (
              <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🔥</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-rose-200">
                      {urgentesDeMiRubro.length} pedido{urgentesDeMiRubro.length !== 1 ? "s" : ""} urgente
                      {urgentesDeMiRubro.length !== 1 ? "s" : ""}
                      {rubroNombre ? ` de ${rubroNombre}` : ""} para hoy
                    </p>
                    <p className="mt-0.5 text-sm text-zap-300">
                      Alguien necesita resolverlo hoy mismo. Mandá tu propuesta antes que otros técnicos.
                    </p>
                    <ul className="mt-2 space-y-1">
                      {urgentesDeMiRubro.slice(0, 3).map((j) => (
                        <li key={j.id} className="truncate text-sm text-zap-100">
                          • {j.title} <span className="text-zap-500">· {j.zone}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6 flex items-center gap-4">
              <FilterDropdown
                categories={CATEGORIES}
                zones={ZONES}
                cat={cat}
                zona={zona}
                q={q}
                activeCount={activeCount}
              />
              {(cat || zona || q) && (
                <span className="text-sm text-ink-400">
                  {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
                </span>
              )}
            </div>

            <MarketplaceGrid
              jobs={jobsParaGrid}
              supabaseJobIds={supabaseJobIds}
              esProfesional={esProfesional}
              sinSesion={sinSesion}
              yaContactadoIds={yaContactadoIds}
              misPublicacionesIds={misPublicacionesIds}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

