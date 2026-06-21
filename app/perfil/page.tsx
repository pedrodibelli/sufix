import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createSupabaseServer } from "@/lib/supabase-server";
import { PerfilForm } from "./PerfilForm";

export const revalidate = 0;

type Resena = { id: string; estrellas: number; comentario: string | null; creado_at: string; autor_nombre: string | null };

export default async function PerfilPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const esTecnico = user.user_metadata?.es_profesional === true;
  const nombreMeta = user.user_metadata?.nombre as string | undefined;
  const apellidoMeta = user.user_metadata?.apellido as string | undefined;
  const displayName = [nombreMeta, apellidoMeta].filter(Boolean).join(" ") || user.email;
  const initials =
    nombreMeta && apellidoMeta
      ? `${nombreMeta[0]}${apellidoMeta[0]}`.toUpperCase()
      : nombreMeta
      ? nombreMeta.slice(0, 2).toUpperCase()
      : (user.email?.[0]?.toUpperCase() ?? "U");

  let perfil: { telefono: string | null; zona: string | null; rubro: string | null } | null = null;
  let promedio = 0;
  let total = 0;
  let resenas: Resena[] = [];

  if (esTecnico) {
    const [{ data: p }, { data: rs }, { data: rl }] = await Promise.all([
      supabase.from("perfiles_profesionales").select("telefono, zona, rubro").eq("user_id", user.id).maybeSingle(),
      supabase.from("resenas_resumen").select("promedio, total").eq("tecnico_id", user.id).maybeSingle(),
      supabase.from("resenas").select("id, estrellas, comentario, creado_at, autor_nombre").eq("tecnico_id", user.id).order("creado_at", { ascending: false }),
    ]);
    perfil = p;
    if (rs) { promedio = Number(rs.promedio); total = Number(rs.total); }
    resenas = (rl ?? []) as Resena[];
  }

  // Vista DEMANDANTE (clara)
  if (!esTecnico) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#f5fdf9]">
          <div className="container-pad py-10">
            <div className="mx-auto max-w-lg">
              <h1 className="display text-2xl">Mi perfil</h1>

              <div className="mt-6 card p-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sv-dark to-sv-primary font-display text-2xl font-semibold text-white">
                    {initials}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="display text-xl">{displayName}</h2>
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                        Cliente
                      </span>
                    </div>
                    {user.email && <p className="mt-0.5 truncate text-sm text-ink-400">✉ {user.email}</p>}
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2 border-t border-ink-100 pt-5">
                  <Link href="/mis-consultas" className="btn-outline w-full">Ver mis consultas</Link>
                  <Link href="/publicar" className="btn-primary w-full">Publicar un problema</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Vista TÉCNICO (oscura)
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0e1a17]">
        <div className="container-pad py-10">
          <h1 className="display text-2xl text-zap-50">Mi perfil</h1>
          <p className="mt-1 text-sm text-zap-400">{displayName} · Técnico</p>

          {/* Reputación */}
          <section className="mt-6">
            <h2 className="display text-lg text-zap-50">Mi reputación</h2>
            <div className="mt-3 rounded-2xl border border-white/10 bg-[#162420] p-5">
              {total > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-xl text-amber-400">★</span>
                  <span className="font-display text-2xl font-semibold text-zap-50">{promedio.toFixed(2)}</span>
                  <span className="text-zap-400">· {total} reseña{total !== 1 ? "s" : ""}</span>
                </div>
              ) : (
                <p className="text-sm text-zap-400">
                  Todavía no tenés reseñas. Cuando completes trabajos, tus clientes van a poder calificarte.
                </p>
              )}
            </div>

            {resenas.length > 0 && (
              <div className={`mt-3 ${resenas.length > 3 ? "flex gap-3 overflow-x-auto pb-2 no-scrollbar sm:block sm:space-y-3 sm:overflow-visible" : "space-y-3"}`}>
                {resenas.map((r) => (
                  <div
                    key={r.id}
                    className={`rounded-2xl border border-white/10 bg-[#162420] p-5 ${resenas.length > 3 ? "min-w-[260px] max-w-[280px] shrink-0 sm:min-w-0 sm:max-w-none" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base text-amber-400">
                        {"★".repeat(r.estrellas)}
                        <span className="text-white/15">{"★".repeat(5 - r.estrellas)}</span>
                      </span>
                      <span className="text-[11.5px] text-zap-500">
                        {new Date(r.creado_at).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-zap-300">{r.autor_nombre ?? "Cliente"}</p>
                    {r.comentario && <p className="mt-2 text-sm text-zap-100">{r.comentario}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Datos editables */}
          <section className="mt-8">
            <h2 className="display text-lg text-zap-50">Mis datos</h2>
            <div className="mt-3">
              <PerfilForm perfil={perfil} dark />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
