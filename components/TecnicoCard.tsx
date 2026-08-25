import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { StarRating } from "@/components/StarRating";
import { ContactarWhatsAppButton } from "@/components/ContactarWhatsAppButton";
import { IconMapPin, IconVerifiedBadge, IconWhatsApp, IconSparkle } from "@/components/icons";
import { CATEGORIES } from "@/lib/data";
import { avatarColorFor } from "@/lib/avatarColors";
import { toTitleCase } from "@/lib/format";

export type TecnicoPublico = {
  user_id: string;
  nombre: string | null;
  zona: string[] | null;
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
  const zonas = tecnico.zona ?? [];
  // En la tarjeta chica se muestra solo la primera zona + "+N más" (mismo
  // truco que los chips de rubro) — un técnico puede cubrir 6 barrios, pero
  // listarlos todos acá rompería el alto parejo de las tarjetas. La lista
  // completa se ve en el perfil (/tecnico/[id]).
  const zonaPrincipal = zonas[0] ?? null;
  const zonasRestantes = zonas.length - 1;
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

  // Esquema fijo (2026-08-24, tercera vuelta): "Verificado" pasó a ser el
  // sello flotante en la esquina (antes lo era "Nuevo") — es la señal más
  // fuerte de las dos, así que se gana el lugar más visible. "Nuevo en
  // Sufix" bajó al renglón donde antes iba el texto de Verificado, ya sin
  // forma de estampilla, solo texto — un técnico puede ser nuevo Y
  // verificado a la vez (son independientes, cada uno en su lugar). Cuando
  // hay sello arriba, se empuja todo el renglón de avatar+nombre hacia abajo
  // (mt-6) en vez de recortar el ancho del nombre — mismo patrón que ya usa
  // el sello "Nuevo en Sufix" de TecnicosContactadosView.tsx. El renglón de
  // abajo de la zona SIEMPRE existe y SIEMPRE es sobre reseñas: la
  // calificación si tiene, o "Sin reseñas aún" si no — así nunca cambia de
  // alto según el caso. Los chips de rubro tienen tope (MAX_CHIPS) con
  // "+N más" para que la tarjeta nunca crezca de más por tener muchos rubros.
  return (
    <div className="card relative flex flex-col p-5 transition hover:border-ink-300 hover:shadow-[0_8px_30px_rgba(14,17,13,0.10)]">
      {tecnico.verificado && (
        <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-sv-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-sv-olive shadow-sm">
          <IconVerifiedBadge className="h-3 w-3" /> Verificado
        </span>
      )}

      <Link href={`/tecnico/${tecnico.user_id}`} className="flex flex-1 flex-col">
        <div className={`flex items-start gap-3.5 ${tecnico.verificado ? "mt-6" : ""}`}>
          <Avatar
            url={tecnico.foto_url}
            initials={initials}
            size={60}
            fallbackColor={avatarColorFor(tecnico.user_id)}
            textClass="font-display text-base"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {/* min-w-0 es lo que hace que el truncate funcione de verdad:
                  sin esto, un item de flex no se achica por debajo de su
                  contenido y nunca llega a cortar con "..." — por eso un
                  nombre de 3+ palabras se desbordaba hacia la insignia. */}
              <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-sv-dark">{nombre}</span>
            </div>
            {zonaPrincipal && (
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-400">
                <IconMapPin className="h-3.5 w-3.5 shrink-0" />
                {zonaPrincipal}
                {zonasRestantes > 0 && ` +${zonasRestantes} más`}
              </p>
            )}
            {/* Antes acá iba el texto de "Verificado" — ahora ese sello vive
                arriba a la derecha (más visible), y este renglón quedó libre
                para "Nuevo en Sufix" en su lugar. */}
            {esNuevo && (
              <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-blue-600">
                <IconSparkle className="h-3.5 w-3.5 shrink-0" /> Nuevo en Sufix
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
