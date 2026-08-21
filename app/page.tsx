import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FilterDropdown } from "@/components/FilterDropdown";
import { MarketplaceGrid } from "@/components/MarketplaceGrid";
import { TecnicosGrid } from "@/components/TecnicosGrid";
import { TecnicosSearchBar } from "@/components/TecnicosSearchBar";
import { TecnicosCategoryFilter } from "@/components/TecnicosCategoryFilter";
import { TecnicosSortBar } from "@/components/TecnicosSortBar";
import { type TecnicoPublico } from "@/components/TecnicoCard";
import { CATEGORIES, ZONES, type PostedJob } from "@/lib/data";
import { type Publicacion } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 0; // siempre datos frescos

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string; cat?: string; zona?: string;
    tecQ?: string; tecZona?: string; tecCat?: string; tecSort?: string;
  }>;
}) {
  const params = await searchParams;
  const q = params.q?.toLowerCase().trim() ?? "";
  const cat = params.cat ?? "";
  const zona = params.zona ?? "";

  // Filtros del directorio de técnicos (independientes de los de "Consultas
  // activas" de arriba, con prefijo "tec" para no pisarse si ambas secciones
  // conviven en la misma URL).
  const tecQ = params.tecQ?.toLowerCase().trim() ?? "";
  const tecZona = params.tecZona ?? "";
  const tecCat = params.tecCat ?? "";
  const tecSort = params.tecSort ?? "recomendados";

  // Rol del usuario actual
  const supabaseServer = await createSupabaseServer();
  const { data: { user } } = await supabaseServer.auth.getUser();
  const esProfesional = user?.user_metadata?.es_profesional === true;
  const sinSesion = !user;

  // Directorio de técnicos (PoC 2026-08, ver CLAUDE.md): visible para
  // demandantes y visitantes sin sesión. No se lo mostramos al técnico
  // logueado — a él le interesan los trabajos, no ver a otros colegas.
  let tecnicos: TecnicoPublico[] = [];
  let resumenMapTecnicos: Record<string, { promedio: number; total: number }> = {};
  if (!esProfesional) {
    const { data: tecnicosRaw } = await supabaseServer
      .from("perfiles_publicos")
      .select("user_id, nombre, zona, rubro, verificado, foto_url, telefono, titular, creado_at")
      .not("rubro", "is", null)
      .not("telefono", "is", null)
      .order("creado_at", { ascending: false });

    tecnicos = ((tecnicosRaw ?? []) as TecnicoPublico[]).filter(
      (t) => Array.isArray(t.rubro) && t.rubro.length > 0
    );

    const tecnicoIds = tecnicos.map((t) => t.user_id);
    const { data: resumenRows } = tecnicoIds.length > 0
      ? await supabaseServer.from("resenas_resumen").select("tecnico_id, promedio, total").in("tecnico_id", tecnicoIds)
      : { data: [] as { tecnico_id: string; promedio: number; total: number }[] };
    resumenMapTecnicos = Object.fromEntries(
      (resumenRows ?? []).map((r) => [r.tecnico_id, { promedio: Number(r.promedio), total: Number(r.total) }])
    );
  }

  // Filtro del directorio: texto libre (nombre, titular o rubro), zona y rubro.
  const tecnicosFiltrados = tecnicos.filter((t) => {
    if (tecCat && !(t.rubro ?? []).includes(tecCat)) return false;
    if (tecZona && t.zona !== tecZona) return false;
    if (tecQ) {
      const rubrosNombres = (t.rubro ?? []).map((slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug);
      const hay = `${t.nombre ?? ""} ${t.titular ?? ""} ${rubrosNombres.join(" ")}`.toLowerCase();
      if (!hay.includes(tecQ)) return false;
    }
    return true;
  });

  // Orden: "recomendados" respeta el orden por defecto (más nuevos primero,
  // ya viene así de la query); "rating" y "nuevos" reordenan explícito.
  const tecnicosOrdenados = (() => {
    if (tecSort === "rating") {
      return [...tecnicosFiltrados].sort(
        (a, b) => (resumenMapTecnicos[b.user_id]?.promedio ?? 0) - (resumenMapTecnicos[a.user_id]?.promedio ?? 0)
      );
    }
    if (tecSort === "nuevos") {
      return [...tecnicosFiltrados].sort(
        (a, b) => new Date(b.creado_at ?? 0).getTime() - new Date(a.creado_at ?? 0).getTime()
      );
    }
    return tecnicosFiltrados;
  })();

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
  // Rubros del técnico (puede tener varios) — se leen de perfiles_profesionales,
  // no de user_metadata: ese queda desactualizado en cuanto edita su perfil.
  let misCategorias: string[] = [];
  if (esProfesional && user) {
    const [{ data: propsPendientes }, { data: miPerfil }] = await Promise.all([
      supabaseServer
        .from("propuestas")
        .select("publicacion_id")
        .eq("profesional_id", user.id)
        .in("estado", ["pendiente", "interesado"]),
      supabaseServer.from("perfiles_profesionales").select("rubro").eq("user_id", user.id).maybeSingle(),
    ]);
    yaContactadoIds = (propsPendientes ?? []).map((p: { publicacion_id: string }) => p.publicacion_id);
    misCategorias = miPerfil?.rubro ?? [];
  }

  const activeCount = (cat ? 1 : 0) + (zona ? 1 : 0);
  const supabaseJobIds = supabaseJobs.map((j) => j.id);

  // Pedidos URGENTES (hoy) de los rubros del técnico, abiertos y sin propuesta suya
  const esUrgenteDeMiRubro = (j: PostedJob) =>
    j.urgency === "hoy" &&
    misCategorias.includes(j.categorySlug) &&
    j.status === "abierto" &&
    !yaContactadoIds.includes(j.id);
  const urgentesDeMiRubro = misCategorias.length > 0 ? allJobs.filter(esUrgenteDeMiRubro) : [];
  const rubrosNombres = misCategorias
    .map((slug) => CATEGORIES.find((c) => c.slug === slug)?.name)
    .filter((n): n is string => Boolean(n));

  // Para el técnico, los urgentes de su rubro van primero en la grilla
  const jobsParaGrid = esProfesional
    ? [...filtered].sort((a, b) => Number(esUrgenteDeMiRubro(b)) - Number(esUrgenteDeMiRubro(a)))
    : filtered;

  return (
    <>
      <Header />
      <main className={`overflow-x-hidden ${esProfesional ? "bg-[#0e1a17]" : ""}`}>

        {/* Directorio de técnicos — para demandantes y visitantes, no técnicos.
            Hero verde con el buscador adentro (inspirado en solvitapp.com.ar/
            professionals) + grilla en fondo claro debajo. */}
        {!esProfesional && (
          <section id="tecnicos">
            <div className="bg-gradient-to-br from-sv-dark to-sv-primary py-14 sm:py-20">
              <div className="container-pad">
                <div className="mx-auto max-w-2xl text-center">
                  {sinSesion ? (
                    <>
                      <h1 className="display text-4xl leading-[1.12] text-white sm:text-5xl">
                        Tu técnico ideal,<br />a un mensaje de distancia.
                      </h1>
                      <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
                        Mirá perfiles verificados, sus reseñas y su zona, y escribile
                        directo por WhatsApp — sin publicar nada, sin esperar propuestas.
                      </p>
                    </>
                  ) : (
                    <>
                      <h1 className="display text-3xl text-white sm:text-4xl">Encontrá tu técnico</h1>
                      <p className="mt-2 text-base text-white/80">
                        Mirá su perfil, sus reseñas y escribile por WhatsApp directo.
                      </p>
                    </>
                  )}
                </div>

                <div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-white/10 p-2.5 backdrop-blur-sm sm:p-3">
                  <TecnicosSearchBar tecQ={tecQ} tecZona={tecZona} tecCat={tecCat} tecSort={tecSort} />
                </div>

                {sinSesion && (
                  <>
                    <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70">
                      <span>Sin costo</span>
                      <span>Técnicos verificados</span>
                      <span>Contacto directo por WhatsApp</span>
                    </div>
                    <div className="mt-5 text-center">
                      <Link href="/registrar" className="text-sm font-medium text-white underline underline-offset-4 hover:text-white/80">
                        Soy técnico, quiero aparecer acá →
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="bg-[#f5fdf9] py-10 sm:py-14">
              <div className="container-pad">
                <div className="mb-5">
                  <TecnicosCategoryFilter tecQ={tecQ} tecZona={tecZona} tecCat={tecCat} tecSort={tecSort} />
                </div>

                <TecnicosSortBar
                  total={tecnicosOrdenados.length}
                  tecQ={tecQ}
                  tecZona={tecZona}
                  tecCat={tecCat}
                  tecSort={tecSort}
                />

                <TecnicosGrid
                  tecnicos={tecnicosOrdenados}
                  resumenMap={resumenMapTecnicos}
                  hayFiltrosActivos={!!(tecQ || tecZona || tecCat)}
                />
              </div>
            </div>
          </section>
        )}

        {/* Consultas activas — flujo viejo (publicar problema), pausado para
            demandantes/visitantes: ahora se contacta al técnico directo desde
            el directorio de arriba. Se sigue mostrando al técnico logueado
            (es su pantalla principal) y el código queda intacto para revertir
            fácil — ver CLAUDE.md "Pivot 2026-08-20/21". */}
        {esProfesional && (
        <section className="min-h-screen py-10">
          <div className="container-pad">

            {/* Intro */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-xs text-zap-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sv-primary" />
                <span className="font-medium uppercase tracking-widest">En vivo</span>
              </div>
              <h1 className="display mt-1.5 text-3xl md:text-4xl text-white">
                Consultas activas
              </h1>
              <p className="mt-1 text-sm text-zap-400">
                {allJobs.length === 0
                  ? "Todavía no hay consultas publicadas."
                  : `${allJobs.length} ${allJobs.length === 1 ? "problema esperando un técnico" : "problemas esperando un técnico"}`}
              </p>
            </div>

            {/* Banner: contacto gratis por lanzamiento */}
            <div className="mb-6 flex items-center gap-3.5 rounded-2xl border border-sv-primary/25 bg-sv-primary/10 p-4 sm:p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sv-primary/15 text-xl">
                🎉
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zap-50">
                  Contactar clientes es gratis por lanzamiento
                </p>
                <p className="mt-0.5 text-[13px] text-zap-300">
                  Sin comisión, sin cotizar nada — avisá que te interesa el trabajo y esperá que el cliente te elija.
                </p>
              </div>
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
                      {rubrosNombres.length > 0 ? ` de ${rubrosNombres.join(" / ")}` : ""} para hoy
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
        )}
      </main>
      <Footer />
    </>
  );
}

