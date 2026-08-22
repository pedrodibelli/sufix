import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TecnicosGrid } from "@/components/TecnicosGrid";
import { TecnicosSearchBar } from "@/components/TecnicosSearchBar";
import { TecnicoCard, type TecnicoPublico } from "@/components/TecnicoCard";
import { CATEGORIES, ZONES } from "@/lib/data";
import { createSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 0; // siempre datos frescos

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    tecQ?: string; tecZona?: string;
  }>;
}) {
  const params = await searchParams;

  // Filtros del directorio de técnicos, con prefijo "tec" (venían compartiendo
  // URL con los filtros viejos de "Consultas activas", ya retirados). Ya no
  // hay chips de rubro ni toggle de orden (2026-08-21) — el buscador de texto
  // ya matchea por rubro (ver tecnicosFiltrados) y el orden es siempre por
  // mejor calificación.
  const tecQ = params.tecQ?.toLowerCase().trim() ?? "";
  const tecZona = params.tecZona ?? "";

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

  // Filtro del directorio: texto libre (nombre, titular o rubro) y zona. El
  // texto ya matchea por nombre del rubro, así que cubre lo que antes hacían
  // los chips de categoría sin necesitar un filtro aparte.
  const tecnicosFiltrados = tecnicos.filter((t) => {
    if (tecZona && t.zona !== tecZona) return false;
    if (tecQ) {
      const rubrosNombres = (t.rubro ?? []).map((slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug);
      const hay = `${t.nombre ?? ""} ${t.titular ?? ""} ${rubrosNombres.join(" ")}`.toLowerCase();
      if (!hay.includes(tecQ)) return false;
    }
    return true;
  });

  // Orden único (2026-08-21, ya no es elegible por el usuario): mejor
  // calificación primero. Sin reseñas todavía = -1, así que un técnico recién
  // registrado cae al final solo, y sube a medida que junta reseñas buenas —
  // "automatizado" como pidió el usuario. Empate/sin reseñas: más nuevos primero.
  const tecnicosOrdenados = [...tecnicosFiltrados].sort((a, b) => {
    const ra = resumenMapTecnicos[a.user_id];
    const rb = resumenMapTecnicos[b.user_id];
    const pa = ra && ra.total > 0 ? ra.promedio : -1;
    const pb = rb && rb.total > 0 ? rb.promedio : -1;
    if (pb !== pa) return pb - pa;
    return new Date(b.creado_at ?? 0).getTime() - new Date(a.creado_at ?? 0).getTime();
  });

  // Home del técnico (ver CLAUDE.md "Pivot 2026-08-2x"): antes mostraba el
  // feed de "Consultas activas", que quedó muerto para siempre — ya no hay
  // forma de publicar un problema nueva desde la web. Ahora muestra su propia
  // tarjeta (así lo ven los clientes), un check de perfil incompleto, y un
  // adelanto de quién lo contactó (usa contactos_tecnico, ya filtrado por
  // RLS a lo suyo). El feed viejo sigue completo en el tag de git
  // idea-publicar-problema-2026-08-20 si hiciera falta volver.
  let miPerfil: TecnicoPublico | null = null;
  let miResumen: { promedio: number; total: number } | undefined;
  let contactosRecientes: { id: string; contactado_por: string | null; origen: string | null; creado_at: string }[] = [];
  if (esProfesional && user) {
    const [{ data: perfilRow }, { data: resumenRow }, { data: contactosRows }] = await Promise.all([
      supabaseServer
        .from("perfiles_publicos")
        .select("user_id, nombre, zona, rubro, verificado, foto_url, telefono, titular, creado_at")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabaseServer.from("resenas_resumen").select("promedio, total").eq("tecnico_id", user.id).maybeSingle(),
      supabaseServer
        .from("contactos_tecnico")
        .select("id, contactado_por, origen, creado_at")
        .eq("tecnico_id", user.id)
        .order("creado_at", { ascending: false })
        .limit(5),
    ]);
    miPerfil = perfilRow as TecnicoPublico | null;
    if (resumenRow) miResumen = { promedio: Number(resumenRow.promedio), total: Number(resumenRow.total) };
    contactosRecientes = contactosRows ?? [];
  }

  const faltantes: string[] = [];
  if (esProfesional && miPerfil) {
    if (!miPerfil.foto_url) faltantes.push("Subí una foto de perfil");
    if (!miPerfil.zona) faltantes.push("Completá tu zona");
    if (!miPerfil.rubro || miPerfil.rubro.length === 0) faltantes.push("Elegí al menos un rubro");
    if (!miPerfil.telefono) faltantes.push("Cargá tu teléfono de WhatsApp");
  }

  return (
    <>
      <Header />
      <main className={`overflow-x-hidden ${esProfesional ? "bg-[#0e1a17]" : ""}`}>

        {/* Directorio de técnicos — para demandantes y visitantes, no técnicos.
            Un solo fondo verde oscuro degradado para toda la sección (pedido
            2026-08-21, segunda vuelta): la primera versión cortaba en franjas
            blanco/verde/blanco y no convenció — ahora es continuo de punta a
            punta. Las tarjetitas (stats, chips, técnicos) son blancas y
            resaltan solas contra el verde, sin tener que tocar su color. */}
        {!esProfesional && (
          <section id="tecnicos" className="bg-gradient-to-br from-[#0e1a17] to-[#1f4a34] py-14 sm:py-20">
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

              <div className="mx-auto mt-8 max-w-3xl">
                <TecnicosSearchBar
                  tecQ={tecQ}
                  tecZona={tecZona}
                  tecnicos={tecnicos.map((t) => ({ user_id: t.user_id, nombre: t.nombre }))}
                />
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

              {/* Stats reales — nada inventado: cuenta de técnicos actual,
                  cantidad de rubros/zonas que ya manejamos. Inspirado en el
                  mockup de Claude Design (ver charla del 2026-08-21). */}
              <div className="mb-8 mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { value: String(tecnicos.length), label: tecnicos.length === 1 ? "Técnico activo" : "Técnicos activos" },
                  { value: String(CATEGORIES.length), label: "Oficios" },
                  { value: String(ZONES.length), label: "Zonas en CABA" },
                  { value: "$0", label: "Siempre gratis" },
                ].map((s) => (
                  <div key={s.label} className="card p-4">
                    <div className="display text-2xl text-sv-dark">{s.value}</div>
                    <div className="mt-0.5 text-xs text-ink-500">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Sin chips de rubro ni toggle de orden (2026-08-21) — el
                  buscador de arriba (con autocompletado) es el único filtro,
                  y el orden es siempre por mejor calificación. */}
              <p className="mb-4 text-sm text-white/70">
                {tecnicosOrdenados.length} {tecnicosOrdenados.length === 1 ? "técnico encontrado" : "técnicos encontrados"}
              </p>

              <TecnicosGrid
                tecnicos={tecnicosOrdenados}
                resumenMap={resumenMapTecnicos}
                hayFiltrosActivos={!!(tecQ || tecZona)}
              />

              {/* Cartel de reclutamiento + 3 pasos — solo para visitantes sin
                  cuenta. Ahora en tarjeta blanca (no oscura) porque ya está
                  todo sobre el mismo fondo verde — una tarjeta oscura acá se
                  perdía contra el fondo. Copy propio, no el genérico que puso
                  la IA sin contexto del producto. */}
              {sinSesion && (
                <>
                  <div className="mt-12 rounded-2xl bg-white p-8 sm:p-12">
                    <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                      <div>
                        <span className="inline-block rounded-full bg-sv-primary/10 px-3 py-1 text-xs font-semibold text-sv-olive">
                          Para técnicos y profesionales
                        </span>
                        <h2 className="display mt-4 text-3xl leading-tight text-sv-dark sm:text-4xl">
                          Aparecé gratis y que te encuentren tus próximos clientes.
                        </h2>
                        <p className="mt-3 text-ink-500">
                          Sin comisión por trabajo, sin intermediarios. Los clientes te
                          escriben directo a tu WhatsApp — cobrás el 100% de cada servicio.
                        </p>
                        <Link href="/registrar" className="btn-primary mt-6 inline-block">
                          Crear mi perfil gratis →
                        </Link>
                      </div>
                      <div className="space-y-3">
                        {[
                          { title: "Cobrás el 100%", body: "Sin comisión por trabajo. Lo que cobrás es tuyo." },
                          { title: "Clientes a tu WhatsApp", body: "Te escriben directo, sin intermediarios ni esperas." },
                          { title: "Sumá reputación", body: "Reseñas reales que te consiguen los próximos trabajos." },
                        ].map((b) => (
                          <div key={b.title} className="rounded-xl border border-ink-100 bg-[#f5fdf9] p-4">
                            <p className="text-sm font-semibold text-sv-dark">{b.title}</p>
                            <p className="mt-0.5 text-xs text-ink-500">{b.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-14 text-center">
                    <h2 className="display text-2xl text-white sm:text-3xl">
                      Encontrá y contactá en 3 pasos
                    </h2>
                    <p className="mt-1 text-sm text-white/60">Sin registros obligatorios ni esperas.</p>
                  </div>
                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    {[
                      { n: 1, title: "Buscá por oficio y zona", body: "Filtrá entre técnicos verificados de tu barrio en segundos." },
                      { n: 2, title: "Mirá su perfil y reseñas", body: "Comparás experiencia y opiniones reales de otros clientes." },
                      { n: 3, title: "Escribí por WhatsApp", body: "Un clic y hablás directo con el técnico. Gratis, sin registro." },
                    ].map((s) => (
                      <div key={s.n} className="card p-5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sv-primary/10 text-sm font-semibold text-sv-primary">
                          {s.n}
                        </span>
                        <p className="mt-3 font-semibold text-sv-dark">{s.title}</p>
                        <p className="mt-1 text-sm text-ink-500">{s.body}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Home del técnico — reemplaza al viejo feed de "Consultas activas"
            (quedaba muerto para siempre, ver comentario arriba en el fetch de
            datos). Muestra su propia tarjeta + checklist de perfil + un
            adelanto de quién lo contactó. */}
        {esProfesional && miPerfil && (
        <section className="py-10">
          <div className="container-pad">
            <div className="mb-8">
              <h1 className="display text-3xl text-white md:text-4xl">
                {miPerfil.nombre ? `Hola, ${miPerfil.nombre.split(" ")[0]}` : "Tu perfil"}
              </h1>
              <p className="mt-1 text-sm text-zap-400">
                Así te ven los clientes que te buscan en el directorio.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
              {/* Mi tarjeta + checklist */}
              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 p-3">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zap-500">
                    Vista previa
                  </p>
                  <TecnicoCard tecnico={miPerfil} resumen={miResumen} modoPreview />
                </div>

                {faltantes.length > 0 && (
                  <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 sm:p-5">
                    <p className="text-sm font-semibold text-amber-200">
                      Completá tu perfil para aparecer mejor
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-amber-100/80">
                      {faltantes.map((f) => (
                        <li key={f}>• {f}</li>
                      ))}
                    </ul>
                    <Link href="/perfil" className="btn-primary mt-3 inline-block text-sm">
                      Completar perfil
                    </Link>
                  </div>
                )}
              </div>

              {/* Quién te contactó */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="display text-xl text-white">Quién te contactó</h2>
                  {contactosRecientes.length > 0 && (
                    <Link href="/mis-consultas" className="text-sm font-medium text-zap-300 hover:text-white">
                      Ver todos →
                    </Link>
                  )}
                </div>

                {contactosRecientes.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-[#162420] p-8 text-center text-sm text-zap-400">
                    Todavía nadie te contactó. Completá tu perfil para aparecer mejor en las búsquedas.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contactosRecientes.map((c) => (
                      <div
                        key={c.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#162420] px-4 py-3 text-sm"
                      >
                        <span className="text-zap-100">
                          {c.contactado_por ? "Un usuario registrado" : "Visitante sin cuenta"}
                        </span>
                        <span className="text-zap-500">
                          {new Date(c.creado_at).toLocaleDateString("es-AR")} ·{" "}
                          {c.origen === "perfil" ? "desde tu perfil" : "desde la home"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        )}
      </main>
      <Footer />
    </>
  );
}

