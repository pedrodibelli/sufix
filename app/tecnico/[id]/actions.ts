"use server";

import { createSupabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { clienteAdmin } from "@/lib/supabaseAdmin";
import { emailValido, normalizarEmail } from "@/lib/email";
import {
  enviarConsejosSiCorresponde,
  esUuid,
  limpiarTelefono,
  obtenerOCrearContactante,
  type Contactante,
} from "@/lib/contactantes";

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
//
// Mail del contacto (2026-10-22, ver CLAUDE.md §24): sin sesión, el pop-up
// pide el mail antes de abrir WhatsApp y llega acá en `datos`. Con sesión no
// hay pop-up y se usa el mail de la cuenta. Con ese mail se le cuelga el
// contacto a un `contactante`, que es lo que habilita los consejos de
// seguridad (ya) y el "¿cómo te fue?" (a los 7 días, /api/cron/seguimiento).
export async function registrarContacto(
  tecnicoId: string,
  origen: "home" | "perfil" | "consultas",
  datos?: { email?: string; telefono?: string; aceptaNovedades?: boolean; aperturaId?: string }
): Promise<void> {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    const admin = clienteAdmin();

    // No se confía en el navegador: si el mail del pop-up no es válido se
    // ignora, y si hay sesión gana el de la cuenta (que ya está confirmado).
    const emailPopup = normalizarEmail(datos?.email ?? "");
    const email = user?.email
      ? normalizarEmail(user.email)
      : emailValido(emailPopup) ? emailPopup : "";

    let contactante: Contactante | null = null;
    if (admin && email) {
      contactante = await obtenerOCrearContactante(admin, {
        email,
        telefono: limpiarTelefono(datos?.telefono),
        aceptaNovedades: datos?.aceptaNovedades === true,
      });
    }

    const fila = {
      tecnico_id: tecnicoId,
      contactado_por: user?.id ?? null,
      origen,
    };
    // contactante_id sólo lo puede escribir el service role (ver la policy de
    // INSERT en la migración 20261022). Sin la key, se guarda el clic pelado,
    // como antes.
    const { error: errorAdmin } = admin
      ? await admin.from("contactos_tecnico").insert({ ...fila, contactante_id: contactante?.id ?? null })
      : { error: true };
    // Si el insert con service role falló por lo que sea, el clic se guarda
    // igual por la vía de siempre: el registro del contacto no se pierde.
    if (errorAdmin) await supabase.from("contactos_tecnico").insert(fila);

    // El pop-up se abrió y la persona siguió: así se mide cuánta gente se
    // pierde en el pop-up (ver registrarAperturaPopup).
    const aperturaId = datos?.aperturaId;
    if (admin && esUuid(aperturaId)) {
      await admin
        .from("aperturas_popup_contacto")
        .upsert({ id: aperturaId, tecnico_id: tecnicoId, continuo_at: new Date().toISOString() });
    }

    // Después de responder: el mail no tiene por qué demorar nada.
    if (admin && contactante) {
      const c = contactante;
      after(() => enviarConsejosSiCorresponde(admin, c, tecnicoId).catch(() => {}));
    }

    const webhookUrl = process.env.ZAPIER_CONTACTO_WEBHOOK_URL;
    if (!webhookUrl) return;

    const [{ data: perfil }] = await Promise.all([
      supabase.from("perfiles_profesionales").select("nombre, rubro, zona").eq("user_id", tecnicoId).maybeSingle(),
    ]);

    const contactadoPor = user
      ? [user.user_metadata?.nombre, user.user_metadata?.apellido].filter(Boolean).join(" ") || user.email || "Usuario logueado"
      : email
        // El mail en sí no viaja a Zapier/Google Sheets: la política de
        // privacidad sólo nombra a Supabase, Vercel y Resend. Está en /admin.
        ? "Sin cuenta (dejó su mail)"
        : "Anónimo (sin cuenta)";

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tecnico_nombre: perfil?.nombre ?? "Desconocido",
        tecnico_rubro: Array.isArray(perfil?.rubro) ? perfil.rubro.join(", ") : "",
        tecnico_zona: Array.isArray(perfil?.zona) ? perfil.zona.join(", ") : "",
        contactado_por: contactadoPor,
        origen,
        fecha: new Date().toISOString(),
      }),
    }).catch(() => {});
  } catch {
    // silencioso a propósito
  }
}

// Se abrió el pop-up del mail (2026-10-22). Junto con el `continuo_at` que
// marca registrarContacto, da la cuenta de cuánta gente cierra el pop-up sin
// seguir — la medición de si pedir el mail obligatorio espanta gente. El id
// lo genera el navegador: si "siguió" llega antes que "se abrió", el upsert
// de acá no pisa nada (ignoreDuplicates).
export async function registrarAperturaPopup(tecnicoId: string, aperturaId: string): Promise<void> {
  try {
    const admin = clienteAdmin();
    if (!admin || !esUuid(aperturaId) || !esUuid(tecnicoId)) return;
    await admin
      .from("aperturas_popup_contacto")
      .upsert({ id: aperturaId, tecnico_id: tecnicoId }, { onConflict: "id", ignoreDuplicates: true });
  } catch {
    // silencioso a propósito
  }
}

// Reporte de un perfil (2026-09-03). Puede reportar cualquiera, con o sin
// cuenta — quien detecta un teléfono falso capaz ni tiene usuario, mismo
// criterio que contactos_tecnico. La tabla `reportes` solo tiene policy de
// SELECT para los mails de admin (migración 20260903e): se insertan desde
// acá y se leen solo en /admin, así un técnico no puede ver quién lo reportó.
export async function reportarPerfil(
  tecnicoId: string,
  motivo: string,
  detalle: string
): Promise<{ ok: true } | { error: string }> {
  if (!motivo.trim()) return { error: "Elegí un motivo." };

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("reportes").insert({
    tecnico_id: tecnicoId,
    reportado_por: user?.id ?? null,
    motivo,
    detalle: detalle.trim() ? detalle.trim().slice(0, 500) : null,
  });

  if (error) return { error: "No se pudo enviar el reporte. Probá de nuevo." };
  return { ok: true };
}
