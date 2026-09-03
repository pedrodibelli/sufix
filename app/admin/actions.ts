"use server";

import { createSupabaseServer } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/admin";
import { revalidatePath } from "next/cache";

export async function aprobarPago(
  propuestaId: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) return { error: "No autorizado" };

  const { error } = await supabase.rpc("aprobar_pago", {
    p_propuesta_id: propuestaId,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}

export async function rechazarPago(
  propuestaId: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) return { error: "No autorizado" };

  const { error } = await supabase.rpc("rechazar_pago", {
    p_propuesta_id: propuestaId,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}

export async function resolverDisputa(
  disputaId: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) return { error: "No autorizado" };

  const { error } = await supabase.rpc("resolver_disputa", {
    p_disputa_id: disputaId,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}

// Marcar un reporte como revisado (2026-09-03). Doble control a propósito: se
// valida el email acá Y la RLS de la tabla solo deja actualizar a los mails de
// admin (ver migración 20260903e), así un error en esta validación no alcanza
// para que cualquiera pueda tocar los reportes.
export async function marcarReporteRevisado(
  id: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) return { error: "No autorizado" };

  const { error } = await supabase
    .from("reportes")
    .update({ estado: "revisado" })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { ok: true };
}
