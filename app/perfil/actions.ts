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
  zona: string;
  rubro: string[];
  titular: string;
}): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("perfiles_profesionales")
    .update({
      telefono: data.telefono.trim() || null,
      zona: data.zona || null,
      rubro: data.rubro.length > 0 ? data.rubro : null,
      titular: data.titular.trim() || null,
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
