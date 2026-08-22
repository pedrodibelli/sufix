import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StarRating } from "@/components/StarRating";
import { Avatar } from "@/components/Avatar";
import { ContactarWhatsAppButton } from "@/components/ContactarWhatsAppButton";
import { IconMapPin, IconVerifiedBadge, IconWhatsApp } from "@/components/icons";
import { CATEGORIES } from "@/lib/data";
import { avatarColorFor } from "@/lib/avatarColors";
import { toTitleCase } from "@/lib/format";
import { createSupabaseServer } from "@/lib/supabase-server";
import { DejarResenaForm } from "./DejarResenaForm";

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
    .select("user_id, nombre, zona, rubro, verificado, foto_url, telefono, titular")
    .eq("user_id", id)
    .maybeSingle();

  if (!perfil) notFound();

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
  const promedio = resumen ? Number(resumen.promedio) : 0;
  const total = resumen ? Number(resumen.total) : 0;
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
      <main className="min-h-screen bg-[#f5fdf9]">
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
                      <StarRating rating={promedio} reviews={total} size="md" />
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-0.5 text-[12px] font-semibold text-white">
                        Nuevo en Sufix
                      </span>
                    )}
                    {perfil.zona && (
                      <span className="inline-flex items-center gap-1">
                        <IconMapPin className="h-3.5 w-3.5" /> {perfil.zona}
                      </span>
                    )}
                  </div>
                  {rubroCats.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {rubroCats.map((c) => (
                        <span key={c.slug} className="rounded-full border border-ink-200 px-2.5 py-0.5 text-[12px] font-medium text-ink-600">
                          {c.icon} {c.name}
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
                  className="btn w-full bg-[#25D366] py-3.5 text-base text-white hover:brightness-95 sm:w-auto sm:px-8"
                >
                  <IconWhatsApp className="h-4 w-4" /> Contactar por WhatsApp
                </ContactarWhatsAppButton>
              )}
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
        </section>
      </main>
      <Footer />
    </>
  );
}
