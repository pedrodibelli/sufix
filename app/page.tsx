import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TecnicosGrid } from "@/components/TecnicosGrid";
import { TecnicosSearchBar } from "@/components/TecnicosSearchBar";
import { TecnicoCard, type TecnicoPublico } from "@/components/TecnicoCard";
import { HeroSearchCard } from "@/components/HeroSearchCard";
import { ProblemStrip, SeguridadSection, OficiosGrid, ComoFuncionaPasos, WhatsAppMockupSection } from "@/components/HomeMarketingSections";
import { CATEGORIES, ZONES, ZONAS_CABA } from "@/lib/data";
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
    // "CABA" no es un barrio real, es el atajo que carga ZonaChips (ver
    // ZONAS_CABA en lib/data.ts) — matchea si el técnico cubre cualquiera
    // de los 9 barrios de Capital, no un string literal "CABA".
    if (tecZona === "CABA") {
      if (!(t.zona ?? []).some((z) => ZONAS_CABA.includes(z))) return false;
    } else if (tecZona && !(t.zona ?? []).includes(tecZona)) return false;
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
      <main className="overflow-x-hidden bg-[#FBF8EF]">

        {/* Directorio de técnicos — para demandantes y visitantes, no técnicos. */}
        {!esProfesional && (
          <>
            {/* ── HERO (rediseño 2026-08-28, look "crema/salvia") ── */}
            <section className="relative overflow-hidden pb-8 pt-10 sm:pt-16">
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] opacity-70"
                style={{ background: "#E4EAD6", borderRadius: "44% 56% 60% 40% / 48% 42% 58% 52%" }}
                aria-hidden
              />
              <div className="container-pad relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-11">
                <div>
                  <span className="mb-3.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-sv-olive">
                    ✦ Ya funcionamos en CABA
                  </span>
                  {sinSesion ? (
                    <>
                      <h1 className="display max-w-lg text-4xl font-extrabold leading-[1.1] text-sv-dark sm:text-5xl">
                        ¿Se rompió algo en casa? <span className="text-sv-primary">Encontrá a quien lo resuelva.</span>
                      </h1>
                      <p className="mt-3.5 max-w-md text-base leading-relaxed text-ink-500 sm:text-lg">
                        No empieces a pedir contactos por WhatsApp. Mirá perfiles verificados por nuestro equipo, sus
                        reseñas y su zona, y escribile directo — sin publicar nada, sin esperar propuestas.
                      </p>
                    </>
                  ) : (
                    <>
                      <h1 className="display max-w-lg text-4xl font-extrabold leading-[1.1] text-sv-dark sm:text-5xl">
                        Encontrá tu <span className="text-sv-primary">técnico ideal.</span>
                      </h1>
                      <p className="mt-3.5 max-w-md text-base leading-relaxed text-ink-500 sm:text-lg">
                        Mirá su perfil, sus reseñas y escribile por WhatsApp directo.
                      </p>
                    </>
                  )}

                  {sinSesion && (
                    <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                      {["Identidad verificada", "Reputación real, no inventada", "Revisado a mano por Sufix"].map((t) => (
                        <div key={t} className="flex items-center gap-1.5 text-[13px] font-semibold text-sv-olive">
                          <svg viewBox="0 0 24 24" fill="none" className="h-[17px] w-[17px] shrink-0">
                            <path d="M12 3 4 6v6c0 5 3.4 8.7 8 9 4.6-.3 8-4 8-9V6l-8-3Z" stroke="#3C6030" strokeWidth="1.7" strokeLinejoin="round" />
                            <path d="M9 12l2 2 4-4" stroke="#3C6030" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <HeroSearchCard />
              </div>
            </section>

            {/* ── TÉCNICOS VERIFICADOS ── */}
            <section id="tecnicos" className="bg-zap-50 py-14 sm:py-20">
              <div className="container-pad">
                <div className="mx-auto max-w-2xl text-center">
                  <span className="text-[13px] font-bold uppercase tracking-wider text-sv-primary">Técnicos verificados</span>
                  <h2 className="display mt-2 text-3xl leading-tight text-sv-dark sm:text-4xl">
                    {sinSesion ? "Perfiles listos, apenas entrás." : "Elegí con quién hablar."}
                  </h2>
                </div>

                <div className="mx-auto mt-8 max-w-3xl">
                  <TecnicosSearchBar
                    tecQ={tecQ}
                    tecZona={tecZona}
                    tecnicos={tecnicos.map((t) => ({ user_id: t.user_id, nombre: t.nombre }))}
                  />
                </div>

                {sinSesion && (
                  <div className="mt-5 text-center">
                    <Link href="/registrar" className="text-sm font-medium text-sv-olive underline underline-offset-4 hover:text-sv-dark">
                      Soy técnico, quiero aparecer acá →
                    </Link>
                  </div>
                )}

                {/* Stats reales — nada inventado */}
                <div className="mb-8 mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
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

                <p className="mb-4 text-sm text-ink-500">
                  {tecnicosOrdenados.length} {tecnicosOrdenados.length === 1 ? "técnico encontrado" : "técnicos encontrados"}
                </p>

                <TecnicosGrid
                  tecnicos={tecnicosOrdenados}
                  resumenMap={resumenMapTecnicos}
                  hayFiltrosActivos={!!(tecQ || tecZona)}
                />

                {/* Cartel de reclutamiento — solo para visitantes sin cuenta */}
                {sinSesion && (
                  <div className="mt-14 rounded-3xl bg-white p-8 sm:p-12">
                    <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-8">
                      <div>
                        <span className="inline-block rounded-full bg-sv-primary/10 px-3 py-1 text-xs font-semibold text-sv-olive">
                          Para técnicos y profesionales
                        </span>
                        <h2 className="display mt-4 text-3xl leading-tight text-sv-dark sm:text-4xl">
                          Aparecé gratis y que te encuentren tus próximos clientes.
                        </h2>
                        <p className="mt-4 text-ink-500">
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
                          <div key={b.title} className="rounded-xl border border-ink-200 bg-zap-50 p-4">
                            <p className="text-sm font-semibold text-sv-dark">{b.title}</p>
                            <p className="mt-0.5 text-xs text-ink-500">{b.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ── Resto de la landing — solo primer contacto (sin sesión) ── */}
            {sinSesion && (
              <>
                <ProblemStrip />
                <SeguridadSection />
                <OficiosGrid />
                <ComoFuncionaPasos />
                <WhatsAppMockupSection />

                <section className="bg-white py-16 text-center sm:py-24">
                  <div className="container-pad">
                    <h2 className="display mx-auto max-w-lg text-3xl leading-tight text-sv-dark sm:text-4xl">
                      Tu próximo arreglo, a un mensaje de distancia
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-base text-ink-500">
                      Buscá técnicos verificados de tu zona y escribiles directo por WhatsApp. Gratis, sin registro.
                    </p>
                    <Link href="#tecnicos" className="btn-primary mt-7 inline-block px-9">
                      Buscar técnico →
                    </Link>
                  </div>
                </section>
              </>
            )}
          </>
        )}

        {/* Home del técnico — reemplaza al viejo feed de "Consultas activas". */}
        {esProfesional && miPerfil && (
        <section className="py-10">
          <div className="container-pad">
            <div className="mb-8">
              <h1 className="display text-3xl text-sv-dark md:text-4xl">
                {miPerfil.nombre ? `Hola, ${miPerfil.nombre.split(" ")[0]}` : "Tu perfil"}
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                Así te ven los clientes que te buscan en el directorio.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
              {/* Mi tarjeta + checklist */}
              <div className="space-y-5">
                <div className="card p-3">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                    Vista previa
                  </p>
                  <TecnicoCard tecnico={miPerfil} resumen={miResumen} modoPreview />
                </div>

                {faltantes.length > 0 && (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5">
                    <p className="text-sm font-semibold text-amber-800">
                      Completá tu perfil para aparecer mejor
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-amber-700">
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
                  <h2 className="display text-xl text-sv-dark">Quién te contactó</h2>
                  {contactosRecientes.length > 0 && (
                    <Link href="/mis-consultas" className="text-sm font-medium text-sv-primary hover:text-sv-olive">
                      Ver todos →
                    </Link>
                  )}
                </div>

                {contactosRecientes.length === 0 ? (
                  <div className="card p-8 text-center text-sm text-ink-400">
                    Todavía nadie te contactó. Completá tu perfil para aparecer mejor en las búsquedas.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contactosRecientes.map((c) => (
                      <div
                        key={c.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm"
                      >
                        <span className="text-sv-dark">
                          {c.contactado_por ? "Un usuario registrado" : "Visitante sin cuenta"}
                        </span>
                        <span className="text-ink-400">
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
