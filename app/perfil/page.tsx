import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createSupabaseServer } from "@/lib/supabase-server";
import { PerfilForm } from "./PerfilForm";

export const revalidate = 0;

export default async function PerfilPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const esTecnico = user.user_metadata?.es_profesional === true;
  const displayName =
    [user.user_metadata?.nombre, user.user_metadata?.apellido].filter(Boolean).join(" ") ||
    user.email;

  let perfil: { telefono: string | null; zona: string | null; rubro: string | null } | null = null;
  if (esTecnico) {
    const { data } = await supabase
      .from("perfiles_profesionales")
      .select("telefono, zona, rubro")
      .eq("user_id", user.id)
      .maybeSingle();
    perfil = data;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f5fdf9]">
        <div className="container-pad py-10">
          <h1 className="display text-2xl">Mi perfil</h1>
          <p className="mt-1 text-sm text-ink-400">
            {displayName} · {esTecnico ? "Técnico" : "Cliente"}
          </p>

          {esTecnico ? (
            <div className="mt-6">
              <PerfilForm perfil={perfil} />
            </div>
          ) : (
            <div className="mt-6 card max-w-lg p-6">
              <p className="text-sm text-ink-600">Tu información de cuenta:</p>
              <p className="mt-2 text-sm"><strong>Nombre:</strong> {displayName}</p>
              <p className="mt-1 text-sm"><strong>Email:</strong> {user.email}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
