import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Webhook de Supabase: INSERT en `propuestas` → mail al demandante (Gmail SMTP).
// Devuelve un `debug` en la respuesta para diagnosticar (protegido por el secreto).
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.WEBHOOK_SECRET || auth !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const propuesta = body?.record;

    if (body?.type && body.type !== "INSERT") return NextResponse.json({ ok: true });
    if (!propuesta?.publicacion_id) return NextResponse.json({ ok: true });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      console.error("[propuesta-creada] faltan env de Supabase service role");
      return NextResponse.json({ ok: true });
    }
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    const { data: pub, error: pubErr } = await admin
      .from("publicaciones")
      .select("user_id, title")
      .eq("id", propuesta.publicacion_id)
      .single();
    if (!pub?.user_id) {
      console.error("[propuesta-creada] publicación no encontrada:", pubErr?.message);
      return NextResponse.json({ ok: true });
    }

    const { data: userRes } = await admin.auth.admin.getUserById(pub.user_id);
    const email = userRes?.user?.email;
    if (!email) {
      console.error("[propuesta-creada] el demandante no tiene email");
      return NextResponse.json({ ok: true });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("[propuesta-creada] faltan credenciales de Gmail");
      return NextResponse.json({ ok: true });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://solvitweb.vercel.app";
    const titulo = (propuesta.titulo as string) || (pub.title as string) || "tu problema";
    const tecnico = (propuesta.nombre_profesional as string) || "Un técnico";
    const esContactoDirecto = propuesta.contacto_directo === true;

    // Flujo de contacto directo gratis: sin precio. El demandante es quien tiene
    // que escribirle al técnico, así que le mandamos su teléfono + un WhatsApp
    // con mensaje precargado, más el link a su perfil con reseñas.
    if (esContactoDirecto) {
      const { data: perfilPro } = await admin
        .from("perfiles_profesionales")
        .select("telefono")
        .eq("user_id", propuesta.profesional_id)
        .maybeSingle();

      const telefonoLimpio = perfilPro?.telefono ? String(perfilPro.telefono).replace(/\D/g, "") : null;
      const mensajeWa = encodeURIComponent(
        `Hola ${tecnico.split(" ")[0]}! Te contacto por Sufix por mi consulta: "${titulo}".`
      );
      const waLink = telefonoLimpio ? `https://wa.me/${telefonoLimpio}?text=${mensajeWa}` : null;
      const perfilLink = `${appUrl}/tecnico/${propuesta.profesional_id}`;

      try {
        await transporter.sendMail({
          from: `Sufix <${process.env.GMAIL_USER}>`,
          to: email,
          subject: "Un técnico quiere hacer tu trabajo en Sufix",
          html: `
<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f5fdf9;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5fdf9;padding:40px 16px;"><tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
      <tr><td align="center" style="padding-bottom:32px;">
        <span style="font-size:22px;font-weight:700;color:#1a2e1e;">Su<span style="color:#3d9b5e;">Fix</span></span>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:20px;padding:40px 32px;border:1px solid #e4ede7;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:#3d9b5e;">Nuevo interesado · sin cargo</p>
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1a2e1e;line-height:1.2;">¡${tecnico} quiere hacer tu trabajo!</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
          Es sobre: <strong>${titulo}</strong>. Mirá su perfil y sus reseñas, y si te convence escribile directo por WhatsApp para coordinar.
        </p>
        ${waLink ? `<a href="${waLink}" style="display:block;text-align:center;background:#25D366;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 24px;border-radius:12px;margin-bottom:12px;">Hablar por WhatsApp →</a>` : ""}
        <a href="${perfilLink}" style="display:block;text-align:center;background:${waLink ? "#ffffff" : "#3d9b5e"};color:${waLink ? "#3d9b5e" : "#ffffff"};text-decoration:none;font-size:15px;font-weight:600;padding:14px 24px;border-radius:12px;border:1px solid #3d9b5e;margin-bottom:20px;">
          Ver perfil y reseñas →
        </a>
        <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
          Pueden escribirte varios técnicos para el mismo trabajo — elegí el que más te convenga desde &ldquo;Mis consultas&rdquo;.
        </p>
      </td></tr>
      <tr><td align="center" style="padding-top:24px;"><p style="margin:0;font-size:12px;color:#94a3b8;">Sufix</p></td></tr>
    </table>
  </td></tr></table>
</body></html>`,
        });
        return NextResponse.json({ ok: true });
      } catch (mailErr) {
        console.error("[propuesta-creada] error SMTP (contacto directo):", mailErr instanceof Error ? mailErr.message : mailErr);
        return NextResponse.json({ ok: false });
      }
    }

    // ─── Flujo viejo (pausado, precio de consulta + pago) ──────────────────────
    const precio = propuesta.precio ? `$${Number(propuesta.precio).toLocaleString("es-AR")}` : null;

    try {
      await transporter.sendMail({
        from: `Sufix <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Recibiste una propuesta en Sufix",
        html: `
<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f5fdf9;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5fdf9;padding:40px 16px;"><tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
      <tr><td align="center" style="padding-bottom:32px;">
        <span style="font-size:22px;font-weight:700;color:#1a2e1e;">Su<span style="color:#3d9b5e;">Fix</span></span>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:20px;padding:40px 32px;border:1px solid #e4ede7;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:#3d9b5e;">Nueva propuesta</p>
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:700;color:#1a2e1e;line-height:1.2;">¡Te llegó una propuesta!</h1>
        <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
          <strong>${tecnico}</strong> te envió una propuesta para tu problema: <strong>${titulo}</strong>${precio ? ` · ${precio}` : ""}.
          Entrá a tus consultas para verla y decidir.
        </p>
        <a href="${appUrl}/mis-consultas" style="display:block;text-align:center;background:#3d9b5e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 24px;border-radius:12px;margin-bottom:20px;">
          Ver la propuesta →
        </a>
        <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">No te cobramos nada hasta que aceptes una propuesta.</p>
      </td></tr>
      <tr><td align="center" style="padding-top:24px;"><p style="margin:0;font-size:12px;color:#94a3b8;">Sufix</p></td></tr>
    </table>
  </td></tr></table>
</body></html>`,
      });
      return NextResponse.json({ ok: true });
    } catch (mailErr) {
      console.error("[propuesta-creada] error SMTP:", mailErr instanceof Error ? mailErr.message : mailErr);
      return NextResponse.json({ ok: false });
    }
  } catch (err) {
    console.error("[propuesta-creada] excepción:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false });
  }
}
