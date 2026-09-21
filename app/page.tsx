import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Bienvenida } from "@/components/Bienvenida";
import { TecnicosDirectorio } from "@/components/TecnicosDirectorio";
import { TecnicoCard, type TecnicoPublico } from "@/components/TecnicoCard";
import { HeroSearchCard } from "@/components/HeroSearchCard";
import { ProblemStrip, SeguridadSection, OficiosGrid, ComoFuncionaPasos, WhatsAppMockupSection } from "@/components/HomeMarketingSections";
import { createSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 0; // siempre datos frescos

// Cada garantía con dos redacciones: la larga de siempre para desktop, y una
// corta para mobile. En pantalla chica las tres largas ocupaban tres
// renglones enteros (190px) entre el titular y el primer técnico; dicen lo
// mismo en la mitad de lugar.
const GARANTIAS = [
  { largo: "Identidad verificada", corto: "Identidad verificada" },
  { largo: "Reputación real, no inventada", corto: "Reputación real" },
  { largo: "Revisado a mano por Sufix", corto: "Revisado a mano" },
];

// Las tres garantías del hero. Se renderiza en dos lugares con visibilidad
// opuesta (2026-09-20): en desktop va donde estuvo siempre, debajo del
// titular; en mobile va DESPUÉS del buscador. El motivo es cuánto tarda en
// aparecer el buscador: puestas antes, empujaban el campo de búsqueda fuera
// de la primera pantalla, y esa es la acción principal de la home.
function Garantias({ className = "", compacto = false }: { className?: string; compacto?: boolean }) {
  return (
    <div className={`flex flex-wrap ${compacto ? "gap-x-3 gap-y-1.5" : "gap-x-5 gap-y-2"} ${className}`}>
      {GARANTIAS.map((g) => (
        <div
          key={g.largo}
          className={`flex items-center gap-1.5 font-semibold text-sv-olive ${compacto ? "text-[11.5px]" : "text-[13px]"}`}
        >
          <svg viewBox="0 0 24 24" fill="none" className={compacto ? "h-[14px] w-[14px] shrink-0" : "h-[17px] w-[17px] shrink-0"}>
            <path d="M12 3 4 6v6c0 5 3.4 8.7 8 9 4.6-.3 8-4 8-9V6l-8-3Z" stroke="#3C6030" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M9 12l2 2 4-4" stroke="#3C6030" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {compacto ? g.corto : g.largo}
        </div>
      ))}
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    tecQ?: string; tecZona?: string; tecSort?: string;
  }>;
}) {
  const params = await searchParams;
  const tecSort = params.tecSort === "resenas" ? "resenas" : "recomendados";

  // Filtros del directorio de técnicos, con prefijo "tec" (venían compartiendo
  // URL con los filtros viejos de "Consultas activas", ya retirados). El
  // buscador de texto matchea también por nombre de rubro, así que cubre lo
  // que antes hacían los chips de categoría (ver lib/filtros.ts).
  const tecZona = params.tecZona ?? "";

  // Rol del usuario actual. getSession() lee la cookie local (sin red);
  // getUser() valida el token contra Supabase, o sea una ida y vuelta más
  // antes de renderizar. Acá sólo decide qué home mostrar (directorio vs.
  // panel del técnico) — los datos siguen protegidos por RLS. Mismo criterio
  // que Header y /tecnico/[id].
  const supabaseServer = await createSupabaseServer();
  const { data: { session } } = await supabaseServer.auth.getSession();
  const user = session?.user ?? null;
  const esProfesional = user?.user_metadata?.es_profesional === true;
  const sinSesion = !user;

  // Directorio de técnicos (PoC 2026-08, ver CLAUDE.md): visible para
  // demandantes y visitantes sin sesión. No se lo mostramos al técnico
  // logueado — a él le interesan los trabajos, no ver a otros colegas.
  let tecnicos: TecnicoPublico[] = [];
  let resumenMapTecnicos: Record<string, { promedio: number; total: number }> = {};
  if (!esProfesional) {
    // Sin `reputacion_url` a propósito (2026-09-20): la tarjeta no la usa —
    // el link "ver las reseñas en Google Maps" vive solo en /tecnico/[id] —
    // y son URLs largas que, multiplicadas por los 620 del directorio,
    // engordaban el HTML de la home más de 100 KB al pedo.
    // Las dos consultas son independientes, así que van en paralelo: antes
    // la segunda esperaba a que terminara la primera sin necesidad.
    //
    // `resenas_resumen` se trae ENTERA, sin `.in(ids)` (2026-09-21). Suena al
    // revés, pero medido: filtrar por los 620 ids tardaba **7,9 segundos** y
    // traer la tabla entera tarda **54 ms**. Esa vista sólo tiene una fila por
    // técnico con reseñas nativas de Sufix — hoy son 3 filas, 232 bytes. El
    // `.in()` armaba una URL de ~23 KB con 620 UUIDs para filtrar eso. Era, de
    // lejos, lo más caro de la home.
    //
    // Si algún día esa tabla crece mucho (miles de técnicos con reseñas
    // propias), volver a filtrar — pero por rango o paginado, nunca con un
    // `.in()` de cientos de ids.
    const [{ data: tecnicosRaw }, { data: resumenRows }] = await Promise.all([
      supabaseServer
        .from("perfiles_publicos")
        .select("user_id, nombre, zona, rubro, verificado, foto_url, telefono, titular, creado_at, reputacion_fuente, reputacion_rating, reputacion_total")
        // Verificado (2026-09-07): la home promete "ningún técnico entra sin
        // que lo miremos primero" — quien se autoregistra por /registrar
        // espera en /admin > Técnicos pendientes hasta que alguien lo
        // apruebe. cargado_por_equipo (2026-09-18) es la excepción: altas
        // manuales del equipo (ej. scrapeo de Maps), no autoregistro — esas
        // se muestran ya, sin esperar la llamada de verificación, solo sin
        // la insignia verde (que sigue leyendo únicamente `verificado`).
        .or("verificado.eq.true,cargado_por_equipo.eq.true")
        .not("rubro", "is", null)
        .not("telefono", "is", null)
        .order("creado_at", { ascending: false }),
      supabaseServer.from("resenas_resumen").select("tecnico_id, promedio, total"),
    ]);

    tecnicos = ((tecnicosRaw ?? []) as TecnicoPublico[]).filter(
      (t) => Array.isArray(t.rubro) && t.rubro.length > 0
    );

    resumenMapTecnicos = Object.fromEntries(
      (resumenRows ?? []).map((r) => [r.tecnico_id, { promedio: Number(r.promedio), total: Number(r.total) }])
    );
  }

  // Filtrar y ordenar ya no se hace acá (2026-09-20): lo hace
  // TecnicosDirectorio, que recibe la lista completa y el filtro que venía en
  // la URL. Igual sale renderizado y ordenado del servidor — es un componente
  // cliente, pero su primer render ocurre acá, con este mismo `filtroInicial`.
  // El motivo del cambio es mobile: con el filtro del lado del navegador,
  // cambiar de oficio es instantáneo y no pierde la posición del scroll, en
  // vez de ser una navegación nueva contra el servidor.
  const filtroInicial = { q: params.tecQ?.trim() ?? "", zona: tecZona };

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
        .select("user_id, nombre, zona, rubro, verificado, foto_url, telefono, titular, creado_at, reputacion_fuente, reputacion_rating, reputacion_total, reputacion_url")
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
      {/* overflow-x-clip, no -hidden (2026-09-20): `hidden` convierte a <main>
          en un contenedor de scroll, y eso rompe el `position: sticky` de la
          barra de filtro del directorio — se quedaba pegada al tope de <main>
          (o sea, fuera de la pantalla) en vez de al viewport. `clip` recorta
          igual el desborde horizontal del blob del hero, pero sin crear
          contenedor de scroll, así que el sticky vuelve a funcionar. */}
      <main className="overflow-x-clip bg-[#FBF8EF]">
        <Bienvenida esProfesional={esProfesional} />

        {/* Directorio de técnicos — para demandantes y visitantes, no técnicos. */}
        {!esProfesional && (
          <>
            {/* ── HERO (rediseño 2026-08-28, look "crema/salvia") ── */}
            {/* pt/pb más chicos en mobile: cada 16px de aire acá retrasa la
                aparición del buscador, que es lo que la gente viene a usar. */}
            <section className="relative pb-6 pt-6 sm:pb-8 sm:pt-16">
              <div
                className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] opacity-70"
                style={{ background: "#E4EAD6", borderRadius: "44% 56% 60% 40% / 48% 42% 58% 52%" }}
                aria-hidden
              />
              <div className="container-home relative grid gap-5 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-11">
                <div>
                  <span className="mb-3.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-sv-olive">
                    ✦ Ya funcionamos en CABA y zona norte
                  </span>
                  {/* El párrafo se esconde en mobile: dice lo mismo que ya
                      dicen el titular y las garantías, y en pantalla chica
                      son 5 renglones que empujan el buscador fuera de vista. */}
                  {sinSesion ? (
                    <>
                      <h1 className="display max-w-lg text-3xl font-extrabold leading-[1.15] text-sv-dark sm:text-4xl">
                        ¿Se rompió algo en casa? <span className="text-sv-primary">Encontrá a quien lo resuelva.</span>
                      </h1>
                      <p className="mt-3.5 hidden max-w-md text-sm leading-relaxed text-ink-500 sm:block sm:text-base">
                        No empieces a pedir contactos por WhatsApp. Mirá perfiles verificados por nuestro equipo, sus
                        reseñas y su zona, y escribile directo — sin publicar nada, sin esperar propuestas.
                      </p>
                    </>
                  ) : (
                    <>
                      <h1 className="display max-w-lg text-3xl font-extrabold leading-[1.15] text-sv-dark sm:text-4xl">
                        Encontrá tu <span className="text-sv-primary">técnico ideal.</span>
                      </h1>
                      <p className="mt-3.5 hidden max-w-md text-sm leading-relaxed text-ink-500 sm:block sm:text-base">
                        Mirá su perfil, sus reseñas y escribile por WhatsApp directo.
                      </p>
                    </>
                  )}

                  {/* Antes solo para visitantes sin cuenta (sinSesion) — se
                      muestra siempre para demandante: no es contenido de
                      "primer contacto", es refuerzo de confianza válido
                      para cualquiera (pedido 2026-08-31, unificar la home
                      logueada con la de visitante). */}
                  <Garantias className="mt-6 hidden lg:flex" />
                </div>

                {/* Solo desktop (2026-09-20). En mobile este buscador hace lo
                    mismo que los chips de oficio + las pastillas de filtro que
                    están a un dedo de distancia y encima quedan pegadas al
                    scrollear — pero ocupa 318px, o sea media pantalla de
                    formulario antes de ver un solo técnico. El corte es en lg,
                    el mismo punto donde aparecen los chips y la barra sticky,
                    así que nunca se ven las dos cosas ni ninguna. */}
                <div className="hidden lg:block">
                  <HeroSearchCard />
                </div>

                {/* Misma lista, del otro lado del buscador — ver Garantias. */}
                <Garantias compacto className="lg:hidden" />
              </div>
            </section>

            {/* ── TÉCNICOS VERIFICADOS ── */}
            {/* Copia fiel del mockup: título + descripción + grilla, nada más.
                El buscador único de la página es el del hero (HeroSearchCard) —
                antes había un segundo buscador acá (TecnicosSearchBar) que
                confundía sobre cuál usar. El "ver más" lo resuelve
                TecnicosGrid internamente (reemplazo natural del link "Ver los
                25 técnicos →" del mockup, que en el HTML apuntaba a una
                tecnicos.html separada — acá todo vive en una sola página). */}
            {/* pb más chico que pt a propósito: la línea/botón de "ver más"
                de TecnicosGrid ya trae su propio mt-10 antes de esta
                sección terminar, así que con pb completo el salto hacia
                Seguridad quedaba más grande que entre el resto de las
                secciones de más abajo. Restando esos 40px acá (en vez de
                sacarle el margen a la línea) el salto final da igual sin
                mover nada de posición dentro de la grilla. */}
            {/* relative (2026-09-20): el blob decorativo del hero es absolute
                dentro de una sección `relative`, así que pinta por encima del
                fondo de las secciones que siguen. Antes no se notaba porque el
                hero era alto y el blob terminaba adentro; al acortarlo en
                mobile empezó a asomar sobre este título. Con `relative` acá,
                esta sección pinta después (va después en el DOM) y lo tapa. */}
            <section id="tecnicos" className="relative bg-zap-50 pb-7 pt-6 sm:pb-10 sm:pt-20">
              <div className="container-home">
                {/* En mobile queda solo el h2, y chico: el volante de arriba
                    (eyebrow + bajada) repetía lo que ya dice el hero dos dedos
                    más arriba, y entre los tres se comían 263px — media
                    pantalla de títulos entre el hero y el primer técnico. En
                    desktop no molesta y se deja como estaba. */}
                <div className="mx-auto max-w-2xl sm:text-center">
                  <span className="hidden text-[13px] font-bold uppercase tracking-wider text-sv-primary sm:block">
                    Técnicos verificados
                  </span>
                  <h2 className="display text-xl leading-tight text-sv-dark sm:mt-2 sm:text-4xl">
                    {sinSesion ? "Perfiles listos, apenas entrás." : "Elegí con quién hablar."}
                  </h2>
                  <p className="mt-3 hidden text-base text-ink-500 sm:block">
                    {sinSesion
                      ? "Así se ven los técnicos disponibles en tu zona ahora mismo."
                      : "Mirá su perfil, sus reseñas y escribile por WhatsApp directo."}
                  </p>
                </div>

                <div className="mt-4 sm:mt-10">
                  {/* La barra de orden y la grilla van juntas en un componente
                      cliente: cambiar de orden se resuelve en el navegador, sin
                      navegar ni saltar el scroll. El servidor igual manda la
                      lista ya ordenada, con el mismo criterio. */}
                  <TecnicosDirectorio
                    tecnicos={tecnicos}
                    resumenMap={resumenMapTecnicos}
                    filtroInicial={filtroInicial}
                    ordenInicial={tecSort}
                  />
                </div>
              </div>
            </section>

            {/* ── Resto de la landing ── */}
            {/* Antes solo para visitantes sin cuenta (sinSesion) — un
                demandante logueado se quedaba con una versión mucho más
                pobre de la home (solo hero + grilla), nada de esto. Se
                unifica: ninguna de estas secciones es contenido exclusivo
                de "primer contacto" — Oficios sirve para navegar, Seguridad
                y Cómo funciona no dejan de aplicar por tener cuenta
                (pedido 2026-08-31). El técnico logueado sigue viendo su
                propia vista aparte (más abajo), eso no cambia. */}
            <>
              <SeguridadSection />
              <ProblemStrip />
              <OficiosGrid />
              <ComoFuncionaPasos />
              <WhatsAppMockupSection />

              <section className="bg-white py-16 text-center sm:py-24">
                <div className="container-home">
                  <h2 className="display mx-auto max-w-lg text-3xl leading-tight text-sv-dark sm:text-4xl">
                    Tu próximo arreglo, a un mensaje de distancia
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-base text-ink-500">
                    Buscá técnicos verificados de tu zona y escribiles directo por WhatsApp.
                  </p>
                  <Link href="#tecnicos" className="btn-primary mt-7 inline-block px-9">
                    Buscar técnico →
                  </Link>
                </div>
              </section>
            </>
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
                {miPerfil.verificado
                  ? "Así te ven los clientes que te buscan en el directorio."
                  : "Así se va a ver tu perfil cuando lo publiquemos."}
              </p>

              {/* Sin esto, un técnico recién registrado veía su tarjeta y daba
                  por hecho que ya estaba publicado — desde 2026-09-07 no
                  aparece en el directorio hasta que alguien lo revisa. */}
              {!miPerfil.verificado && (
                <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5">
                  <p className="text-sm font-semibold text-amber-900">Tu perfil está en revisión</p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-800">
                    Todavía no aparece en el directorio. Una persona de nuestro equipo lo mira a
                    mano y se contacta con vos por WhatsApp para confirmar tus datos. Mientras
                    tanto podés dejarlo completo.
                  </p>
                </div>
              )}
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
