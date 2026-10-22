import { promises as dns } from "node:dns";
import type { SupabaseClient } from "@supabase/supabase-js";
import { APP_URL } from "@/lib/appUrl";
import { enviarMail } from "@/lib/mail";
import { toTitleCase } from "@/lib/format";
import { telefonoWhatsApp } from "@/lib/whatsapp";
import { clienteAdmin } from "@/lib/supabaseAdmin";

// Mails de quienes contactan técnicos (2026-10-22, ver CLAUDE.md §24).
// SOLO servidor: todo pasa por el cliente con service role, porque las
// tablas `contactantes` e `invitaciones_resena` no tienen ninguna policy.

export type Contactante = {
  id: string;
  email: string;
  telefono: string | null;
  acepta_novedades: boolean;
  mail_invalido: boolean;
  consejos_enviados_at: string | null;
  baja_at: string | null;
  token_baja: string;
};

const CAMPOS = "id, email, telefono, acepta_novedades, mail_invalido, consejos_enviados_at, baja_at, token_baja";

export function urlsBaja(tokenBaja: string) {
  return { url: `${APP_URL}/baja/${tokenBaja}`, urlUnClic: `${APP_URL}/api/baja/${tokenBaja}` };
}

export function escaparHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function esUuid(s: unknown): s is string {
  return typeof s === "string" && UUID.test(s);
}

// El WhatsApp opcional del pop-up. Si es un celular argentino reconocible se
// guarda ya listo para wa.me; si no, los dígitos tal cual. Menos de 8
// dígitos no es un teléfono.
export function limpiarTelefono(raw?: string | null): string | null {
  const digitos = (raw ?? "").replace(/\D/g, "").slice(0, 15);
  if (digitos.length < 8) return null;
  return telefonoWhatsApp(digitos) ?? digitos;
}

/**
 * ¿El dominio del mail tiene dónde recibir correo? Se pregunta una sola vez,
 * al dar de alta el mail. Si dice que no ("juan@gmail.coom", "a@asd.com"),
 * no se le escribe nunca: el mail rebotaría y cada rebote le baja la
 * reputación a sufixapp.com.
 *
 * Ante la duda (DNS lento, error de red) dice que sí: es preferible un rebote
 * de más que dejar sin consejos ni seguimiento a alguien con un mail bueno.
 */
async function dominioRecibeMail(email: string): Promise<boolean> {
  const dominio = email.slice(email.lastIndexOf("@") + 1);
  const noExiste = (e: unknown) => {
    const code = (e as NodeJS.ErrnoException)?.code;
    return code === "ENOTFOUND" || code === "ENODATA";
  };
  try {
    const mx = await conTimeout(dns.resolveMx(dominio), 2500);
    if (mx.length > 0) return true;
  } catch (e) {
    if (!noExiste(e)) return true;
  }
  // Sin registro MX, la norma (RFC 5321) es entregar al registro A del dominio.
  try {
    const a = await conTimeout(dns.resolve4(dominio), 2500);
    return a.length > 0;
  } catch (e) {
    return !noExiste(e);
  }
}

function conTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rechazar) => setTimeout(() => rechazar(new Error("timeout")), ms)),
  ]);
}

/**
 * Busca el mail o lo da de alta. Si ya existía, suma el teléfono si ahora lo
 * dejó, y la casilla de novedades sólo puede pasar de NO a SÍ desde acá —
 * para dejar de recibir está el link de baja, no el pop-up.
 */
export async function obtenerOCrearContactante(
  admin: SupabaseClient,
  datos: { email: string; telefono: string | null; aceptaNovedades: boolean }
): Promise<Contactante | null> {
  const { data: existente } = await admin.from("contactantes").select(CAMPOS).eq("email", datos.email).maybeSingle();
  if (existente) {
    const c = existente as Contactante;
    const cambios: Partial<Contactante> = {};
    if (datos.telefono && datos.telefono !== c.telefono) cambios.telefono = datos.telefono;
    if (datos.aceptaNovedades && !c.acepta_novedades) cambios.acepta_novedades = true;
    if (Object.keys(cambios).length > 0) {
      await admin.from("contactantes").update(cambios).eq("id", c.id);
    }
    return { ...c, ...cambios };
  }

  const mailInvalido = !(await dominioRecibeMail(datos.email));
  const { data: nuevo, error } = await admin
    .from("contactantes")
    .insert({
      email: datos.email,
      telefono: datos.telefono,
      acepta_novedades: datos.aceptaNovedades,
      mail_invalido: mailInvalido,
    })
    .select(CAMPOS)
    .single();
  if (!error) return nuevo as Contactante;

  // Dos contactos casi simultáneos con el mismo mail: el otro ganó el INSERT
  // (violación del UNIQUE). Nos quedamos con el suyo.
  const { data: otro } = await admin.from("contactantes").select(CAMPOS).eq("email", datos.email).maybeSingle();
  return (otro as Contactante | null) ?? null;
}

/**
 * Baja de todos los mails (consejos, seguimiento y novedades). La usan la
 * página /baja/[token] y el POST de un clic de /api/baja/[token]. Devuelve
 * false sólo si el token no existe: darse de baja dos veces no es un error.
 */
export async function darDeBajaPorToken(token: string): Promise<boolean> {
  const admin = clienteAdmin();
  if (!admin || !esUuid(token)) return false;
  const { data } = await admin.from("contactantes").select("id, baja_at").eq("token_baja", token).maybeSingle();
  if (!data) return false;
  if (!data.baja_at) {
    const { error } = await admin.from("contactantes").update({ baja_at: new Date().toISOString() }).eq("id", data.id);
    if (error) return false;
  }
  return true;
}

/**
 * Mail de consejos de seguridad. Sale UNA vez por mail en toda la vida, con
 * el primer técnico que contacta.
 */
export async function enviarConsejosSiCorresponde(
  admin: SupabaseClient,
  c: Contactante,
  tecnicoId: string
): Promise<void> {
  if (c.mail_invalido || c.baja_at || c.consejos_enviados_at) return;

  // Se marca ANTES de mandar y con condición: si dos contactos llegan juntos,
  // sólo uno de los dos consigue marcarlo y manda. Sin esto salían dos mails.
  const { data: marcado } = await admin
    .from("contactantes")
    .update({ consejos_enviados_at: new Date().toISOString() })
    .eq("id", c.id)
    .is("consejos_enviados_at", null)
    .select("id");
  if (!marcado || marcado.length === 0) return;

  const { data: perfil } = await admin.from("perfiles_publicos").select("nombre").eq("user_id", tecnicoId).maybeSingle();
  const nombre = escaparHtml(toTitleCase(perfil?.nombre ?? "el técnico"));

  const ok = await enviarMail({
    para: c.email,
    asunto: `Unos consejos antes de contratar a ${toTitleCase(perfil?.nombre ?? "tu técnico")}`,
    html: htmlConsejos(nombre, tecnicoId),
    baja: urlsBaja(c.token_baja),
  });
  // Si no salió (Resend caído, key sin cargar), se desmarca: lo reintenta el
  // próximo contacto de esta persona.
  if (!ok) await admin.from("contactantes").update({ consejos_enviados_at: null }).eq("id", c.id);
}

function htmlConsejos(nombre: string, tecnicoId: string): string {
  const consejos = [
    ["Pedí el presupuesto por escrito", "antes de que empiece. Un mensaje de WhatsApp alcanza: qué incluye, cuánto sale y cuánto tarda."],
    ["No pagues todo por adelantado.", "Si hay que comprar materiales, una seña razonable; el resto, con el trabajo terminado."],
    ["Confirmá quién viene.", "Que la persona que llega sea la del perfil. Si manda a alguien de su equipo, que te avise antes."],
    ["Nunca compartas códigos", "que te lleguen por SMS o WhatsApp. Ni Sufix ni ningún técnico te los va a pedir."],
    ["Si algo no cuadra, avisanos.", "Desde el perfil del técnico podés reportarlo y lo revisa una persona de nuestro equipo."],
  ];
  return `
    <p style="margin:0 0 14px;font-size:17px;font-weight:600;">Ya podés hablar con ${nombre}</p>
    <p style="margin:0 0 16px;">Gracias por usar Sufix. Antes de cerrar nada, unos consejos que te pueden ahorrar un mal momento:</p>
    <ol style="margin:0 0 20px;padding-left:20px;">
      ${consejos.map(([fuerte, resto]) => `<li style="margin:0 0 10px;"><strong>${fuerte}</strong> ${resto}</li>`).join("")}
    </ol>
    <p style="margin:0 0 22px;">
      <a href="${APP_URL}/tecnico/${tecnicoId}" style="display:inline-block;background:#4E7A3E;color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:600;font-size:14px;">Ver el perfil de ${nombre}</a>
    </p>
    <p style="margin:0;color:#5A6B5C;">En unos días te escribimos para preguntarte cómo te fue.</p>`;
}

export type ItemSeguimiento = { tecnicoId: string; nombre: string; token: string };

/** Mail de "¿cómo te fue?" a los 7 días. Uno por persona, con hasta 5 técnicos. */
export function mailSeguimiento(items: ItemSeguimiento[]): { asunto: string; html: string } {
  const uno = items.length === 1;
  const primero = toTitleCase(items[0].nombre);
  const asunto = uno ? `¿Cómo te fue con ${primero}?` : "¿Cómo te fue con los técnicos que contactaste?";

  const bloques = items
    .map((it) => {
      const nombre = escaparHtml(toTitleCase(it.nombre));
      const link = `${APP_URL}/resena/${it.token}`;
      return `
      <div style="margin:0 0 14px;padding:16px;border:1px solid rgba(29,46,32,0.12);border-radius:12px;">
        <p style="margin:0 0 12px;font-weight:600;">${nombre}</p>
        <a href="${link}" style="display:inline-block;background:#4E7A3E;color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:10px;font-weight:600;font-size:14px;margin:0 6px 6px 0;">Lo contraté: dejar reseña</a>
        <a href="${link}?no=1" style="display:inline-block;color:#4E7A3E;text-decoration:none;padding:9px 14px;border:1px solid #4E7A3E;border-radius:10px;font-weight:600;font-size:14px;margin:0 0 6px;">No lo contraté</a>
      </div>`;
    })
    .join("");

  const intro = uno
    ? `Hace unos días le escribiste a <strong>${escaparHtml(primero)}</strong> por Sufix. ¿Llegaste a contratarlo?`
    : "Hace unos días les escribiste a estos técnicos por Sufix. ¿Llegaste a contratar a alguno?";

  const html = `
    <p style="margin:0 0 14px;font-size:17px;font-weight:600;">${escaparHtml(asunto)}</p>
    <p style="margin:0 0 18px;">${intro}</p>
    ${bloques}
    <p style="margin:8px 0 0;color:#5A6B5C;">Tu reseña ayuda a otros vecinos a elegir, y a que los buenos técnicos consigan más trabajo. Te lleva un minuto y no necesitás cuenta.</p>`;

  return { asunto, html };
}
