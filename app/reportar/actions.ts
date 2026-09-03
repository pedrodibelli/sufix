"use server";

import { createSupabaseServer } from "@/lib/supabase-server";

// Reporte general (2026-09-03). A diferencia del reporte de un perfil
// (app/tecnico/[id]/actions.ts), este EXIGE cuenta: es una conversación,
// no una alerta anónima — si alguien reporta un problema o deja una
// sugerencia, queremos poder responderle. Pedido explícito del usuario.
export async function enviarReporteGeneral(
  tipo: string,
  detalle: string
): Promise<{ ok: true } | { error: string }> {
  if (!["tecnico", "web", "sugerencia"].includes(tipo)) {
    return { error: "Elegí de qué se trata." };
  }
  if (detalle.trim().length < 10) {
    return { error: "Contanos un poco más para poder ayudarte." };
  }

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Necesitás iniciar sesión para enviar un reporte." };

  const { error } = await supabase.from("reportes").insert({
    tipo,
    tecnico_id: null,
    reportado_por: user.id,
    motivo: tipo,
    detalle: detalle.trim().slice(0, 1500),
  });

  if (error) return { error: "No se pudo enviar. Probá de nuevo en un momento." };
  return { ok: true };
}
