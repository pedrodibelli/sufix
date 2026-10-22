"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { clienteAdmin } from "@/lib/supabaseAdmin";
import { esUuid } from "@/lib/contactantes";
import { MOTIVOS_NO_CONTRATADO } from "./motivos";

// Reseña con el link del mail de seguimiento, sin cuenta (2026-10-22, ver
// CLAUDE.md §24). El token ES la autorización: sólo le llega por mail a quien
// contactó a ese técnico, sirve para ese técnico y nada más, y vence a los 30
// días. Todo con service role porque invitaciones_resena no tiene policies.

type Invitacion = { id: string; tecnico_id: string; vence_at: string; resena_id: string | null };

async function invitacionVigente(
  admin: SupabaseClient,
  token: string
): Promise<Invitacion | { error: string }> {
  if (!esUuid(token)) return { error: "El link no es válido." };
  const { data } = await admin
    .from("invitaciones_resena")
    .select("id, tecnico_id, vence_at, resena_id")
    .eq("token", token)
    .maybeSingle();
  if (!data) return { error: "El link no es válido." };
  if (Date.parse(data.vence_at) < Date.now()) return { error: "Este link venció." };
  return data as Invitacion;
}

export async function enviarResenaConLink(
  token: string,
  estrellas: number,
  comentario: string,
  nombre: string
): Promise<{ ok: true } | { error: string }> {
  if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) return { error: "Elegí cuántas estrellas." };
  const admin = clienteAdmin();
  if (!admin) return { error: "No se pudo guardar. Probá de nuevo en un rato." };

  const inv = await invitacionVigente(admin, token);
  if ("error" in inv) return inv;

  const ahora = new Date().toISOString();
  // Misma forma que las reseñas cargadas a mano: autor_id NULL y el nombre que
  // la persona quiera mostrar (o "Cliente" si lo deja vacío, ver /tecnico/[id]).
  const datos = {
    estrellas,
    comentario: comentario.trim().slice(0, 1000) || null,
    autor_nombre: nombre.trim().slice(0, 40) || null,
  };

  let resenaId = inv.resena_id;
  if (resenaId) {
    // Volvió a entrar al link: se corrige su reseña, no se suma otra.
    const { error } = await admin.from("resenas").update({ ...datos, creado_at: ahora }).eq("id", resenaId);
    if (error) return { error: "No se pudo guardar la reseña. Probá de nuevo." };
  } else {
    const { data, error } = await admin
      .from("resenas")
      .insert({ tecnico_id: inv.tecnico_id, autor_id: null, ...datos })
      .select("id")
      .single();
    if (error || !data) return { error: "No se pudo guardar la reseña. Probá de nuevo." };
    resenaId = data.id as string;
  }

  await admin
    .from("invitaciones_resena")
    .update({ resena_id: resenaId, respuesta: "contratado", respondida_at: ahora })
    .eq("id", inv.id);

  revalidatePath(`/tecnico/${inv.tecnico_id}`);
  revalidatePath("/");
  return { ok: true };
}

export async function responderNoContratado(
  token: string,
  motivo: string
): Promise<{ ok: true } | { error: string }> {
  const admin = clienteAdmin();
  if (!admin) return { error: "No se pudo guardar. Probá de nuevo en un rato." };

  const inv = await invitacionVigente(admin, token);
  if ("error" in inv) return inv;
  // Si ya dejó reseña, "lo contraté" es lo que vale: no se pisa.
  if (inv.resena_id) return { ok: true };

  const valido = MOTIVOS_NO_CONTRATADO.some((m) => m.value === motivo);
  const { error } = await admin
    .from("invitaciones_resena")
    .update({ respuesta: "no_contratado", motivo: valido ? motivo : null, respondida_at: new Date().toISOString() })
    .eq("id", inv.id);
  if (error) return { error: "No se pudo guardar. Probá de nuevo." };
  return { ok: true };
}
