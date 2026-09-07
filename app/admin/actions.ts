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

// Aprobar un técnico que se registró solo por la web (2026-09-07).
//
// Va con service role y no con el cliente autenticado a propósito: la policy
// `perfil_owner` de perfiles_profesionales es FOR ALL USING (auth.uid() =
// user_id), o sea que ni el admin puede tocar el perfil de otro. Saltear RLS
// acá es la única forma, así que el control es el isAdminEmail() de abajo.
export async function verificarTecnico(
  userId: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) return { error: "No autorizado" };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return { error: "Falta SUPABASE_SERVICE_ROLE_KEY en el entorno." };

  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { error } = await admin
    .from("perfiles_profesionales")
    .update({ verificado: true })
    .eq("user_id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}
