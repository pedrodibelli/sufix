import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { StarRating } from "@/components/StarRating";
import { ContactarWhatsAppButton } from "@/components/ContactarWhatsAppButton";
import { IconMapPin, IconCheckBadge, IconWhatsApp, IconSparkle } from "@/components/icons";
import { CATEGORIES } from "@/lib/data";
import { avatarColorFor } from "@/lib/avatarColors";

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
  modoPreview = false,
}: {
  tecnico: TecnicoPublico;
  resumen?: { promedio: number; total: number };
  // Para cuando el técnico ve SU PROPIA tarjeta (home) — no tiene sentido
  // que se contacte a sí mismo por WhatsApp, así que el botón cambia por
  // un link para editar el perfil.
  modoPreview?: boolean;
}) {
  const nombre = tecnico.nombre ?? "Profesional";
  const initials = nombre.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const rubros = tecnico.rubro ?? [];
  const rubroCats = rubros.map((slug) => CATEGORIES.find((c) => c.slug === slug)).filter((c): c is (typeof CATEGORIES)[number] => !!c);
  const rubrosNombres = rubroCats.length > 0 ? rubroCats.map((c) => c.name) : rubros;
  const primerRubro = rubrosNombres[0] ?? "un servicio";
  const bio = tecnico.titular?.trim() || "";

  const telefonoLimpio = tecnico.telefono?.replace(/\D/g, "") ?? "";
  const mensaje = encodeURIComponent(
    `Hola ${nombre.split(" ")[0]}! Te encontré en Sufix, me interesa tu servicio de ${primerRubro}. ¿Estás disponible?`
  );
  const waLink = telefonoLimpio ? `https://wa.me/${telefonoLimpio}?text=${mensaje}` : null;

  const sinResenas = !resumen || resumen.total === 0;

  // Esquema fijo (2026-08-21, pedido de revisión): avatar+nombre → zona →
  // [rating o "Nuevo en Sufix", siempre en el mismo renglón] → bio → chips →
  // botón. Antes "Nuevo" era un cartel flotante que empujaba el avatar con un
  // margen condicional (mt-8) — por eso las tarjetas con y sin reseñas
  // quedaban a distinta altura. Ahora ese lugar SIEMPRE existe, solo cambia
  // qué muestra adentro, así todas las tarjetas arrancan igual y solo varían
  // donde falta contenido opcional (bio), como corresponde.
  return (
    <div className="card flex flex-col p-5 transition hover:border-ink-300 hover:shadow-[0_8px_30px_rgba(14,17,13,0.10)]">
      <Link href={`/tecnico/${tecnico.user_id}`} className="flex flex-1 flex-col">
        <div className="flex items-start gap-3.5">
          <Avatar
            url={tecnico.foto_url}
            initials={initials}
            size={60}
            fallbackColor={avatarColorFor(tecnico.user_id)}
            textClass="font-display text-base"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[15px] font-semibold text-sv-dark">{nombre}</span>
              {tecnico.verificado && <IconCheckBadge className="h-4 w-4 shrink-0 text-sv-primary" />}
            </div>
            {tecnico.zona && (
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-400">
                <IconMapPin className="h-3.5 w-3.5 shrink-0" /> {tecnico.zona}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3">
          {sinResenas ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
              <IconSparkle className="h-3 w-3" /> Nuevo en Sufix
            </span>
          ) : (
            <StarRating rating={resumen.promedio} reviews={resumen.total} />
          )}
        </div>

        {bio && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-500">{bio}</p>}

        {rubroCats.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {rubroCats.map((c) => (
              <span key={c.slug} className="chip px-2 py-0.5 text-[11px]">{c.icon} {c.name}</span>
            ))}
          </div>
        )}
      </Link>

      {modoPreview ? (
        <Link href="/perfil" className="btn-outline mt-4 block w-full text-center text-sm">
          Editar mi perfil
        </Link>
      ) : (
        <ContactarWhatsAppButton
          tecnicoId={tecnico.user_id}
          waLink={waLink}
          origen="home"
          className={`btn mt-4 w-full bg-[#25D366] text-white hover:brightness-95 ${!waLink ? "pointer-events-none opacity-50" : ""}`}
        >
          <IconWhatsApp className="h-4 w-4" /> Contactar por WhatsApp
        </ContactarWhatsAppButton>
      )}
    </div>
  );
}
