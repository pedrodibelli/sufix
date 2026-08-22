import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createSupabaseServer } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/admin";
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f5fdf9]">
        <div className="container-pad py-10">
          <h1 className="display text-2xl">Panel de administración</h1>

          <div className="mt-8 rounded-2xl border border-dashed border-ink-200 p-10 text-center text-ink-400">
            <p className="text-sm">
              "Pagos en revisión" y "Disputas" están pausadas — dependían del flujo viejo de
              publicar un problema, que ya no es alcanzable desde la web.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
