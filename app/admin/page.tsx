import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createSupabaseServer } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/admin";
import { AdminClient, type PagoEnRevision } from "./AdminClient";

export const revalidate = 0;

export default async function AdminPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  // Solo el admin puede ver esta página. notFound() para no revelar que existe.
  if (!isAdminEmail(user?.email)) notFound();

  const { data, error } = await supabase.rpc("listar_pagos_en_revision");
  const pagos = (data ?? []) as PagoEnRevision[];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f5fdf9]">
        <div className="container-pad py-10">
          <h1 className="display text-2xl">Pagos en revisión</h1>
          <p className="mt-1 text-sm text-ink-400">
            Verificá el comprobante en WhatsApp y aprobá o rechazá cada pago. Al aprobar,
            se desbloquea el contacto del profesional y se genera el código.
          </p>

          {error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
              No se pudo cargar la lista: {error.message}. ¿Corriste la migración SQL
              (<code>20260620_pago_en_revision.sql</code>)?
            </div>
          ) : (
            <AdminClient pagos={pagos} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
