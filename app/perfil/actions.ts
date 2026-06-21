"use server";

import { createSupabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function actualizarPerfil(data: {
  telefono: string;
  zona: string;
  rubro: string;
}): Promise<{ ok: true } | { error: string }> {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { error } = await supabase
    .from("perfiles_profesionales")
    .update({
      telefono: data.telefono.trim() || null,
      zona: data.zona || null,
      rubro: data.rubro || null,
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/perfil");
  revalidatePath(`/tecnico/${user.id}`);
  return { ok: true };
}
