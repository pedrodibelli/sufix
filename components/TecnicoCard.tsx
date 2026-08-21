import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { StarRating } from "@/components/StarRating";
import { ContactarWhatsAppButton } from "@/components/ContactarWhatsAppButton";
import { IconMapPin, IconCheckBadge } from "@/components/icons";
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
  const rubroCats = rubros.map((slug) => CATEGORIES.find((c) => c.slug === slug)).filter((c): c is (typeof CATEGORIES)[number] => !!c);
  const rubrosNombres = rubroCats.length > 0 ? rubroCats.map((c) => c.name) : rubros;
  const primerRubro = rubrosNombres[0] ?? "un servicio";
  const subtitulo = tecnico.titular?.trim() || rubrosNombres.join(" · ");

  const telefonoLimpio = tecnico.telefono?.replace(/\D/g, "") ?? "";
  const mensaje = encodeURIComponent(
    `Hola ${nombre.split(" ")[0]}! Te encontré en Sufix, me interesa tu servicio de ${primerRubro}. ¿Estás disponible?`
  );
  const waLink = telefonoLimpio ? `https://wa.me/${telefonoLimpio}?text=${mensaje}` : null;

  return (
    <div className="card flex flex-col overflow-hidden p-5 transition hover:border-ink-300 hover:shadow-[0_8px_30px_rgba(14,17,13,0.10)]">
      <Link href={`/tecnico/${tecnico.user_id}`} className="flex flex-1 items-start gap-3.5">
        <Avatar url={tecnico.foto_url} initials={initials} size={60} textClass="font-display text-base" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-[15px] font-semibold text-sv-dark">{nombre}</span>
            {tecnico.verificado && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sv-primary/15 px-2 py-0.5 text-[10px] font-semibold text-sv-olive">
                <IconCheckBadge className="h-3 w-3" /> Verificado
              </span>
            )}
          </div>

          {subtitulo && <p className="mt-0.5 truncate text-xs text-ink-500">{subtitulo}</p>}

          <div className="mt-1.5">
            {resumen && resumen.total > 0 ? (
              <StarRating rating={resumen.promedio} reviews={resumen.total} />
            ) : (
              <span className="inline-flex items-center rounded-full bg-zap-100 px-2 py-0.5 text-[11px] font-medium text-sv-olive">
                Nuevo en Sufix
              </span>
            )}
          </div>

          {tecnico.zona && (
            <p className="mt-1.5 flex items-center gap-1 truncate text-xs text-ink-400">
              <IconMapPin className="h-3.5 w-3.5 shrink-0" /> {tecnico.zona}
            </p>
          )}

          {rubroCats.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {rubroCats.slice(0, 3).map((c) => (
                <span key={c.slug} className="chip px-2 py-0.5 text-[11px]">{c.icon} {c.name}</span>
              ))}
              {rubroCats.length > 3 && (
                <span className="chip px-2 py-0.5 text-[11px]">+{rubroCats.length - 3} más</span>
              )}
            </div>
          )}
        </div>
      </Link>

      <ContactarWhatsAppButton
        tecnicoId={tecnico.user_id}
        waLink={waLink}
        origen="home"
        className={`btn-primary mt-4 block w-full text-center text-sm ${!waLink ? "pointer-events-none opacity-50" : ""}`}
      >
        Contactar por WhatsApp
      </ContactarWhatsAppButton>
    </div>
  );
}
