import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TecnicosGrid } from "@/components/TecnicosGrid";
import { type TecnicoPublico } from "@/components/TecnicoCard";
import { categoryBySlug } from "@/lib/data";
import { IconOficio } from "@/components/icons";
import { Avatar } from "@/components/Avatar";
import { avatarColorFor } from "@/lib/avatarColors";
import { toTitleCase } from "@/lib/format";
import { calificacionEfectiva } from "@/lib/reputacion";
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
    .select("user_id, nombre, zona, rubro, verificado, foto_url, telefono, titular, creado_at, reputacion_fuente, reputacion_rating, reputacion_total, reputacion_url")
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

  // Mismo orden que la home: mejor calificación primero (Google Maps cuenta
  // igual que una reseña nativa si el técnico la tiene cargada — ver
  // lib/reputacion.ts), sin reseñas de ningún tipo = -1.
  const tecnicosOrdenados = [...tecnicos].sort((a, b) => {
    const ca = calificacionEfectiva(a, resumenMap[a.user_id]);
    const cb = calificacionEfectiva(b, resumenMap[b.user_id]);
    if (cb.promedio !== ca.promedio) return cb.promedio - ca.promedio;
    return new Date(b.creado_at ?? 0).getTime() - new Date(a.creado_at ?? 0).getTime();
  });

  // Datos del encabezado, todos calculados de lo que ya trajimos — nada
  // hardcodeado, así se actualiza solo cuando entra un técnico nuevo.
  const verificados = tecnicos.filter((t) => t.verificado).length;
  const zonasCubiertas = new Set(tecnicos.flatMap((t) => t.zona ?? [])).size;
  const ratings = tecnicosOrdenados
    .map((t) => calificacionEfectiva(t, resumenMap[t.user_id]).promedio)
    .filter((p) => p >= 0);
  // El promedio del rubro solo se muestra si hay al menos 3 técnicos con
  // reseñas. Con menos no es un promedio de nada: en plomería hoy un solo
  // técnico tiene reputación cargada, y poner "4.9★" al lado de "13
  // técnicos" daba a entender que los 13 estaban calificados así.
  const promedioGeneral = ratings.length >= 3
    ? ratings.reduce((s, p) => s + p, 0) / ratings.length
    : null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FBF8EF]">
        {/* Hero (rediseño 2026-09-04). Antes: gradiente pastel por rubro
            (cat.accent: celeste para plomería, ámbar para electricidad…),
            herencia del mock viejo que chocaba con la paleta crema/verde del
            resto del sitio, y con toda la mitad derecha vacía. Ahora usa el
            mismo blob salvia que el hero de la home, y la derecha se llena
            con los técnicos REALES del rubro — nada de fotos de stock: las
            caras son las de los técnicos que ya están en la base, así que la
            sección se llena sola a medida que entran más. */}
        <section className="relative overflow-hidden border-b border-ink-100 bg-zap-50">
          <div
            className="pointer-events-none absolute -right-24 -top-28 h-[420px] w-[420px] opacity-70"
            style={{ background: "#E4EAD6", borderRadius: "44% 56% 60% 40% / 48% 42% 58% 52%" }}
            aria-hidden
          />
          <div className="container-home relative py-14">
            <Link href="/#tecnicos" className="text-xs text-ink-600 hover:text-ink-900">
              ← Todos los técnicos
            </Link>

            <div className="mt-4 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
              <div>
                {/* Ícono de línea propio, no el emoji de cat.icon (2026-09-04):
                    era el último lugar donde sobrevivía un emoji de rubro — la
                    home y /categorias ya usaban IconOficio. Además los emojis
                    se dibujan distinto en cada sistema, así que no controlábamos
                    cómo se veía el encabezado del rubro. */}
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-4 text-sv-primary shadow-[0_10px_24px_-14px_rgba(29,46,32,0.45)]">
                  <IconOficio slug={cat.slug} />
                </div>
                <h1 className="display mt-4 text-4xl text-sv-dark md:text-5xl">{cat.name}</h1>
                {/* Frase única con la cantidad ya adentro (2026-08-29) —
                    antes había un blurb con ejemplos de problemas sueltos
                    (herencia del modelo viejo de "publicá tu problema", sin
                    sentido acá) más una segunda línea aparte solo con el
                    número. Se fusionan en una sola frase con propósito. */}
                {/* Con 0 técnicos la frase de siempre quedaba mal ("0 técnicos
                    verificados, listos para contactar"). En ese caso se dice
                    lo que realmente pasa (2026-09-04). */}
                <p className="mt-3 max-w-md text-ink-700">
                  {tecnicos.length === 0
                    ? `Todavía no tenemos técnicos de ${cat.name} en Sufix. Estamos sumando.`
                    : `${tecnicos.length} ${tecnicos.length === 1 ? "técnico" : "técnicos"} de ${cat.name} verificados, listos para contactar por WhatsApp.`}
                </p>
              </div>

              {/* Columna derecha: todo dato real de la base, sin fotos de stock.
                  Si el rubro todavía no tiene técnicos no se renderiza nada —
                  mejor el espacio vacío que una tarjeta diciendo "0". */}
              {tecnicos.length > 0 && (
                <div className="rounded-3xl border border-sv-dark/10 bg-[#FBF8EF] p-6 shadow-[0_26px_60px_-30px_rgba(29,46,32,0.3)]">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Algunos de sus perfiles
                  </p>
                  <div className="mt-3.5 flex items-center">
                    {tecnicosOrdenados.slice(0, 5).map((t, i) => {
                      const n = toTitleCase(t.nombre ?? "Profesional");
                      return (
                        <div
                          key={t.user_id}
                          className="rounded-[14px] ring-[3px] ring-[#FBF8EF]"
                          style={{ marginLeft: i === 0 ? 0 : -14, zIndex: 5 - i }}
                        >
                          <Avatar
                            url={t.foto_url}
                            initials={n.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                            size={48}
                            fallbackColor={avatarColorFor(t.user_id)}
                          />
                        </div>
                      );
                    })}
                    {tecnicos.length > 5 && (
                      <span className="ml-3 text-sm font-semibold text-ink-500">
                        +{tecnicos.length - 5}
                      </span>
                    )}
                  </div>

                  <dl className={`mt-6 grid gap-3 border-t border-ink-100 pt-5 text-center ${promedioGeneral !== null ? "grid-cols-3" : "grid-cols-2"}`}>
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-ink-400">Verificados</dt>
                      <dd className="display mt-1 text-2xl text-sv-dark">{verificados}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] uppercase tracking-wide text-ink-400">Zonas</dt>
                      <dd className="display mt-1 text-2xl text-sv-dark">{zonasCubiertas}</dd>
                    </div>
                    {promedioGeneral !== null && (
                      <div>
                        <dt className="text-[11px] uppercase tracking-wide text-ink-400">Promedio</dt>
                        <dd className="display mt-1 text-2xl text-sv-dark">{promedioGeneral.toFixed(1)}★</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
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
