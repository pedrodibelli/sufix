"use server";

import { createSupabaseServer } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { enviarMail } from "@/lib/mail";

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

  // Avisarle que ya está publicado. Va después del update y sin await sobre el
  // resultado del envío en el camino de error: si el mail falla, el técnico ya
  // quedó verificado igual — no queremos que un problema de Resend deshaga una
  // aprobación. enviarMail() nunca tira, devuelve false y loguea.
  const { data: perfil } = await admin
    .from("perfiles_profesionales")
    .select("nombre")
    .eq("user_id", userId)
    .maybeSingle();
  const { data: userRes } = await admin.auth.admin.getUserById(userId);
  const emailTecnico = userRes?.user?.email;
  if (emailTecnico) {
    const primerNombre = (perfil?.nombre ?? "").trim().split(" ")[0] || "Hola";
    await enviarMail({
      para: emailTecnico,
      asunto: "Tu perfil ya está publicado en Sufix",
      html: `
        <p style="margin:0 0 14px;font-size:17px;font-weight:600;">${primerNombre}, tu perfil ya está publicado</p>
        <p style="margin:0 0 14px;">Lo revisamos y desde ahora aparecés en el directorio de Sufix. Los clientes de tu zona pueden verte y escribirte por WhatsApp directo.</p>
        <p style="margin:0 0 20px;color:#5A6B5C;">Si querés que te encuentren más fácil, sumale una foto y contá tus años de oficio desde tu perfil.</p>
        <p style="margin:0;">
          <a href="https://sufixapp.com/tecnico/${userId}" style="display:inline-block;background:#4E7A3E;color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:600;font-size:14px;">Ver mi perfil</a>
        </p>`,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}
