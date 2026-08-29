export type ContactoRecibido = {
  id: string;
  contactado_por: string | null;
  origen: string | null;
  creado_at: string;
};

const ORIGEN_LABEL: Record<string, string> = {
  home: "desde la home",
  perfil: "desde tu perfil",
  consultas: "desde su historial de contactos",
};

// Reemplaza la vieja "Mis consultas" del técnico (atada a propuestas sobre
// trabajos publicados, ya sin uso). Ahora es su historial de contactos
// recibidos — mismo dato que ya se muestra resumido en la home, acá completo.
export function QuienTeContactoView({ contactos }: { contactos: ContactoRecibido[] }) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="display text-2xl text-sv-dark">Quién te contactó</h1>
      <p className="mt-1 text-sm text-ink-400">
        {contactos.length === 0
          ? "Todavía nadie te contactó."
          : `${contactos.length} ${contactos.length === 1 ? "contacto" : "contactos"} en total`}
      </p>

      {contactos.length === 0 ? (
        <div className="mt-6 card p-8 text-center text-sm text-ink-400">
          Completá tu perfil (foto, zona, rubro) para aparecer mejor en las búsquedas y que te empiecen a contactar.
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {contactos.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm"
            >
              <span className="text-sv-dark">
                {c.contactado_por ? "Un usuario registrado" : "Visitante sin cuenta"}
              </span>
              <span className="text-ink-400">
                {new Date(c.creado_at).toLocaleDateString("es-AR")} · {ORIGEN_LABEL[c.origen ?? ""] ?? c.origen}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
