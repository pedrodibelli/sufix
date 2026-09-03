import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { StarRating } from "@/components/StarRating";
import { ContactarWhatsAppButton } from "@/components/ContactarWhatsAppButton";
import { IconMapPin, IconVerifiedBadge, IconWhatsApp, IconSparkle, IconOficio } from "@/components/icons";
import { CATEGORIES } from "@/lib/data";
import { avatarColorFor } from "@/lib/avatarColors";
import { toTitleCase } from "@/lib/format";
import { calificacionEfectiva } from "@/lib/reputacion";
import { mensajeWhatsApp } from "@/lib/whatsapp";

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
  // Reputación externa (Google Maps, PorAca, etc. — opt-in por técnico,
  // ver migración 20260903b) — NULL para quien no confirmó que quiere
  // mostrarla.
  reputacion_fuente?: string | null;
  reputacion_rating?: number | null;
  reputacion_total?: number | null;
  reputacion_url?: string | null;
};

const DIAS_NUEVO = 20;
const MAX_CHIPS = 3;

export function TecnicoCard({
  tecnico,
  resumen,
  modoPreview = false,
  rubroContexto = null,
}: {
  tecnico: TecnicoPublico;
  resumen?: { promedio: number; total: number };
  // Slug del oficio por el que el usuario llegó a esta tarjeta, si lo hay.
  // Lo pasa /categoria/[slug]; la home no pasa nada porque no puede saberlo.
  // Sirve para dos cosas: el mensaje de WhatsApp y el link al perfil, que se
  // lo lleva en la URL para que allá tampoco se pierda el contexto.
  rubroContexto?: string | null;
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
  // Solo se nombra el oficio si el técnico realmente lo tiene cargado —
  // defensivo, aunque /categoria/[slug] ya filtra por eso.
  const rubroDelContexto = rubroContexto && rubros.includes(rubroContexto)
    ? CATEGORIES.find((c) => c.slug === rubroContexto)?.name ?? null
    : null;
  const bio = tecnico.titular?.trim() || "";

  const telefonoLimpio = tecnico.telefono?.replace(/\D/g, "") ?? "";
  const mensaje = encodeURIComponent(
    mensajeWhatsApp(nombre, rubroDelContexto)
  );
  const waLink = telefonoLimpio ? `https://wa.me/${telefonoLimpio}?text=${mensaje}` : null;

  const calificacion = calificacionEfectiva(tecnico, resumen);
  const sinResenas = calificacion.total === 0;
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
    // border-sv-dark/[0.09] pisa el borde casi invisible de .card (zap-100)
    // para que coincida con el mockup — ahí sv-dark es literalmente rgb(29,46,32).
    <div className="card relative flex flex-col border-sv-dark/[0.09] p-5 transition-colors duration-200 hover:border-sv-dark/20 hover:shadow-[0_16px_36px_-20px_rgba(29,46,32,0.28)]">
      {tecnico.verificado && (
        <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-[#25D366]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#25D366] shadow-sm">
          <IconVerifiedBadge className="h-3 w-3" /> Verificado
        </span>
      )}

      <Link
        href={`/tecnico/${tecnico.user_id}${rubroDelContexto ? `?rubro=${rubroContexto}` : ""}`}
        className="flex flex-1 flex-col"
      >
        {/* mt-6 fijo siempre (no solo si verificado): el sello ocupa ese
            espacio arriba a la derecha para quien lo tiene, pero todas las
            tarjetas necesitan el mismo aire reservado — si no, las que no
            tienen Verificado quedan con la foto/nombre más arriba que las
            que sí, y se nota feo la desalineación en la grilla. */}
        <div className="mt-6 flex items-start gap-3.5">
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
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <StarRating rating={calificacion.promedio} reviews={calificacion.total} />
              {calificacion.fuenteExterna && (
                <span className="text-[11px] font-medium text-ink-400">· {calificacion.fuenteExterna}</span>
              )}
            </div>
          )}
        </div>

        {bio && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-500">{bio}</p>}

        {chipsVisibles.length > 0 && (
          <>
            {/* Separador punteado (look nuevo 2026-08-28) antes de los rubros */}
            <div className="mt-3.5 border-t border-dashed border-ink-200" />
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {chipsVisibles.map((c) => (
                <span key={c.slug} className="chip inline-flex items-center gap-1 border-sv-primary px-2 py-0.5 text-[11px]">
                  <IconOficio slug={c.slug} className="h-3 w-3 shrink-0 text-sv-primary" />
                  {c.name}
                </span>
              ))}
              {chipsRestantes > 0 && (
                <span className="chip px-2 py-0.5 text-[11px] text-ink-400">+{chipsRestantes} más</span>
              )}
            </div>
          </>
        )}
      </Link>

      {modoPreview ? (
        <Link href="/perfil" className="btn-outline mt-4 block w-full text-center text-sm">
          Editar mi perfil
        </Link>
      ) : (
        // Botón con contorno (look nuevo 2026-08-28): antes era verde relleno,
        // ahora fondo claro + borde/texto verde WhatsApp, se rellena al hover.
        <ContactarWhatsAppButton
          tecnicoId={tecnico.user_id}
          waLink={waLink}
          origen="home"
          className={`btn mt-4 w-full border-[1.5px] border-[#25D366] bg-[#FBF8EF] text-[#1a9e4d] transition hover:bg-[#25D366] hover:text-white ${!waLink ? "pointer-events-none opacity-50" : ""}`}
        >
          <IconWhatsApp className="h-4 w-4" /> Contactar por WhatsApp
        </ContactarWhatsAppButton>
      )}
    </div>
  );
}
