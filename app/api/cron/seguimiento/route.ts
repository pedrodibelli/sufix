import { NextResponse } from "next/server";
import { clienteAdmin } from "@/lib/supabaseAdmin";
import { enviarMail } from "@/lib/mail";
import { mailSeguimiento, urlsBaja, type ItemSeguimiento } from "@/lib/contactantes";

// "¿Cómo te fue?" a los 7 días de contactar a un técnico (2026-10-22, ver
// CLAUDE.md §24). Lo dispara el cron de Vercel una vez por día (vercel.json).
//
// Un mail por PERSONA, no por contacto: si alguien le escribió a tres
// plomeros, recibe un solo mail con los tres. Cada técnico lleva su propio
// link (/resena/<token>) para reseñarlo sin cuenta.
//
// `?prueba=1` no manda ni escribe nada: devuelve a quién le mandaría y con
// qué técnicos. Sirve para revisar antes de que salga de verdad.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DIA = 24 * 60 * 60 * 1000;
const ESPERA_DIAS = 7; // a los cuántos días del primer contacto se pregunta
const MIN_DIAS = 2; // un contacto de ayer no entra: espera al próximo mail
const MAX_DIAS = 30; // contactos más viejos que esto ya no se preguntan
const VIGENCIA_LINK_DIAS = 30;
const MAX_TECNICOS_POR_MAIL = 5;
// Resend acepta 2 pedidos por segundo; con la pausa de abajo, 40 mails son
// ~25 segundos — holgado dentro del maxDuration.
const MAX_MAILS_POR_CORRIDA = 40;

type Pendiente = {
  id: string;
  tecnico_id: string;
  creado_at: string;
  contactado_por: string | null;
  contactante_id: string;
  contactantes: { email: string; baja_at: string | null; mail_invalido: boolean; token_baja: string } | null;
};

const iso = (ms: number) => new Date(ms).toISOString();
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto || request.headers.get("authorization") !== `Bearer ${secreto}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const admin = clienteAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "Falta SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });

  const prueba = new URL(request.url).searchParams.get("prueba") === "1";
  const ahora = Date.now();

  const { data, error } = await admin
    .from("contactos_tecnico")
    .select("id, tecnico_id, creado_at, contactado_por, contactante_id, contactantes(email, baja_at, mail_invalido, token_baja)")
    .not("contactante_id", "is", null)
    .is("seguimiento_enviado_at", null)
    .gte("creado_at", iso(ahora - MAX_DIAS * DIA))
    .lte("creado_at", iso(ahora - MIN_DIAS * DIA))
    // Los más viejos primero: son los que ya cumplieron los 7 días. PostgREST
    // no devuelve más de 1000 filas por consulta; si algún día hay más
    // pendientes, los más nuevos quedan para la corrida del día siguiente.
    .order("creado_at", { ascending: true })
    .limit(1000);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const grupos = new Map<string, Pendiente[]>();
  for (const fila of (data ?? []) as unknown as Pendiente[]) {
    const lista = grupos.get(fila.contactante_id) ?? [];
    lista.push(fila);
    grupos.set(fila.contactante_id, lista);
  }

  const marcar = async (ids: string[]) => {
    if (prueba || ids.length === 0) return;
    await admin.from("contactos_tecnico").update({ seguimiento_enviado_at: iso(Date.now()) }).in("id", ids);
  };

  let enviados = 0;
  let fallidos = 0;
  let salteados = 0;
  const plan: { email: string; tecnicos: string[] }[] = [];

  for (const [contactanteId, contactos] of grupos) {
    if (enviados >= MAX_MAILS_POR_CORRIDA) break;

    const primerContacto = Math.min(...contactos.map((c) => Date.parse(c.creado_at)));
    if (ahora - primerContacto < ESPERA_DIAS * DIA) continue; // todavía no

    const ids = contactos.map((c) => c.id);
    const persona = contactos[0].contactantes;
    if (!persona || persona.baja_at || persona.mail_invalido) {
      await marcar(ids);
      salteados++;
      continue;
    }

    // Del contacto más nuevo al más viejo: si hay más de 5 técnicos, van los
    // últimos que contactó, que son los que tiene más frescos.
    const recientesPrimero = [...contactos].sort((a, b) => Date.parse(b.creado_at) - Date.parse(a.creado_at));
    let tecnicos = [...new Set(recientesPrimero.map((c) => c.tecnico_id))];

    // No volver a preguntar por un técnico que ya respondió — ni por el link
    // de una vez anterior, ni con una reseña desde su cuenta.
    const yaRespondio = new Set<string>();
    const { data: invitaciones } = await admin
      .from("invitaciones_resena")
      .select("tecnico_id, respondida_at")
      .eq("contactante_id", contactanteId)
      .in("tecnico_id", tecnicos);
    for (const inv of invitaciones ?? []) if (inv.respondida_at) yaRespondio.add(inv.tecnico_id);
    const cuentas = [...new Set(contactos.map((c) => c.contactado_por).filter((x): x is string => !!x))];
    if (cuentas.length > 0) {
      const { data: resenas } = await admin
        .from("resenas")
        .select("tecnico_id")
        .in("autor_id", cuentas)
        .in("tecnico_id", tecnicos);
      for (const r of resenas ?? []) yaRespondio.add(r.tecnico_id);
    }
    tecnicos = tecnicos.filter((t) => !yaRespondio.has(t)).slice(0, MAX_TECNICOS_POR_MAIL);

    // Sólo técnicos que siguen publicados (perfiles_publicos), con su nombre.
    const nombrePorId = new Map<string, string>();
    if (tecnicos.length > 0) {
      const { data: perfiles } = await admin.from("perfiles_publicos").select("user_id, nombre").in("user_id", tecnicos);
      for (const p of perfiles ?? []) nombrePorId.set(p.user_id, p.nombre ?? "Técnico");
    }
    tecnicos = tecnicos.filter((t) => nombrePorId.has(t));

    if (tecnicos.length === 0) {
      await marcar(ids);
      salteados++;
      continue;
    }

    if (prueba) {
      plan.push({ email: persona.email, tecnicos: tecnicos.map((t) => nombrePorId.get(t)!) });
      continue;
    }

    // Un link por (persona, técnico). Si ya existía de una vez anterior (no
    // respondida), se reusa el mismo token y se le estira el vencimiento.
    const { data: tokens, error: errorInv } = await admin
      .from("invitaciones_resena")
      .upsert(
        tecnicos.map((t) => ({ contactante_id: contactanteId, tecnico_id: t, vence_at: iso(ahora + VIGENCIA_LINK_DIAS * DIA) })),
        { onConflict: "contactante_id,tecnico_id" }
      )
      .select("tecnico_id, token");
    if (errorInv || !tokens) {
      fallidos++;
      continue;
    }
    const tokenPorTecnico = new Map(tokens.map((t) => [t.tecnico_id as string, t.token as string]));

    const items: ItemSeguimiento[] = tecnicos
      .filter((t) => tokenPorTecnico.has(t))
      .map((t) => ({ tecnicoId: t, nombre: nombrePorId.get(t)!, token: tokenPorTecnico.get(t)! }));
    const { asunto, html } = mailSeguimiento(items);

    const ok = await enviarMail({ para: persona.email, asunto, html, baja: urlsBaja(persona.token_baja) });
    // Si no salió, los contactos quedan pendientes y se reintenta mañana.
    if (ok) {
      await marcar(ids);
      enviados++;
    } else {
      fallidos++;
    }
    await esperar(600);
  }

  return NextResponse.json({
    ok: true,
    prueba,
    personasConPendientes: grupos.size,
    enviados,
    fallidos,
    salteados,
    ...(prueba ? { plan } : {}),
    at: iso(ahora),
  });
}
