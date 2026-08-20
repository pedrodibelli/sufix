"use server";

import { createSupabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// Reseña directa: cualquier usuario logueado puede calificar a cualquier
// técnico desde su perfil público, sin pasar por publicar/cerrar un trabajo
// (el flujo viejo sigue en app/mis-consultas, pero pausado). Un review por
// usuario por técnico — volver a enviar actualiza la reseña anterior.
export async function crearResenaDirecta(
  tecnicoId: string,
  estrellas: number,
  comentario: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Necesitás iniciar sesión para calificar." };

  const { error } = await supabase.rpc("crear_resena_directa", {
    p_tecnico_id: tecnicoId,
    p_estrellas: estrellas,
    p_comentario: comentario,
  });
  if (error) return { error: error.message };

  revalidatePath(`/tecnico/${tecnicoId}`);
  revalidatePath("/");
  return { ok: true };
}

// Registro de "alguien tocó Contactar por WhatsApp" — con cuenta o sin ella.
// Best-effort a propósito: si falla, no tiene que romper ni demorar el clic
// (el link de WhatsApp ya se abrió solo, esto corre en paralelo).
//
// Supabase (contactos_tecnico) es la fuente de verdad — se guarda siempre.
// Además, si está seteado ZAPIER_CONTACTO_WEBHOOK_URL, se manda una copia a
// un Sheet en vivo (vía Zap: Catch Hook → Create Spreadsheet Row) para que
// el equipo lo mire sin entrar a Supabase. Si no está seteada la env var, se
// saltea sin romper nada — mismo patrón que RESEND_API_KEY/WEBHOOK_SECRET.
export async function registrarContacto(
  tecnicoId: string,
  origen: "home" | "perfil"
): Promise<void> {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("contactos_tecnico").insert({
      tecnico_id: tecnicoId,
      contactado_por: user?.id ?? null,
      origen,
    });

    const webhookUrl = process.env.ZAPIER_CONTACTO_WEBHOOK_URL;
    if (!webhookUrl) return;

    const [{ data: perfil }] = await Promise.all([
      supabase.from("perfiles_profesionales").select("nombre, rubro, zona").eq("user_id", tecnicoId).maybeSingle(),
    ]);

    const contactadoPor = user
      ? [user.user_metadata?.nombre, user.user_metadata?.apellido].filter(Boolean).join(" ") || user.email || "Usuario logueado"
      : "Anónimo (sin cuenta)";

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tecnico_nombre: perfil?.nombre ?? "Desconocido",
        tecnico_rubro: Array.isArray(perfil?.rubro) ? perfil.rubro.join(", ") : "",
        tecnico_zona: perfil?.zona ?? "",
        contactado_por: contactadoPor,
        origen,
        fecha: new Date().toISOString(),
      }),
    }).catch(() => {});
  } catch {
    // silencioso a propósito
  }
}
