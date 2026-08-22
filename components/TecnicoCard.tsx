import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { StarRating } from "@/components/StarRating";
import { ContactarWhatsAppButton } from "@/components/ContactarWhatsAppButton";
import { IconMapPin, IconCheckBadge, IconWhatsApp, IconStampBadge } from "@/components/icons";
import { CATEGORIES } from "@/lib/data";
import { avatarColorFor } from "@/lib/avatarColors";
import { toTitleCase } from "@/lib/format";

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

const DIAS_NUEVO = 20;
const MAX_CHIPS = 3;

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
  const nombre = toTitleCase(tecnico.nombre ?? "Profesional");
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
  const esNuevo = tecnico.creado_at
    ? (Date.now() - new Date(tecnico.creado_at).getTime()) / 86_400_000 <= DIAS_NUEVO
    : false;
  const chipsVisibles = rubroCats.slice(0, MAX_CHIPS);
  const chipsRestantes = rubroCats.length - chipsVisibles.length;

  // Esquema fijo (2026-08-21, segunda vuelta): "nuevo" y "calificación" son dos
  // cosas independientes, no compiten por el mismo lugar. "Nuevo" es un sello
  // flotante en la esquina (antigüedad de cuenta, no depende de si ya tiene
  // reseñas) que no empuja nada — no reserva espacio, solo se superpone. El
  // renglón de abajo de la zona SIEMPRE existe y SIEMPRE es sobre reseñas:
  // la calificación si tiene, o "Sin reseñas aún" si no — así nunca cambia
  // de alto según el caso. Los chips de rubro tienen tope (MAX_CHIPS) con
  // "+N más" para que la tarjeta nunca crezca de más por tener muchos rubros.
  return (
    <div className="card relative flex flex-col p-5 transition hover:border-ink-300 hover:shadow-[0_8px_30px_rgba(14,17,13,0.10)]">
      {esNuevo && (
        <span className="absolute -right-3 -top-3 z-10 h-14 w-14 text-blue-600 drop-shadow-md">
          <IconStampBadge />
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold uppercase leading-none tracking-wide text-white">
            Nuevo
          </span>
        </span>
      )}

      <Link href={`/tecnico/${tecnico.user_id}`} className="flex flex-1 flex-col">
        <div className="flex items-start gap-3.5">
          <Avatar
            url={tecnico.foto_url}
            initials={initials}
            size={60}
            fallbackColor={avatarColorFor(tecnico.user_id)}
            textClass="font-display text-base"
          />
          <div className={`min-w-0 flex-1 ${esNuevo ? "pr-6" : ""}`}>
            <div className="flex items-center gap-1.5">
              {/* min-w-0 es lo que hace que el truncate funcione de verdad:
                  sin esto, un item de flex no se achica por debajo de su
                  contenido y nunca llega a cortar con "..." — por eso un
                  nombre de 3+ palabras se desbordaba hacia la insignia. */}
              <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-sv-dark">{nombre}</span>
            </div>
            {tecnico.zona && (
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-400">
                <IconMapPin className="h-3.5 w-3.5 shrink-0" /> {tecnico.zona}
              </p>
            )}
            {/* Tercera línea al lado de la foto, solo si está verificado —
                reemplaza el ícono chiquito que antes iba pegado al nombre
                (evita mostrar la misma señal dos veces). El avatar mide 60px
                y 3 líneas cortas no llegan a esa altura, así que no rompe la
                simetría entre tarjetas verificadas y no verificadas. */}
            {tecnico.verificado && (
              <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-sv-primary">
                <IconCheckBadge className="h-3.5 w-3.5 shrink-0" /> Verificado
              </p>
            )}
          </div>
        </div>

        <div className="mt-3">
          {sinResenas ? (
            <span className="text-xs text-ink-400">Sin reseñas aún</span>
          ) : (
            <StarRating rating={resumen.promedio} reviews={resumen.total} />
          )}
        </div>

        {bio && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-500">{bio}</p>}

        {chipsVisibles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {chipsVisibles.map((c) => (
              <span key={c.slug} className="chip px-2 py-0.5 text-[11px]">{c.icon} {c.name}</span>
            ))}
            {chipsRestantes > 0 && (
              <span className="chip px-2 py-0.5 text-[11px] text-ink-400">+{chipsRestantes} más</span>
            )}
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
