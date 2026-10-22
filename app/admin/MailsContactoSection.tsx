import { clienteAdmin } from "@/lib/supabaseAdmin";
import { MOTIVOS_NO_CONTRATADO } from "@/app/resena/[token]/motivos";

// Mails de quienes contactan técnicos (2026-10-22, ver CLAUDE.md §24).
// Componente de servidor que trae sus propios datos con service role: las
// tablas contactantes / invitaciones_resena / aperturas_popup_contacto no
// tienen ninguna policy, ni siquiera para los admins. El control de acceso es
// el isAdminEmail() de page.tsx, que corre antes de renderizar esto.

const DIA = 24 * 60 * 60 * 1000;

type Persona = {
  id: string;
  email: string;
  telefono: string | null;
  acepta_novedades: boolean;
  mail_invalido: boolean;
  baja_at: string | null;
  creado_at: string;
};

export async function MailsContactoSection() {
  const admin = clienteAdmin();
  if (!admin) {
    return <p className="mt-4 text-sm text-ink-500">Falta SUPABASE_SERVICE_ROLE_KEY en el entorno.</p>;
  }

  const hace30 = new Date(Date.now() - 30 * DIA).toISOString();
  // Los totales se cuentan en la base (count + head), no trayendo filas:
  // PostgREST corta en 1000 filas por consulta y los números quedarían mal
  // apenas la tabla pase ese tamaño.
  const contar = { count: "exact", head: true } as const;
  const [
    personasRes,
    { count: total },
    { count: conNovedades },
    { count: bajas },
    { count: invalidos },
    { count: aperturas },
    { count: siguieron },
    { count: seguimientosEnviados },
    { count: resenasPorLink },
    noContratadosRes,
  ] = await Promise.all([
    admin
      .from("contactantes")
      .select("id, email, telefono, acepta_novedades, mail_invalido, baja_at, creado_at")
      .order("creado_at", { ascending: false })
      .limit(30),
    admin.from("contactantes").select("*", contar),
    admin.from("contactantes").select("*", contar).eq("acepta_novedades", true).is("baja_at", null).eq("mail_invalido", false),
    admin.from("contactantes").select("*", contar).not("baja_at", "is", null),
    admin.from("contactantes").select("*", contar).eq("mail_invalido", true),
    admin.from("aperturas_popup_contacto").select("*", contar).gte("creado_at", hace30),
    admin.from("aperturas_popup_contacto").select("*", contar).gte("creado_at", hace30).not("continuo_at", "is", null),
    admin.from("contactos_tecnico").select("*", contar).not("seguimiento_enviado_at", "is", null),
    admin.from("invitaciones_resena").select("*", contar).not("resena_id", "is", null),
    admin.from("invitaciones_resena").select("tecnico_id, motivo").eq("respuesta", "no_contratado"),
  ]);

  if (personasRes.error) {
    return (
      <p className="mt-4 text-sm text-rose-600">
        No se pudieron leer los mails ({personasRes.error.message}). ¿Se corrió la migración 20261022_mails_de_contacto.sql?
      </p>
    );
  }

  const personas = (personasRes.data ?? []) as Persona[];
  const noContratados = noContratadosRes.data ?? [];

  // Contactos de los 30 de la tabla, nada más (30 ids, no cientos).
  const contactosPorPersona = new Map<string, number>();
  if (personas.length > 0) {
    const { data: contactos } = await admin
      .from("contactos_tecnico")
      .select("contactante_id")
      .in("contactante_id", personas.map((p) => p.id));
    for (const c of contactos ?? []) {
      contactosPorPersona.set(c.contactante_id, (contactosPorPersona.get(c.contactante_id) ?? 0) + 1);
    }
  }

  const abiertos = aperturas ?? 0;
  const abandono = abiertos > 0 ? Math.round(((abiertos - (siguieron ?? 0)) / abiertos) * 100) : null;
  const porMotivo = MOTIVOS_NO_CONTRATADO.map((m) => ({
    ...m,
    total: noContratados.filter((i) => i.motivo === m.value).length,
  })).filter((m) => m.total > 0);

  // Técnicos con "no me respondió": la señal más clara de un perfil a revisar.
  const sinRespuesta = new Map<string, number>();
  for (const i of noContratados) {
    if (i.motivo === "no_respondio") sinRespuesta.set(i.tecnico_id, (sinRespuesta.get(i.tecnico_id) ?? 0) + 1);
  }
  const nombres = new Map<string, string>();
  if (sinRespuesta.size > 0) {
    const { data } = await admin.from("perfiles_publicos").select("user_id, nombre").in("user_id", [...sinRespuesta.keys()]);
    for (const p of data ?? []) nombres.set(p.user_id, p.nombre ?? "—");
  }
  const tecnicosSinRespuesta = [...sinRespuesta.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  const stats = [
    { label: "Mails registrados", valor: total ?? 0, nota: `${conNovedades ?? 0} aceptan novedades` },
    {
      label: "Pop-up (últimos 30 días)",
      valor: abiertos > 0 ? `${siguieron ?? 0} de ${abiertos}` : "—",
      nota: abandono !== null ? `${abandono}% lo cerró sin seguir` : "todavía sin datos",
    },
    { label: "Seguimientos enviados", valor: seguimientosEnviados ?? 0, nota: "contactos a los que se les preguntó" },
    {
      label: "Respuestas",
      valor: (resenasPorLink ?? 0) + noContratados.length,
      nota: `${resenasPorLink ?? 0} reseñas · ${noContratados.length} no lo contrataron`,
    },
  ];

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-[12px] font-medium text-ink-500">{s.label}</p>
            <p className="display mt-1 text-2xl text-sv-dark">{s.valor}</p>
            <p className="mt-0.5 text-[12px] text-ink-400">{s.nota}</p>
          </div>
        ))}
      </div>

      {(porMotivo.length > 0 || tecnicosSinRespuesta.length > 0) && (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {porMotivo.length > 0 && (
            <div className="card p-4">
              <p className="text-sm font-semibold text-sv-dark">Por qué no lo contrataron</p>
              <ul className="mt-2 space-y-1 text-sm text-ink-600">
                {porMotivo.map((m) => (
                  <li key={m.value} className="flex justify-between gap-3">
                    <span>{m.label}</span>
                    <span className="font-semibold">{m.total}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {tecnicosSinRespuesta.length > 0 && (
            <div className="card p-4">
              <p className="text-sm font-semibold text-sv-dark">Técnicos que no respondieron</p>
              <ul className="mt-2 space-y-1 text-sm text-ink-600">
                {tecnicosSinRespuesta.map(([id, n]) => (
                  <li key={id} className="flex justify-between gap-3">
                    <a href={`/tecnico/${id}`} className="truncate text-sv-primary underline-offset-2 hover:underline">
                      {nombres.get(id) ?? "Perfil dado de baja"}
                    </a>
                    <span className="font-semibold">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-sv-dark">
          Últimos {personas.length}
          {(bajas ?? 0) + (invalidos ?? 0) > 0 && (
            <span className="ml-2 font-normal text-ink-400">
              ({bajas ?? 0} dados de baja, {invalidos ?? 0} con mail inválido)
            </span>
          )}
        </p>
        {(total ?? 0) > 0 && (
          <a href="/admin/contactantes.csv" className="text-sm font-medium text-sv-primary underline underline-offset-2">
            Descargar todos (CSV)
          </a>
        )}
      </div>

      {personas.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-400">
          Todavía nadie dejó su mail.
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-ink-100 text-[12px] text-ink-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">Mail</th>
                <th className="px-4 py-2.5 font-medium">WhatsApp</th>
                <th className="px-4 py-2.5 font-medium">Contactos</th>
                <th className="px-4 py-2.5 font-medium">Alta</th>
                <th className="px-4 py-2.5 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {personas.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2.5 text-sv-dark">{p.email}</td>
                  <td className="px-4 py-2.5">
                    {p.telefono ? (
                      <a
                        href={`https://wa.me/${p.telefono}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sv-primary underline-offset-2 hover:underline"
                      >
                        {p.telefono}
                      </a>
                    ) : (
                      <span className="text-ink-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">{contactosPorPersona.get(p.id) ?? 0}</td>
                  <td className="px-4 py-2.5 text-ink-500">{new Date(p.creado_at).toLocaleDateString("es-AR")}</td>
                  <td className="px-4 py-2.5 text-[12px]">
                    {p.baja_at ? (
                      <span className="text-ink-400">Dado de baja</span>
                    ) : p.mail_invalido ? (
                      <span className="text-rose-600">Mail inválido</span>
                    ) : p.acepta_novedades ? (
                      <span className="text-sv-olive">Acepta novedades</span>
                    ) : (
                      <span className="text-ink-400">Sólo avisos</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
