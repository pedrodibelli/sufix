import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { StarRating } from "@/components/StarRating";
import { ContactarWhatsAppButton } from "@/components/ContactarWhatsAppButton";
import { IconMapPin, IconVerifiedBadge, IconWhatsApp, IconSparkle } from "@/components/icons";
import { CATEGORIES } from "@/lib/data";
import { avatarColorFor } from "@/lib/avatarColors";
import { type TecnicoPublico } from "@/components/TecnicoCard";
import { DejarResenaForm } from "@/app/tecnico/[id]/DejarResenaForm";

export type Resumen = { promedio: number; total: number };

export type ContactoItem = {
  perfil: TecnicoPublico;
  resumen?: Resumen;
  veces: number;
  ultimaFecha: string;
  yaResenado: boolean;
};

// Reemplaza la vieja "Mis consultas" del demandante (atada a publicar un
// problema, ya sin uso). Ahora es el historial de a quiénes les tocó
// "Contactar por WhatsApp" — datos que ya veníamos guardando en
// contactos_tecnico para medir movimiento, reaprovechados acá.
export function TecnicosContactadosView({ items }: { items: ContactoItem[] }) {
  if (items.length === 0) {
    return (
      <div className="card p-10 text-center">
        <h1 className="display text-2xl text-sv-dark">Técnicos que contacté</h1>
        <p className="mt-3 text-ink-400">
          Todavía no contactaste a ningún técnico. Mirá el directorio y escribile al que te convenza.
        </p>
        <Link href="/#tecnicos" className="btn-primary mt-5 inline-block">
          Ver técnicos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="display text-2xl text-sv-dark">Técnicos que contacté</h1>
      <p className="mt-1 text-sm text-ink-400">
        {items.length} {items.length === 1 ? "técnico contactado" : "técnicos contactados"}
      </p>

      <div className="mt-6 space-y-4">
        {items.map(({ perfil, resumen, veces, ultimaFecha, yaResenado }) => {
          const nombre = perfil.nombre ?? "Profesional";
          const initials = nombre.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
          const rubroCats = (perfil.rubro ?? []).map((slug) => CATEGORIES.find((c) => c.slug === slug)).filter((c): c is (typeof CATEGORIES)[number] => !!c);
          const telefonoLimpio = perfil.telefono?.replace(/\D/g, "") ?? "";
          const mensaje = encodeURIComponent(
            `Hola ${nombre.split(" ")[0]}! Te contacto por Sufix por mi consulta. ¿Podemos hablar?`
          );
          const waLink = telefonoLimpio ? `https://wa.me/${telefonoLimpio}?text=${mensaje}` : null;

          const sinResenas = !resumen || resumen.total === 0;

          return (
            <div key={perfil.user_id} className="card relative p-5">
              {sinResenas && (
                <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                  <IconSparkle className="h-3 w-3" /> Nuevo en Sufix
                </span>
              )}

              <div className={`flex items-start gap-3.5 ${sinResenas ? "mt-8" : ""}`}>
                <Link href={`/tecnico/${perfil.user_id}`} className="shrink-0">
                  <Avatar url={perfil.foto_url} initials={initials} size={56} fallbackColor={avatarColorFor(perfil.user_id)} textClass="font-display text-base" />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link href={`/tecnico/${perfil.user_id}`} className="truncate text-[15px] font-semibold text-sv-dark hover:underline">
                      {nombre}
                    </Link>
                    {perfil.verificado && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sv-primary/15 px-2 py-0.5 text-[10px] font-semibold text-sv-olive">
                        <IconVerifiedBadge className="h-3 w-3" /> Verificado
                      </span>
                    )}
                  </div>

                  {!sinResenas && (
                    <div className="mt-1">
                      <StarRating rating={resumen.promedio} reviews={resumen.total} />
                    </div>
                  )}

                  {perfil.zona && (
                    <p className="mt-1.5 flex items-center gap-1 truncate text-xs text-ink-400">
                      <IconMapPin className="h-3.5 w-3.5 shrink-0" /> {perfil.zona}
                    </p>
                  )}

                  <p className="mt-2 text-[11.5px] text-ink-400">
                    {veces > 1 ? `Contactado ${veces} veces · ` : ""}
                    última vez {new Date(ultimaFecha).toLocaleDateString("es-AR")}
                  </p>
                </div>
              </div>

              {rubroCats.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {rubroCats.map((c) => (
                    <span key={c.slug} className="chip px-2 py-0.5 text-[11px]">{c.icon} {c.name}</span>
                  ))}
                </div>
              )}

              <ContactarWhatsAppButton
                tecnicoId={perfil.user_id}
                waLink={waLink}
                origen="consultas"
                className={`btn mt-4 w-full bg-[#25D366] text-sm text-white hover:brightness-95 ${!waLink ? "pointer-events-none opacity-50" : ""}`}
              >
                <IconWhatsApp className="h-4 w-4" /> Contactar por WhatsApp
              </ContactarWhatsAppButton>

              {yaResenado ? (
                <p className="mt-3 text-center text-xs font-medium text-emerald-600">Ya calificaste a este técnico ✓</p>
              ) : (
                <DejarResenaForm tecnicoId={perfil.user_id} compact />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
