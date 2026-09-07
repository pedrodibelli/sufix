import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { enviarMail } from "@/lib/mail";
import { ADMIN_EMAILS } from "@/lib/admin";

export const runtime = "nodejs";

// Webhook de Supabase: INSERT en `perfiles_profesionales` → aviso al admin.
//
// Desde que un técnico no entra al directorio hasta que alguien lo aprueba
// (2026-09-07), nada avisaba que había uno esperando: se registraba y quedaba
// en /admin sin que nadie lo supiera. Esto cierra ese hueco.
//
// Va por webhook de la base y no desde el formulario de registro porque el
// alta se hace client-side con supabase.auth.signUp: si el usuario cierra la
// pestaña justo después, un aviso disparado desde el navegador no sale nunca.
// Desde la base sale siempre, y de paso cubre las altas hechas por script.
export async function POST(req: NextRequest) {
  // El 401 se devolvía sin dejar rastro, y eso hizo imposible diagnosticar por
  // qué no salían los avisos: el webhook llegaba, rebotaba y no quedaba nada en
  // los logs. Ahora se dice QUÉ falló, sin revelar el secreto en ningún caso.
  const auth = req.headers.get("authorization");
  const esperado = process.env.WEBHOOK_SECRET;
  if (!esperado) {
    console.error("[tecnico-registrado] 401: falta WEBHOOK_SECRET en el entorno");
    return NextResponse.json({ error: "no autorizado", motivo: "falta el secreto en el servidor" }, { status: 401 });
  }
  if (!auth) {
    console.error("[tecnico-registrado] 401: el webhook no mandó header Authorization");
    return NextResponse.json({ error: "no autorizado", motivo: "falta el header Authorization" }, { status: 401 });
  }
  if (!auth.startsWith("Bearer ")) {
    console.error(`[tecnico-registrado] 401: el header no empieza con "Bearer " (empieza con "${auth.slice(0, 7)}")`);
    return NextResponse.json({ error: "no autorizado", motivo: 'el header debe empezar con "Bearer "' }, { status: 401 });
  }
  if (auth !== `Bearer ${esperado}`) {
    const recibido = auth.slice(7);
    console.error(`[tecnico-registrado] 401: el secreto no coincide (recibido: ${recibido.length} caracteres, esperado: ${esperado.length})`);
    return NextResponse.json({
      error: "no autorizado",
      motivo: "el secreto no coincide",
      largoRecibido: recibido.length,
      largoEsperado: esperado.length,
    }, { status: 401 });
  }
  console.log("[tecnico-registrado] autorizado, procesando");

  try {
    const body = await req.json();
    if (body?.type && body.type !== "INSERT") return NextResponse.json({ ok: true });

    const perfil = body?.record;
    if (!perfil?.user_id) return NextResponse.json({ ok: true });

    // Si ya viene verificado no hay nada que revisar: son las altas que
    // hacemos nosotros por script, que entran aprobadas de entrada.
    if (perfil.verificado === true) {
      return NextResponse.json({ ok: true, motivo: "ya venia verificado" });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      console.error("[tecnico-registrado] faltan env de Supabase service role");
      return NextResponse.json({ ok: true });
    }
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: userRes } = await admin.auth.admin.getUserById(perfil.user_id);
    const emailTecnico = userRes?.user?.email ?? "(sin email)";

    const nombre = (perfil.nombre ?? "").trim() || "Sin nombre";
    const rubros = Array.isArray(perfil.rubro) && perfil.rubro.length ? perfil.rubro.join(", ") : "—";
    const zonas = Array.isArray(perfil.zona) && perfil.zona.length ? perfil.zona.join(", ") : "—";
    const tel = String(perfil.telefono ?? "—");
    const telLimpio = tel.replace(/\D/g, "");

    const html = `
      <p style="margin:0 0 4px;font-size:17px;font-weight:600;">Un técnico se registró y espera revisión</p>
      <p style="margin:0 0 18px;color:#5A6B5C;">Todavía no aparece en el directorio.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:5px 0;color:#8A9689;width:90px;">Nombre</td><td style="padding:5px 0;font-weight:600;">${escapar(nombre)}</td></tr>
        <tr><td style="padding:5px 0;color:#8A9689;">Teléfono</td><td style="padding:5px 0;">${telLimpio ? `<a href="https://wa.me/${telLimpio}" style="color:#4E7A3E;">${escapar(tel)}</a>` : "—"}</td></tr>
        <tr><td style="padding:5px 0;color:#8A9689;">Rubros</td><td style="padding:5px 0;">${escapar(rubros)}</td></tr>
        <tr><td style="padding:5px 0;color:#8A9689;">Zonas</td><td style="padding:5px 0;">${escapar(zonas)}</td></tr>
        <tr><td style="padding:5px 0;color:#8A9689;">Email</td><td style="padding:5px 0;">${escapar(emailTecnico)}</td></tr>
      </table>
      <p style="margin:22px 0 0;">
        <a href="https://sufixapp.com/admin" style="display:inline-block;background:#4E7A3E;color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:600;font-size:14px;">Revisar en el panel</a>
      </p>`;

    // A todos los admins: si manana se suma alguien mas al equipo, lo recibe
    // sin tocar codigo (la lista es la misma que da acceso a /admin).
    const asunto = `Nuevo técnico esperando revisión: ${nombre}`;
    const resultados: Record<string, boolean> = {};
    for (const para of ADMIN_EMAILS) {
      resultados[para] = await enviarMail({ para, asunto, html });
    }
    const enviados = Object.values(resultados).filter(Boolean).length;
    console.log(`[tecnico-registrado] enviados ${enviados}/${ADMIN_EMAILS.length}: ${JSON.stringify(resultados)}`);
    return NextResponse.json({ ok: true, enviados, resultados });
  } catch (e) {
    console.error("[tecnico-registrado] error:", e);
    return NextResponse.json({ ok: true });
  }
}

function escapar(s: string): string {
  return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]!));
}
