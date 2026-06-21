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
  const displayName =
    [user.user_metadata?.nombre, user.user_metadata?.apellido].filter(Boolean).join(" ") ||
    user.email;

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
            <h1 className="display text-2xl">Mi perfil</h1>
            <p className="mt-1 text-sm text-ink-400">{displayName} · Cliente</p>
            <div className="mt-6 card max-w-lg p-6">
              <p className="text-sm text-ink-600">Tu información de cuenta:</p>
              <p className="mt-2 text-sm"><strong>Nombre:</strong> {displayName}</p>
              <p className="mt-1 text-sm"><strong>Email:</strong> {user.email}</p>
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
              <div className="mt-3 space-y-3">
                {resenas.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-white/10 bg-[#162420] p-5">
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
