import { createSupabaseServer } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/admin";
import { clienteAdmin } from "@/lib/supabaseAdmin";

// Descarga de todos los mails de contacto en CSV, para abrir en Excel o
// Google Sheets (2026-10-22, ver CLAUDE.md §24). Sólo admins; a cualquier
// otro le responde 404, igual que /admin, para no revelar que existe.

export const dynamic = "force-dynamic";

// Comillas siempre, y un apóstrofo delante de lo que empiece con = + - @:
// Excel interpreta esas celdas como fórmulas (y un "mail" puede ser cualquier
// cosa que alguien escribió en el pop-up).
function celda(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

type Persona = {
  id: string;
  email: string;
  telefono: string | null;
  acepta_novedades: boolean;
  mail_invalido: boolean;
  baja_at: string | null;
  creado_at: string;
};

async function todasLasFilas<T>(
  pagina: (desde: number, hasta: number) => PromiseLike<{ data: unknown[] | null; error: unknown }>
): Promise<T[]> {
  const TAM = 1000;
  const filas: T[] = [];
  for (let desde = 0; ; desde += TAM) {
    const { data, error } = await pagina(desde, desde + TAM - 1);
    if (error) throw error;
    filas.push(...((data ?? []) as T[]));
    if (!data || data.length < TAM) return filas;
  }
}

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) return new Response("Not found", { status: 404 });

  const admin = clienteAdmin();
  if (!admin) return new Response("Falta SUPABASE_SERVICE_ROLE_KEY", { status: 500 });

  // perfiles_publicos entero y no con .in(ids): con cientos de ids, PostgREST
  // tarda segundos (ver CLAUDE.md §21). Todo paginado: PostgREST corta en 1000
  // filas por consulta, y un CSV al que le faltan filas sin avisar es peor que
  // no tener CSV.
  const [personas, contactos, perfiles] = await Promise.all([
    todasLasFilas<Persona>((desde, hasta) =>
      admin
        .from("contactantes")
        .select("id, email, telefono, acepta_novedades, mail_invalido, baja_at, creado_at")
        .order("creado_at", { ascending: false })
        .order("id")
        .range(desde, hasta)
    ),
    todasLasFilas<{ contactante_id: string; tecnico_id: string }>((desde, hasta) =>
      admin
        .from("contactos_tecnico")
        .select("contactante_id, tecnico_id")
        .not("contactante_id", "is", null)
        .order("id")
        .range(desde, hasta)
    ),
    todasLasFilas<{ user_id: string; nombre: string | null }>((desde, hasta) =>
      admin.from("perfiles_publicos").select("user_id, nombre").order("user_id").range(desde, hasta)
    ),
  ]);

  const nombrePorId = new Map(perfiles.map((p) => [p.user_id, p.nombre ?? ""]));
  const tecnicosPorPersona = new Map<string, Set<string>>();
  for (const c of contactos) {
    const set = tecnicosPorPersona.get(c.contactante_id) ?? new Set<string>();
    set.add(nombrePorId.get(c.tecnico_id) ?? "(perfil dado de baja)");
    tecnicosPorPersona.set(c.contactante_id, set);
  }

  const filas = [
    ["email", "whatsapp", "acepta_novedades", "dado_de_baja", "mail_invalido", "tecnicos_contactados", "alta"],
    ...personas.map((p) => [
      p.email,
      p.telefono,
      p.acepta_novedades ? "si" : "no",
      p.baja_at ? "si" : "no",
      p.mail_invalido ? "si" : "no",
      [...(tecnicosPorPersona.get(p.id) ?? [])].join(" | "),
      new Date(p.creado_at).toLocaleDateString("es-AR"),
    ]),
  ];
  // BOM al principio: sin eso, Excel abre el archivo con los acentos rotos.
  const csv = "﻿" + filas.map((f) => f.map(celda).join(",")).join("\r\n");
  const hoy = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sufix-mails-${hoy}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
