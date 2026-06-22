import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Webhook de Supabase: se dispara al INSERTAR una fila en `propuestas`.
// Manda un mail al demandante (vía Gmail SMTP) avisándole que recibió una propuesta.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.WEBHOOK_SECRET || auth !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    console.error("[propuesta-creada] 401 — secreto inválido. recibido:", auth?.slice(0, 12));
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const propuesta = body?.record;
    console.log("[propuesta-creada] type:", body?.type, "pub_id:", propuesta?.publicacion_id);

    if (body?.type && body.type !== "INSERT") {
      console.log("[propuesta-creada] skip: no es INSERT");
      return NextResponse.json({ ok: true });
    }
    if (!propuesta?.publicacion_id) {
      console.log("[propuesta-creada] skip: sin publicacion_id");
      return NextResponse.json({ ok: true });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      console.error("[propuesta-creada] FALTA env: url?", !!url, "serviceKey?", !!serviceKey);
      return NextResponse.json({ ok: true });
    }
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    const { data: pub, error: pubErr } = await admin
      .from("publicaciones")
      .select("user_id, title")
      .eq("id", propuesta.publicacion_id)
      .single();
    if (pubErr) console.error("[propuesta-creada] error buscando publicacion:", pubErr.message);
    if (!pub?.user_id) {
      console.log("[propuesta-creada] skip: no se encontró la publicación / user_id");
      return NextResponse.json({ ok: true });
    }

    const { data: userRes, error: userErr } = await admin.auth.admin.getUserById(pub.user_id);
    if (userErr) console.error("[propuesta-creada] error getUserById:", userErr.message);
    const email = userRes?.user?.email;
    if (!email) {
      console.log("[propuesta-creada] skip: el demandante no tiene email");
      return NextResponse.json({ ok: true });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error("[propuesta-creada] FALTA env Gmail: user?", !!process.env.GMAIL_USER, "pass?", !!process.env.GMAIL_APP_PASSWORD);
      return NextResponse.json({ ok: true });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://solvitweb.vercel.app";
    const titulo = (propuesta.titulo as string) || (pub.title as string) || "tu problema";
    const tecnico = (propuesta.nombre_profesional as string) || "Un técnico";
    const precio = propuesta.precio ? `$${Number(propuesta.precio).toLocaleString("es-AR")}` : null;

    console.log("[propuesta-creada] enviando mail a:", email);
    const info = await transporter.sendMail({
      from: `SolvIT <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Recibiste una propuesta en SolvIT",
      html: `
<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f5fdf9;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5fdf9;padding:40px 16px;"><tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
      <tr><td align="center" style="padding-bottom:32px;">
        <span style="font-size:22px;font-weight:700;color:#1a2e1e;">Solv<span style="color:#3d9b5e;">IT</span></span>
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
      <tr><td align="center" style="padding-top:24px;"><p style="margin:0;font-size:12px;color:#94a3b8;">SolvIT</p></td></tr>
    </table>
  </td></tr></table>
</body></html>`,
    });
    console.log("[propuesta-creada] enviado OK:", info.messageId, "accepted:", info.accepted);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[propuesta-creada] EXCEPCIÓN:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: true });
  }
}
