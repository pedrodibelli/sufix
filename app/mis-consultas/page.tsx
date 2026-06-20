import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createSupabaseServer } from "@/lib/supabase-server";
import { DemandanteView } from "./DemandanteView";
import { OferenteView } from "./OferenteView";

export const revalidate = 0;

export default async function MisConsultasPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const esProfesional = user.user_metadata?.es_profesional === true;
  const nombre = user.user_metadata?.nombre as string | undefined;
  const apellido = user.user_metadata?.apellido as string | undefined;
  const email = user.email;

  return (
    <>
      <Header />
      <main className={`min-h-screen ${esProfesional ? "bg-[#0e1a17]" : "bg-[#f5fdf9]"}`}>
        <div className="container-pad py-10">
          {esProfesional ? (
            <OferenteData userId={user.id} nombre={nombre} apellido={apellido} email={email} />
          ) : (
            <DemandanteData userId={user.id} nombre={nombre} apellido={apellido} email={email} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

async function DemandanteData({
  userId,
  nombre,
  apellido,
  email,
}: {
  userId: string;
  nombre?: string;
  apellido?: string;
  email?: string;
}) {
  const supabase = await createSupabaseServer();

  const { data: publicaciones } = await supabase
    .from("publicaciones")
    .select("id, title, description, category_slug, zone, status, created_at, photo, photos")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const pubIds = (publicaciones ?? []).map((p) => p.id);

  const { data: propuestas, error: propError } =
    pubIds.length > 0
      ? await supabase
          .from("propuestas")
          .select("*")
          .in("publicacion_id", pubIds)
          .order("precio", { ascending: true })
      : { data: [], error: null };

  if (propError) console.error("[mis-consultas] propuestas fetch error:", propError.message);

  const publicacionesConPropuestas = (publicaciones ?? []).map((pub) => ({
    ...pub,
    propuestas: (propuestas ?? []).filter((p) => p.publicacion_id === pub.id),
  }));

  // Fetch perfiles para propuestas aceptadas/completadas (el RLS solo devuelve los autorizados)
  const proIdsAceptados = [
    ...new Set(
      (propuestas ?? [])
        .filter((p) => p.estado === "aceptada" || p.estado === "completada")
        .map((p) => p.profesional_id)
        .filter(Boolean)
    ),
  ];
  const { data: perfiles } =
    proIdsAceptados.length > 0
      ? await supabase
          .from("perfiles_profesionales")
          .select("user_id, nombre, telefono, email, zona")
          .in("user_id", proIdsAceptados)
      : { data: [] };

  const perfilMap: Record<string, { user_id: string; nombre: string | null; telefono: string | null; email: string | null; zona: string | null }> =
    Object.fromEntries((perfiles ?? []).map((p) => [p.user_id, p]));

  return (
    <DemandanteView
      publicaciones={publicacionesConPropuestas}
      perfilMap={perfilMap}
      nombre={nombre}
      apellido={apellido}
      email={email}
    />
  );
}

async function OferenteData({
  userId,
  nombre,
  apellido,
  email,
}: {
  userId: string;
  nombre?: string;
  apellido?: string;
  email?: string;
}) {
  const supabase = await createSupabaseServer();

  const { data: propuestas, error: propError } = await supabase
    .from("propuestas")
    // Columnas mínimas para la vista del oferente. NO traer codigo_pago: el técnico
    // debe pedírselo al demandante para cerrar el trabajo (no leerlo de los datos).
    .select("id, publicacion_id, precio, titulo, zona, categoria, demandante, estado, created_at")
    .eq("profesional_id", userId)
    .order("created_at", { ascending: false });

  if (propError) console.error("[mis-consultas] oferente propuestas error:", propError.message);

  // Obtener fotos de las publicaciones relacionadas
  const pubIds = [...new Set((propuestas ?? []).map((p) => p.publicacion_id).filter(Boolean))];
  const { data: pubFotos } = pubIds.length > 0
    ? await supabase.from("publicaciones").select("id, photo").in("id", pubIds)
    : { data: [] };

  const photoMap: Record<string, string | null> = Object.fromEntries(
    (pubFotos ?? []).map((p) => [p.id, p.photo ?? null])
  );

  const propuestasConFoto = (propuestas ?? []).map((p) => ({
    ...p,
    photo: photoMap[p.publicacion_id] ?? null,
  }));

  return (
    <OferenteView
      propuestas={propuestasConFoto}
      nombre={nombre}
      apellido={apellido}
      email={email}
    />
  );
}
