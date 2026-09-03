import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createSupabaseServer } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/admin";
import { ReportesClient, type Reporte } from "./ReportesClient";
// AdminClient/DisputasClient (pagos en revisión y disputas) quedan sin usar
// a propósito — ver comentario más abajo. No se borran, listos para
// reactivar si se vuelve al flujo viejo (tag de git
// idea-publicar-problema-2026-08-20).
// import { AdminClient, DisputasClient, type PagoEnRevision, type Disputa } from "./AdminClient";

export const revalidate = 0;

export default async function AdminPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  // Solo el admin puede ver esta página. notFound() para no revelar que existe.
  if (!isAdminEmail(user?.email)) notFound();

  // "Pagos en revisión" y "Disputas" dependían las dos del flujo viejo
  // (publicar problema -> propuesta -> pago/en_curso -> reportar problema).
  // Con el pivot a directorio de técnicos (ver CLAUDE.md) ese flujo dejó de
  // ser alcanzable desde la web — DemandanteView.tsx/OferenteView.tsx (los
  // únicos lugares con el botón de "Reportar un problema") ya no se
  // renderizan en ningún lado. No tiene sentido dejar estas dos secciones
  // activas si nadie puede generarles datos nuevos. Se pausan las dos juntas,
  // no solo "pagos" — código y RPCs intactos, solo se dejó de llamarlos acá.

  // Reportes (2026-09-03). Se leen con el cliente autenticado: la migración
  // 20260903e agrega una policy de SELECT solo para los mails de admin, así
  // que la base también valida quién puede verlos, no solo el isAdminEmail()
  // de arriba.
  const { data: filas } = await supabase
    .from("reportes")
    .select("id, tipo, motivo, detalle, estado, creado_at, tecnico_id, reportado_por")
    .eq("estado", "pendiente")
    .order("creado_at", { ascending: false })
    .limit(100);

  const reportes: Reporte[] = [];

  if (filas && filas.length > 0) {
    // Nombre del técnico reportado (los de tipo web/sugerencia no tienen).
    const tecnicoIds = [...new Set(filas.map((f) => f.tecnico_id).filter(Boolean))] as string[];
    const nombrePorId = new Map<string, string>();
    if (tecnicoIds.length > 0) {
      const { data: perfiles } = await supabase
        .from("perfiles_publicos")
        .select("user_id, nombre")
        .in("user_id", tecnicoIds);
      for (const p of perfiles ?? []) nombrePorId.set(p.user_id, p.nombre);
    }

    // Email de quien reportó. Vive en auth.users, que no es legible con la
    // anon key ni con RLS — hace falta el service role. Si la env var no está
    // seteada, el panel sigue funcionando y solo se muestra sin el email
    // (mismo criterio degradado que ya usamos en mis-consultas/actions.ts).
    const autorIds = [...new Set(filas.map((f) => f.reportado_por).filter(Boolean))] as string[];
    const emailPorId = new Map<string, string>();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (autorIds.length > 0 && url && serviceKey) {
      const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
      await Promise.all(
        autorIds.map(async (id) => {
          const { data } = await admin.auth.admin.getUserById(id);
          if (data?.user?.email) emailPorId.set(id, data.user.email);
        })
      );
    }

    for (const f of filas) {
      reportes.push({
        id: f.id,
        tipo: f.tipo,
        motivo: f.motivo,
        detalle: f.detalle,
        estado: f.estado,
        creado_at: f.creado_at,
        tecnico_id: f.tecnico_id,
        tecnico_nombre: f.tecnico_id ? nombrePorId.get(f.tecnico_id) ?? null : null,
        reportado_por_email: f.reportado_por ? emailPorId.get(f.reportado_por) ?? null : null,
      });
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FBF8EF]">
        <div className="container-pad py-10">
          <h1 className="display text-2xl">Panel de administración</h1>

          <section className="mt-8">
            <div className="flex items-baseline gap-3">
              <h2 className="display text-lg">Reportes</h2>
              {reportes.length > 0 && (
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[12px] font-semibold text-rose-600">
                  {reportes.length} pendiente{reportes.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-ink-500">
              Problemas con un técnico, con el sitio y sugerencias. Los reportes de perfil
              pueden llegar sin cuenta; el resto siempre tiene un usuario detrás.
            </p>
            <ReportesClient reportes={reportes} />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
