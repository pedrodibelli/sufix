import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { StarRating } from "@/components/StarRating";
import { ContactarWhatsAppButton } from "@/components/ContactarWhatsAppButton";
import { CATEGORIES } from "@/lib/data";

export type TecnicoPublico = {
  user_id: string;
  nombre: string | null;
  zona: string | null;
  rubro: string[] | null;
  verificado: boolean;
  foto_url: string | null;
  telefono: string | null;
  titular: string | null;
  creado_at?: string;
};

const DIAS_NUEVO = 30;

export function TecnicoCard({
  tecnico,
  resumen,
}: {
  tecnico: TecnicoPublico;
  resumen?: { promedio: number; total: number };
}) {
  const nombre = tecnico.nombre ?? "Profesional";
  const initials = nombre.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const rubros = tecnico.rubro ?? [];
  const rubrosNombres = rubros.map((slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug);
  const primerRubro = rubrosNombres[0] ?? "un servicio";
  const subtitulo = tecnico.titular?.trim() || rubrosNombres.join(" · ");

  const esNuevo = tecnico.creado_at
    ? (Date.now() - new Date(tecnico.creado_at).getTime()) / 86_400_000 <= DIAS_NUEVO
    : false;

  const telefonoLimpio = tecnico.telefono?.replace(/\D/g, "") ?? "";
  const mensaje = encodeURIComponent(
    `Hola ${nombre.split(" ")[0]}! Te encontré en Sufix, me interesa tu servicio de ${primerRubro}. ¿Estás disponible?`
  );
  const waLink = telefonoLimpio ? `https://wa.me/${telefonoLimpio}?text=${mensaje}` : null;

  return (
    <div className="card flex flex-col overflow-hidden p-4 transition hover:border-ink-300 hover:shadow-[0_8px_30px_rgba(14,17,13,0.10)]">
      <Link href={`/tecnico/${tecnico.user_id}`} className="flex flex-1 items-start gap-3">
        <Avatar url={tecnico.foto_url} initials={initials} size={56} textClass="font-display text-base" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-[15px] font-semibold text-sv-dark">{nombre}</span>
            {tecnico.verificado && (
              <span className="rounded-full bg-sv-primary/15 px-2 py-0.5 text-[10px] font-semibold text-sv-olive">
                ✓ Verificado
              </span>
            )}
            {esNuevo && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                🆕 Nuevo
              </span>
            )}
          </div>

          {subtitulo && <p className="mt-0.5 truncate text-xs text-ink-500">{subtitulo}</p>}

          <div className="mt-1.5">
            {resumen && resumen.total > 0 ? (
              <StarRating rating={resumen.promedio} reviews={resumen.total} />
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-zap-100 px-2 py-0.5 text-[11px] font-medium text-sv-olive">
                ✨ Nuevo en Sufix
              </span>
            )}
          </div>

          {tecnico.zona && <p className="mt-1 truncate text-xs text-ink-400">📍 {tecnico.zona}</p>}

          {rubrosNombres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {rubrosNombres.slice(0, 3).map((n) => (
                <span key={n} className="chip px-2 py-0.5 text-[11px]">🔧 {n}</span>
              ))}
              {rubrosNombres.length > 3 && (
                <span className="chip px-2 py-0.5 text-[11px]">+{rubrosNombres.length - 3} más</span>
              )}
            </div>
          )}
        </div>
      </Link>

      <ContactarWhatsAppButton
        tecnicoId={tecnico.user_id}
        waLink={waLink}
        origen="home"
        className={`btn-primary mt-3 block w-full text-center text-sm ${!waLink ? "pointer-events-none opacity-50" : ""}`}
      >
        💬 Contactar por WhatsApp
      </ContactarWhatsAppButton>
    </div>
  );
}
