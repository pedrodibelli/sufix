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
  } catch {
    // silencioso a propósito
  }
}
