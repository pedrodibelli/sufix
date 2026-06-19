"use server";

import { Resend } from "resend";
import { createSupabaseServer } from "@/lib/supabase-server";

const resend = new Resend(process.env.RESEND_API_KEY);

interface PublicacionData {
  title: string;
  category_slug: string;
  zone: string;
  urgency: string;
  photos: string[];
}

export async function crearPublicacion(data: PublicacionData) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Necesitás estar logueado para publicar." };

  const nombre = user.user_metadata?.nombre as string | undefined;
  const email = user.email;
  if (!email) return { error: "No se encontró el email del usuario." };

  // La publicación queda visible al instante (sin paso de confirmación por email).
  const { error: dbError } = await supabase.from("publicaciones").insert({
    title: data.title,
    description: "",
    category_slug: data.category_slug,
    zone: data.zone,
    urgency: data.urgency,
    photo: data.photos[0] ?? null,
    photos: data.photos,
    posted_by: nombre ?? "Anónimo",
    user_id: user.id,
    status: "abierto",
  });

  if (dbError) return { error: `Error al guardar: ${dbError.message}` };

  // A partir de acá la publicación YA está publicada. El email es solo un aviso
  // informativo: best-effort. Si Resend no está configurado o falla, no pasa nada
  // (no bloquea ni hace fallar la publicación).
  enviarAvisoPublicacion(email, nombre, data).catch((err) => {
    console.error("[crearPublicacion] no se pudo enviar el aviso:", err);
  });

  return { success: true, email };
}

async function enviarAvisoPublicacion(
  email: string,
  nombre: string | undefined,
  data: PublicacionData
) {
  const resendConfigurado =
    !!process.env.RESEND_API_KEY &&
    !process.env.RESEND_API_KEY.startsWith("re_REEMPLAZAR");

  if (!resendConfigurado) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://solvit.homes";

  const urgencyLabel = data.urgency === "hoy" ? "Hoy mismo"
    : data.urgency === "esta_semana" ? "Esta semana"
    : "Flexible";

  await resend.emails.send({
    from: "SolvIT <noreply@solvit.homes>",
    to: email,
    subject: "Publicamos tu pedido en SolvIT",
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tu publicación está activa</title>
</head>
<body style="margin:0;padding:0;background:#f5fdf9;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5fdf9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:22px;font-weight:700;color:#1a2e1e;letter-spacing:-0.5px;">Solv<span style="color:#3d9b5e;">IT</span></span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;padding:40px 32px;border:1px solid #e4ede7;">

              <p style="margin:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#3d9b5e;">Publicación creada</p>
              <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1a2e1e;line-height:1.2;">¡Listo${nombre ? `, ${nombre}` : ""}! Tu pedido ya está publicado.</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                Lo estamos mostrando a los técnicos verificados de tu zona. Te avisamos cuando lleguen las primeras ofertas — no tenés que hacer nada más.
              </p>

              <!-- Detalle de la publicación -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5fdf9;border-radius:12px;padding:16px;margin-bottom:28px;">
                <tr>
                  <td style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;padding-bottom:10px;">Tu publicación</td>
                </tr>
                <tr>
                  <td style="font-size:15px;font-weight:600;color:#1a2e1e;padding-bottom:4px;">${data.title}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#64748b;">📍 ${data.zone} &nbsp;·&nbsp; ⏱ ${urgencyLabel}</td>
                </tr>
              </table>

              <!-- CTA informativo -->
              <a href="${appUrl}/mis-publicaciones" style="display:block;text-align:center;background:#3d9b5e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 24px;border-radius:12px;margin-bottom:20px;">
                Ver mis publicaciones →
              </a>

              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
                No te cobramos nada hasta que aceptes una oferta.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                SolvIT · solvit.homes
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}
