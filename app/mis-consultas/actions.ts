"use server";

import { createSupabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// El demandante declara que hizo la transferencia. NO desbloquea el contacto:
// deja la propuesta en revisión hasta que un admin verifique el comprobante.
export async function declararPago(
  propuestaId: string,
  publicacionId: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();

  // Verificar que la publicación pertenece al usuario autenticado
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: pub } = await supabase
    .from("publicaciones")
    .select("user_id, status")
    .eq("id", publicacionId)
    .single();

  if (!pub || pub.user_id !== user.id) return { error: "No autorizado" };

  const now = new Date().toISOString();

  const [{ error: errProp }, { error: errPub }] = await Promise.all([
    supabase.from("propuestas").update({
      estado: "pago_en_revision",
      pago_revision_at: now,
    }).eq("id", propuestaId),
    // en_revision: pago declarado, pendiente de verificación. Bloquea aceptar otra propuesta.
    supabase.from("publicaciones").update({ status: "en_revision" }).eq("id", publicacionId),
  ]);

  if (errProp) return { error: `Error al registrar el pago: ${errProp.message}` };
  if (errPub)  console.error("[declararPago] publicaciones update:", errPub.message);

  revalidatePath("/mis-consultas");
  return { ok: true };
}

export async function rechazarPropuesta(propuestaId: string) {
  const supabase = await createSupabaseServer();
  await supabase.from("propuestas").update({ estado: "rechazada" }).eq("id", propuestaId);
  revalidatePath("/mis-consultas");
}

// El demandante califica al técnico de un trabajo cerrado.
export async function crearResena(
  publicacionId: string,
  estrellas: number,
  comentario: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.rpc("crear_resena", {
    p_publicacion_id: publicacionId,
    p_estrellas: estrellas,
    p_comentario: comentario,
  });
  if (error) return { error: error.message };

  revalidatePath("/mis-consultas");
  return { ok: true };
}

// Elimina una publicación propia que esté ABIERTA (sin trato en curso).
export async function eliminarPublicacion(
  publicacionId: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase.rpc("eliminar_publicacion", { p_id: publicacionId });
  if (error) return { error: error.message };

  revalidatePath("/mis-consultas");
  return { ok: true };
}

export async function confirmarCodigo(
  propuestaId: string,
  codigo: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Solo el profesional dueño de la propuesta puede confirmarla
  const { data: propuesta } = await supabase
    .from("propuestas")
    .select("profesional_id, codigo_pago, publicacion_id, estado")
    .eq("id", propuestaId)
    .single();

  if (!propuesta) return { error: "Propuesta no encontrada" };
  if (propuesta.profesional_id !== user.id) return { error: "No autorizado" };
  if (propuesta.estado !== "aceptada") return { error: "La propuesta no está en estado correcto" };

  // Comparación exacta — no se loguea el código correcto
  if (propuesta.codigo_pago !== codigo.trim()) {
    return { error: "Código incorrecto. Pedíselo al demandante cuando el servicio esté completo." };
  }

  const now = new Date().toISOString();

  const [{ error: errProp }, { error: errPub }] = await Promise.all([
    supabase.from("propuestas").update({
      estado: "completada",
      codigo_ingresado_at: now,
    }).eq("id", propuestaId),
    supabase.from("publicaciones").update({
      status: "cerrado",
      cerrada_at: now,
    }).eq("id", propuesta.publicacion_id),
  ]);

  if (errProp) return { error: `Error al confirmar: ${errProp.message}` };
  if (errPub)  console.error("[confirmarCodigo] publicaciones update:", errPub.message);

  revalidatePath("/mis-consultas");
  return { ok: true };
}

export async function reportarProblema(
  propuestaId: string,
  publicacionId: string,
  motivo: string,
  rol: "demandante" | "oferente"
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Verificar que el usuario es parte de esta propuesta
  const { data: propuesta } = await supabase
    .from("propuestas")
    .select("profesional_id, publicacion_id, estado")
    .eq("id", propuestaId)
    .single();

  if (!propuesta) return { error: "Propuesta no encontrada" };

  if (rol === "oferente" && propuesta.profesional_id !== user.id)
    return { error: "No autorizado" };

  if (rol === "demandante") {
    const { data: pub } = await supabase
      .from("publicaciones")
      .select("user_id")
      .eq("id", publicacionId)
      .single();
    if (!pub || pub.user_id !== user.id) return { error: "No autorizado" };
  }

  const estadosValidos = ["aceptada", "completada", "en_disputa"];
  if (!estadosValidos.includes(propuesta.estado ?? ""))
    return { error: "No podés reportar un problema en el estado actual" };

  const { error: errDisputa } = await supabase.from("disputas").insert({
    propuesta_id: propuestaId,
    publicacion_id: publicacionId,
    autor_id: user.id,
    rol,
    motivo: motivo.trim(),
  });

  if (errDisputa) return { error: `Error al reportar: ${errDisputa.message}` };

  await supabase
    .from("publicaciones")
    .update({ status: "en_disputa" })
    .eq("id", publicacionId);

  revalidatePath("/mis-consultas");
  return { ok: true };
}
