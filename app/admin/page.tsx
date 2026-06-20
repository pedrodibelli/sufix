import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createSupabaseServer } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/admin";
import { AdminClient, DisputasClient, type PagoEnRevision, type Disputa } from "./AdminClient";

export const revalidate = 0;

export default async function AdminPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  // Solo el admin puede ver esta página. notFound() para no revelar que existe.
  if (!isAdminEmail(user?.email)) notFound();

  const [{ data: pagosData, error: pagosError }, { data: disputasData, error: disputasError }] =
    await Promise.all([
      supabase.rpc("listar_pagos_en_revision"),
      supabase.rpc("listar_disputas"),
    ]);

  const pagos = (pagosData ?? []) as PagoEnRevision[];
  const disputas = (disputasData ?? []) as Disputa[];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f5fdf9]">
        <div className="container-pad py-10">
          <h1 className="display text-2xl">Panel de administración</h1>

          {/* Pagos en revisión */}
          <section className="mt-8">
            <h2 className="display text-xl">Pagos en revisión</h2>
            <p className="mt-1 text-sm text-ink-400">
              Verificá el comprobante en WhatsApp y aprobá o rechazá cada pago. Al aprobar,
              se desbloquea el contacto del profesional y se genera el código.
            </p>
            {pagosError ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
                No se pudo cargar la lista: {pagosError.message}. ¿Corriste la migración SQL
                (<code>20260620_pago_en_revision.sql</code>)?
              </div>
            ) : (
              <AdminClient pagos={pagos} />
            )}
          </section>

          {/* Disputas */}
          <section className="mt-12">
            <h2 className="display text-xl">Disputas abiertas</h2>
            <p className="mt-1 text-sm text-ink-400">
              Problemas reportados por demandantes o técnicos. Resolvé la situación y marcala como resuelta.
            </p>
            {disputasError ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
                No se pudo cargar la lista: {disputasError.message}. ¿Corriste la migración SQL
                (<code>20260620_disputas_admin.sql</code>)?
              </div>
            ) : (
              <DisputasClient disputas={disputas} />
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
