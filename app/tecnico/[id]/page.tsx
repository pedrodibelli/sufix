import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StarRating } from "@/components/StarRating";
import { Avatar } from "@/components/Avatar";
import { ContactarWhatsAppButton } from "@/components/ContactarWhatsAppButton";
import { IconMapPin, IconVerifiedBadge, IconWhatsApp, IconOficio } from "@/components/icons";
import { CATEGORIES } from "@/lib/data";
import { avatarColorFor } from "@/lib/avatarColors";
import { toTitleCase } from "@/lib/format";
import { calificacionEfectiva } from "@/lib/reputacion";
import { createSupabaseServer } from "@/lib/supabase-server";
import { DejarResenaForm } from "./DejarResenaForm";
import { ReportarPerfilBoton } from "./ReportarPerfilBoton";

export const revalidate = 0;

type Resena = {
  id: string;
  estrellas: number;
  comentario: string | null;
  creado_at: string;
  autor_nombre: string | null;
};

export default async function TecnicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: perfil } = await supabase
    .from("perfiles_publicos")
    .select("user_id, nombre, zona, rubro, verificado, foto_url, telefono, titular, anos_experiencia, reputacion_fuente, reputacion_rating, reputacion_total, reputacion_url")
    .eq("user_id", id)
    .maybeSingle();

  if (!perfil) notFound();

  // Registro de vista (best-effort): no cuenta si el técnico mira su propio
  // perfil. Se espera (no fire-and-forget) porque en un entorno serverless
  // un insert sin await puede cortarse cuando termina la respuesta de la
  // página — pero envuelto en try/catch para que un fallo acá nunca rompa
  // la carga del perfil.
  if (!user || user.id !== id) {
    try {
      await supabase.from("vistas_perfil_tecnico").insert({ tecnico_id: id, visitante: user?.id ?? null });
    } catch {
      // silencioso a propósito
    }
  }

  const [{ data: resumen }, { data: resenas }, { count: completados }] = await Promise.all([
    supabase.from("resenas_resumen").select("promedio, total").eq("tecnico_id", id).maybeSingle(),
    supabase.from("resenas").select("id, estrellas, comentario, creado_at, autor_nombre").eq("tecnico_id", id).order("creado_at", { ascending: false }),
    supabase.from("propuestas").select("id", { count: "exact", head: true }).eq("profesional_id", id).eq("estado", "completada"),
  ]);

  const nombre = toTitleCase(perfil.nombre ?? "Profesional");
  const initials = nombre.split(" ").filter(Boolean).map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const rubros: string[] = Array.isArray(perfil.rubro) ? perfil.rubro : perfil.rubro ? [perfil.rubro] : [];
  const rubroCats = rubros.map((slug) => CATEGORIES.find((c) => c.slug === slug)).filter((c): c is (typeof CATEGORIES)[number] => !!c);
  const rubrosNombres = rubroCats.length > 0 ? rubroCats.map((c) => c.name) : rubros;
  const resumenSufix = resumen ? { promedio: Number(resumen.promedio), total: Number(resumen.total) } : undefined;
  const calificacion = calificacionEfectiva(perfil, resumenSufix);
  const { promedio, total, fuenteExterna } = calificacion;
  const lista = (resenas ?? []) as Resena[];

  const telefonoLimpio = perfil.telefono?.replace(/\D/g, "") ?? "";
  const primerRubroNombre = rubrosNombres[0] ?? "un servicio";
  const mensajeWa = encodeURIComponent(
    `Hola ${nombre.split(" ")[0]}! Te encontré en Sufix, me interesa tu servicio de ${primerRubroNombre}. ¿Estás disponible?`
  );
  const waLink = telefonoLimpio ? `https://wa.me/${telefonoLimpio}?text=${mensajeWa}` : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FBF8EF]">
        {/* Encabezado */}
        <section className="border-b border-ink-100 bg-white">
          <div className="container-pad py-10">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <Avatar url={perfil.foto_url} initials={initials} size={80} fallbackColor={avatarColorFor(id)} textClass="font-display text-2xl" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="display text-3xl text-sv-dark">{nombre}</h1>
                    {perfil.verificado && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sv-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-sv-olive">
                        <IconVerifiedBadge className="h-3 w-3" /> Verificado
                      </span>
                    )}
                  </div>
                  {perfil.titular?.trim() && (
                    <p className="mt-0.5 text-sm text-ink-500">{perfil.titular}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
                    {total > 0 ? (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <StarRating rating={promedio} reviews={total} size="md" />
                        {/* Aclaración explícita cuando la calificación viene de una
                            fuente externa (Google Maps, PorAca, etc. — opt-in por
                            técnico, ver lib/reputacion.ts) y no de reseñas nativas
                            de Sufix — nunca se mezcla ni se presenta como si fuera
                            de acá. Clickeable a la ficha real para que cualquiera
                            lo pueda verificar, invitando a ver las reseñas reales
                            en la fuente (pedido 2026-09-03). */}
                        {fuenteExterna && (
                          perfil.reputacion_url ? (
                            <a
                              href={perfil.reputacion_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-full border border-ink-200 px-2 py-0.5 text-[11px] font-medium text-ink-500 underline-offset-2 hover:underline"
                            >
                              Ver las {total} reseñas en {fuenteExterna} ↗
                            </a>
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-ink-200 px-2 py-0.5 text-[11px] font-medium text-ink-500">
                              Reputación de {fuenteExterna}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-0.5 text-[12px] font-semibold text-white">
                        Nuevo en Sufix
                      </span>
                    )}
                    {perfil.zona && perfil.zona.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <IconMapPin className="h-3.5 w-3.5" /> {perfil.zona.join(", ")}
                      </span>
                    )}
                  </div>
                  {rubroCats.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {rubroCats.map((c) => (
                        <span key={c.slug} className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-2.5 py-0.5 text-[12px] font-medium text-ink-600">
                          <IconOficio slug={c.slug} className="h-3.5 w-3.5 shrink-0 text-sv-primary" />
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {waLink && (
                <ContactarWhatsAppButton
                  tecnicoId={id}
                  waLink={waLink}
                  origen="perfil"
                  // shrink-0 + whitespace-nowrap: sin esto, cuando la
                  // izquierda crece mucho (varias zonas/rubros/reputación
                  // externa), el botón se achicaba como cualquier flex item
                  // y el texto se partía en dos líneas, agrandándolo mal.
                  className="btn w-full shrink-0 whitespace-nowrap bg-[#25D366] py-3.5 text-base text-white hover:brightness-95 sm:w-auto sm:px-8"
                >
                  <IconWhatsApp className="h-4 w-4" /> Contactar por WhatsApp
                </ContactarWhatsAppButton>
              )}
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-md">
              <div className="card p-4">
                <div className="text-xs uppercase tracking-wider text-ink-500">Trabajos completados</div>
                <div className="display mt-1 text-2xl">{completados ?? 0}</div>
              </div>
              <div className="card p-4">
                <div className="text-xs uppercase tracking-wider text-ink-500">Calificación</div>
                <div className="display mt-1 text-2xl">{total > 0 ? promedio.toFixed(2) : "—"}</div>
              </div>
              <div className="card p-4">
                <div className="text-xs uppercase tracking-wider text-ink-500">Experiencia</div>
                <div className="display mt-1 text-2xl">
                  {perfil.anos_experiencia ? `${perfil.anos_experiencia} años` : "—"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reseñas — siempre las nativas de Sufix (comentarios reales
            dejados acá), nunca las de Google mezcladas con esto. El
            contador usa resumenSufix, no la calificación efectiva de
            arriba (que puede venir de Google). */}
        <section className="container-pad py-10">
          <h2 className="display text-2xl text-sv-dark">
            Reseñas en Sufix {resumenSufix && resumenSufix.total > 0 && <span className="text-ink-400">({resumenSufix.total})</span>}
          </h2>

          {lista.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-ink-200 p-10 text-center text-ink-400">
              {fuenteExterna && (
                <p className="mb-2 text-sm text-ink-500">
                  Su reputación de {fuenteExterna} ya está arriba — acá van las reseñas de quienes lo contactaron por Sufix.
                </p>
              )}
              Todavía no tiene reseñas. ¡Sé el primero en calificarlo!
            </div>
          ) : (
            <div className={`mt-5 ${lista.length > 3 ? "flex gap-3 overflow-x-auto pb-2 no-scrollbar sm:block sm:space-y-3 sm:overflow-visible" : "space-y-3"}`}>
              {lista.map((r) => (
                <div
                  key={r.id}
                  className={`card p-5 ${lista.length > 3 ? "min-w-[260px] max-w-[300px] shrink-0 sm:min-w-0 sm:max-w-none" : ""}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-sv-dark">{r.autor_nombre ? toTitleCase(r.autor_nombre) : "Cliente"}</span>
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

          {user && user.id !== id ? (
            <DejarResenaForm tecnicoId={id} />
          ) : !user ? (
            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-ink-200 p-5">
              <p className="text-sm text-ink-500">¿Ya lo contactaste? Iniciá sesión para dejar tu reseña.</p>
              <Link href="/ingresar" className="btn-outline shrink-0 text-sm">
                Ingresar
              </Link>
            </div>
          ) : null}

          {/* Reportar (2026-09-03): la sección "Seguridad" de la home promete
              "podés reportar" desde hace rato, pero no existía ninguna forma
              de hacerlo. Va acá abajo, discreto — es una salida de seguridad,
              no algo que queramos empujar. No se le muestra al técnico en su
              propio perfil. */}
          {(!user || user.id !== id) && (
            <div className="mt-10 border-t border-ink-100 pt-6 text-center">
              <ReportarPerfilBoton tecnicoId={id} nombre={nombre} />
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
