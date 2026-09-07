"use server";

import { createSupabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

// Datos de cuenta (demandante o cualquiera): nombre y apellido (en user_metadata).
export async function actualizarDatosCuenta(data: {
  nombre: string;
  apellido: string;
}): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const meta = user.user_metadata ?? {};
  const { error } = await supabase.auth.updateUser({
    data: { ...meta, nombre: data.nombre.trim(), apellido: data.apellido.trim() },
  });
  if (error) return { error: error.message };

  revalidatePath("/perfil");
  return { ok: true };
}

// Foto de perfil (demandante o técnico). Se guarda en user_metadata para que
// el propio usuario se vea reflejado al toque (Header, /perfil) sin queries
// extra; si es técnico, además se duplica en perfiles_profesionales.foto_url
// para que sea visible en su perfil público y en las tarjetas de contacto
// (mismo patrón que `nombre`). Compartido por subir y quitar (url = null).
async function guardarAvatarUrl(url: string | null): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const meta = user.user_metadata ?? {};
  const { error: metaError } = await supabase.auth.updateUser({
    data: { ...meta, avatar_url: url },
  });
  if (metaError) return { error: metaError.message };

  if (meta.es_profesional === true) {
    const { error: tablaError } = await supabase
      .from("perfiles_profesionales")
      .update({ foto_url: url })
      .eq("user_id", user.id);
    if (tablaError) return { error: tablaError.message };
  }

  revalidatePath("/perfil");
  revalidatePath("/mis-consultas");
  revalidatePath(`/tecnico/${user.id}`);
  revalidatePath("/");
  return { ok: true };
}

// El archivo ya se subió al bucket `avatars` desde el cliente (AvatarUpload)
// — acá solo guardamos la URL resultante.
export async function actualizarAvatar(url: string): Promise<{ ok: true } | { error: string }> {
  return guardarAvatarUrl(url);
}

// Quita la foto de perfil: borra el archivo del bucket y limpia la URL
// guardada. Vuelve a mostrarse el círculo de iniciales.
export async function eliminarAvatar(): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // No falla si el archivo no existe — simplemente no borra nada.
  await supabase.storage.from("avatars").remove([`${user.id}/avatar`]);

  return guardarAvatarUrl(null);
}

export async function actualizarPerfil(data: {
  telefono: string;
  zona: string[];
  rubro: string[];
  titular: string;
  anosExperiencia: string;
}): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const anos = data.anosExperiencia.trim();
  if (anos && (!/^\d+$/.test(anos) || Number(anos) > 80)) {
    return { error: "Los años de experiencia tienen que ser un número (0-80)." };
  }

  const { error } = await supabase
    .from("perfiles_profesionales")
    .update({
      telefono: data.telefono.trim() || null,
      zona: data.zona.length > 0 ? data.zona : null,
      rubro: data.rubro.length > 0 ? data.rubro : null,
      titular: data.titular.trim() || null,
      anos_experiencia: anos ? Number(anos) : null,
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/perfil");
  revalidatePath(`/tecnico/${user.id}`);
  return { ok: true };
}

// Cambiar contraseña (demandante o técnico). Pide la contraseña actual antes
// de cambiarla — no porque Supabase lo exija (alcanza con la sesión activa),
// sino como resguardo: útil sobre todo para cuentas creadas a mano por el
// equipo con una contraseña temporal mandada por WhatsApp, donde no podemos
// asumir que solo el dueño la vio.
export async function cambiarPassword(data: {
  passwordActual: string;
  passwordNueva: string;
}): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return { error: "No autenticado" };

  if (data.passwordNueva.length < 8) {
    return { error: "La contraseña nueva debe tener al menos 8 caracteres." };
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: data.passwordActual,
  });
  if (verifyError) return { error: "La contraseña actual no es correcta." };

  const { error } = await supabase.auth.updateUser({ password: data.passwordNueva });
  if (error) return { error: error.message };

  return { ok: true };
}

// ── Borrar la cuenta ────────────────────────────────────────────────────
//
// No existía para ningún rol (2026-09-07). La política de privacidad ya
// promete la baja total escribiendo a sufixar@gmail.com, así que además de
// ser lo esperable, tenerlo acá es cumplir lo que dice el sitio sin que
// nadie tenga que mandar un mail.
//
// Hace falta la service role key: borrar el propio usuario de auth.users no
// se puede con la anon key. El id NUNCA viene del cliente — sale de la
// sesión — así que esta función solo puede borrar a quien la llama.
export async function borrarCuenta(
  confirmacion: string
): Promise<{ ok: true } | { error: string }> {
  if (confirmacion.trim().toUpperCase() !== "BORRAR") {
    return { error: 'Escribí BORRAR para confirmar.' };
  }

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Se cerró tu sesión. Volvé a entrar e intentá de nuevo." };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return { error: "No podemos procesar la baja ahora. Escribinos a sufixar@gmail.com." };
  }
  const { createClient } = await import("@supabase/supabase-js");
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // `resenas` no tiene FK contra auth.users (ver 20260621_resenas.sql: tecnico_id
  // y autor_id son uuid sueltos), así que no se van solas con el cascade. Se
  // borran las que escribió y las que recibió: las primeras llevan su nombre
  // (autor_nombre) y las segundas califican a un perfil que deja de existir.
  await admin.from("resenas").delete().eq("autor_id", user.id);
  await admin.from("resenas").delete().eq("tecnico_id", user.id);

  // La foto vive fuera de la base, en Storage — el cascade no la toca.
  await admin.storage.from("avatars").remove([`${user.id}/avatar`]);

  // perfiles_profesionales SÍ tiene ON DELETE CASCADE, así que la tarjeta del
  // directorio se va sola al borrar el usuario. Se borra igual acá primero:
  // si por lo que sea el cascade no estuviera aplicado en la base, no queremos
  // dejar un perfil público huérfano de una cuenta que ya no existe.
  await admin.from("perfiles_profesionales").delete().eq("user_id", user.id);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: "No se pudo borrar la cuenta. Escribinos a sufixar@gmail.com." };

  await supabase.auth.signOut();
  return { ok: true };
}
