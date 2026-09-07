import { Resend } from "resend";

// Envío de mails con Resend desde nuestro propio dominio (2026-09-07).
//
// Los dos endpoints viejos (/api/propuesta-creada y /api/publicacion-creada)
// mandan por Gmail SMTP con nodemailer, que era el parche mientras no había
// dominio. No se tocan: disparan sobre `propuestas` y `publicaciones`, tablas
// que desde el pivot ya nadie escribe, así que en la práctica están dormidos.
// Lo nuevo va por acá.
//
// Si falta RESEND_API_KEY no se rompe nada: se saltea y se avisa por consola.
// Así el registro de un técnico sigue funcionando aunque el mail falle — un
// aviso que no sale nunca debe tumbar la acción que lo dispara.
const REMITENTE = "Sufix <hola@sufixapp.com>";

export type MailArgs = { para: string; asunto: string; html: string };

export async function enviarMail({ para, asunto, html }: MailArgs): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith("re_REEMPLAZAR")) {
    console.warn(`[mail] RESEND_API_KEY sin configurar — no se envió "${asunto}" a ${para}`);
    return false;
  }
  try {
    const { error } = await new Resend(key).emails.send({
      from: REMITENTE,
      to: para,
      subject: asunto,
      html: plantilla(html),
    });
    if (error) {
      console.error(`[mail] fallo enviando "${asunto}" a ${para}:`, error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[mail] excepción enviando "${asunto}":`, e);
    return false;
  }
}

// Marco común: los clientes de mail ignoran casi todo el CSS moderno, así que
// va con estilos en línea y colores de la marca (sv-dark / crema).
function plantilla(contenido: string): string {
  return `<div style="margin:0;padding:24px;background:#FBF8EF;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid rgba(29,46,32,0.1);border-radius:16px;overflow:hidden;">
    <div style="background:#1D2E20;padding:18px 24px;">
      <span style="color:#FBF8EF;font-size:18px;font-weight:600;letter-spacing:-0.01em;">Sufix</span>
    </div>
    <div style="padding:24px;color:#1D2E20;font-size:15px;line-height:1.6;">
      ${contenido}
    </div>
  </div>
  <p style="max-width:520px;margin:14px auto 0;color:#8A9689;font-size:12px;text-align:center;">
    Sufix — técnicos verificados de CABA y zona norte · <a href="https://sufixapp.com" style="color:#4E7A3E;">sufixapp.com</a>
  </p>
</div>`;
}
