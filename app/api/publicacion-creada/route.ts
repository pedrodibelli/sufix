import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Webhook de Supabase: INSERT en `publicaciones` →
//   1) mail al demandante avisando que su pedido quedó publicado.
//   2) mail a los técnicos cuyo rubro + zona coinciden con la publicación.
// Mismo patrón que /api/propuesta-creada (Gmail SMTP + service role).
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.WEBHOOK_SECRET || auth !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const pub = body?.record;

    if (body?.type && body.type !== "INSERT") return NextResponse.json({ ok: true });
    if (!pub?.id) return NextResponse.json({ ok: true });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      console.error("[publicacion-creada] faltan env de Supabase service role");
      return NextResponse.json({ ok: true });
    }
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("[publicacion-creada] faltan credenciales de Gmail");
      return NextResponse.json({ ok: true });
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://solvitweb.vercel.app";
    const titulo = (pub.title as string) || "tu pedido";
    const zona = (pub.zone as string) || "";
    const rubro = (pub.category_slug as string) || "";
    const urgency = (pub.urgency as string) || "";
    const urgencyLabel =
      urgency === "hoy" ? "Hoy mismo" : urgency === "esta_semana" ? "Esta semana" : "Flexible";

    // ── 1) Aviso al demandante ──────────────────────────────────────────────
    const { data: userRes } = await admin.auth.admin.getUserById(pub.user_id);
    const emailDemandante = userRes?.user?.email;
    const nombre = (userRes?.user?.user_metadata?.nombre as string) || "";

    if (emailDemandante) {
      try {
        await transporter.sendMail({
          from: `SolvIT <${process.env.GMAIL_USER}>`,
          to: emailDemandante,
          subject: "Publicamos tu pedido en SolvIT",
          html: card({
            eyebrow: "Publicación creada",
            titulo: `¡Listo${nombre ? `, ${nombre}` : ""}! Tu pedido ya está publicado.`,
            cuerpo: `Lo estamos mostrando a los técnicos de tu zona. Te avisamos apenas lleguen las primeras propuestas — no tenés que hacer nada más.`,
            detalle: `<strong>${titulo}</strong><br/>📍 ${zona} &nbsp;·&nbsp; ⏱ ${urgencyLabel}`,
            ctaText: "Ver mis consultas →",
            ctaHref: `${appUrl}/mis-consultas`,
            nota: "No te cobramos nada hasta que aceptes una propuesta.",
          }),
        });
      } catch (e) {
        console.error("[publicacion-creada] error mail demandante:", e instanceof Error ? e.message : e);
      }
    } else {
      console.error("[publicacion-creada] el demandante no tiene email");
    }

    // ── 2) Aviso a los técnicos del rubro + zona ────────────────────────────
    let tecnicosNotificados = 0;
    if (rubro && zona) {
      // rubro es un array (un técnico puede tener varios) — .contains() chequea
      // que el array de la fila incluya este valor.
      const { data: tecnicos, error: tErr } = await admin
        .from("perfiles_profesionales")
        .select("email, user_id")
        .contains("rubro", [rubro])
        .eq("zona", zona);

      if (tErr) {
        console.error("[publicacion-creada] error buscando técnicos:", tErr.message);
      }

      for (const t of tecnicos ?? []) {
        // No avisarse a sí mismo si el que publica también tuviera perfil técnico.
        if (!t.email || t.user_id === pub.user_id) continue;
        try {
          await transporter.sendMail({
            from: `SolvIT <${process.env.GMAIL_USER}>`,
            to: t.email,
            subject: "Nuevo trabajo en tu zona y rubro",
            html: card({
              eyebrow: "Nuevo trabajo",
              titulo: "Hay un trabajo nuevo para vos",
              cuerpo: `Se publicó un pedido que coincide con tu rubro y tu zona. Entrá rápido y mandá tu propuesta antes que el resto.`,
              detalle: `<strong>${titulo}</strong><br/>📍 ${zona} &nbsp;·&nbsp; ⏱ ${urgencyLabel}`,
              ctaText: "Ver el trabajo →",
              ctaHref: `${appUrl}/`,
              nota: "Recibís este aviso porque coincide con el rubro y la zona de tu perfil.",
            }),
          });
          tecnicosNotificados++;
        } catch (e) {
          console.error("[publicacion-creada] error mail técnico:", e instanceof Error ? e.message : e);
        }
      }
    }

    return NextResponse.json({ ok: true, demandante: !!emailDemandante, tecnicos: tecnicosNotificados });
  } catch (err) {
    console.error("[publicacion-creada] excepción:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false });
  }
}

// Plantilla HTML compartida por los dos mails (branding SolvIT).
function card(o: {
  eyebrow: string;
  titulo: string;
  cuerpo: string;
  detalle: string;
  ctaText: string;
  ctaHref: string;
  nota: string;
}) {
  return `
<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f5fdf9;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5fdf9;padding:40px 16px;"><tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
      <tr><td align="center" style="padding-bottom:32px;">
        <span style="font-size:22px;font-weight:700;color:#1a2e1e;">Solv<span style="color:#3d9b5e;">IT</span></span>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:20px;padding:40px 32px;border:1px solid #e4ede7;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:#3d9b5e;">${o.eyebrow}</p>
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1a2e1e;line-height:1.2;">${o.titulo}</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">${o.cuerpo}</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5fdf9;border-radius:12px;margin-bottom:28px;">
          <tr><td style="padding:16px;font-size:14px;color:#1a2e1e;line-height:1.6;">${o.detalle}</td></tr>
        </table>
        <a href="${o.ctaHref}" style="display:block;text-align:center;background:#3d9b5e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 24px;border-radius:12px;margin-bottom:20px;">${o.ctaText}</a>
        <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">${o.nota}</p>
      </td></tr>
      <tr><td align="center" style="padding-top:24px;"><p style="margin:0;font-size:12px;color:#94a3b8;">SolvIT</p></td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}
