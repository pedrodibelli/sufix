"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/data";
import { CategoryArt } from "@/components/CategoryArt";
import { rechazarPropuesta, eliminarPublicacion, crearResena, elegirTecnico } from "./actions";
import { COMISION_CONSULTA } from "@/lib/config";
import { AceptarModal, type PropuestaParaPago, type PublicacionParaPago } from "@/components/AceptarModal";
import { ReportarProblemaModal } from "./ReportarProblemaModal";
import { StarRating } from "@/components/StarRating";

type Resumen = { promedio: number; total: number };

type Propuesta = {
  id: string;
  precio: number;
  nombre_profesional: string | null;
  profesional_id: string;
  profesional_email: string | null;
  profesional_telefono: string | null;
  profesional_zona: string | null;
  codigo_pago: string | null;
  estado: string | null;
  publicacion_id: string;
  created_at: string;
  descuenta_de_presupuesto: boolean | null;
  contacto_directo: boolean | null;
};

type PerfilProfesional = {
  user_id: string;
  nombre: string | null;
  telefono: string | null;
  email: string | null;
  zona: string | null;
};

type Publicacion = {
  id: string;
  title: string;
  description: string;
  category_slug: string;
  zone: string;
  status: string;
  created_at: string;
  photo: string | null;
  photos: string[];
  propuestas: Propuesta[];
};

// "activa" incluye abierto + en_curso
type Tab = "abierto" | "cerrado";

// ─── StatusPill ───────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    abierto:     { label: "Activa",            cls: "bg-sv-primary/10 text-sv-olive" },
    en_revision: { label: "Pago en revisión",  cls: "bg-amber-100 text-amber-700" },
    en_curso:    { label: "En curso",          cls: "bg-blue-100 text-blue-700" },
    en_disputa: { label: "En disputa",  cls: "bg-rose-100 text-rose-700" },
    cerrado:    { label: "Cerrada",     cls: "bg-ink-100 text-ink-500" },
    aceptada:   { label: "Aceptada",    cls: "bg-sv-primary/10 text-sv-olive" },
    rechazada:  { label: "Rechazada",   cls: "bg-rose-100 text-rose-700" },
    pendiente:  { label: "Pendiente",   cls: "bg-amber-100 text-amber-700" },
    completada: { label: "Completada",  cls: "bg-emerald-100 text-emerald-700" },
    interesado: { label: "Interesado",  cls: "bg-blue-100 text-blue-700" },
  };
  const s = map[status] ?? map.abierto;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${s.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {s.label}
    </span>
  );
}

// ─── ConsultaThumb ────────────────────────────────────────────────────────────
function ConsultaThumb({ slug, photo }: { slug: string; photo: string | null }) {
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (photo) {
    return (
      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-2xl sm:h-16 sm:w-16">
        <Image src={photo} alt="" fill sizes="72px" className="object-cover" />
      </div>
    );
  }
  return (
    <CategoryArt
      icon={cat?.icon ?? "🔧"}
      hue={cat?.hue ?? 180}
      className="h-[72px] w-[72px] shrink-0 rounded-2xl sm:h-16 sm:w-16"
    />
  );
}

// ─── CodigoOTPBlock ───────────────────────────────────────────────────────────
function CodigoOTPBlock({ codigo }: { codigo: string }) {
  return (
    <div className="border-t border-ink-100 bg-amber-50 px-5 py-4">
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-amber-700">
        🔑 Tu código de confirmación
      </p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-amber-900">
        Entregáselo al técnico <strong>solo cuando el trabajo esté completo</strong>, para que pueda
        cerrarlo en SolvIT. No lo compartas antes.
      </p>
      <div className="mt-3 flex items-center justify-center rounded-xl border border-amber-300 bg-white py-4">
        <span className="font-display text-4xl font-bold tracking-[0.35em] text-amber-800">
          {codigo}
        </span>
      </div>
    </div>
  );
}

// ─── PropuestaRow ─────────────────────────────────────────────────────────────
function PropuestaRow({
  propuesta,
  publicacion,
  resumen,
  onAceptar,
}: {
  propuesta: Propuesta;
  publicacion: Publicacion;
  resumen?: Resumen;
  onAceptar: (p: Propuesta, pub: Publicacion) => void;
}) {
  const [pending, startTransition] = useTransition();

  const nombre = propuesta.nombre_profesional ?? "Profesional";
  const initials = nombre
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const estado = propuesta.estado ?? "pendiente";
  const isAccepted = estado === "aceptada";
  const isRejected = estado === "rechazada";

  return (
    <div className="rounded-xl border border-ink-100 bg-[#f5fdf9] p-3.5">
      {/* Fila principal: avatar + info + precio + acciones */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Avatar + info */}
        <div className="flex flex-1 items-center gap-3 min-w-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sv-dark to-sv-primary text-xs font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/tecnico/${propuesta.profesional_id}`}
                className="text-sm font-semibold text-sv-dark transition hover:text-sv-primary hover:underline"
              >
                {nombre}
              </Link>
              {(isAccepted || isRejected) && <StatusPill status={estado} />}
            </div>
            <Link href={`/tecnico/${propuesta.profesional_id}`} className="mt-0.5 inline-flex items-center gap-1.5">
              {resumen ? (
                <StarRating rating={resumen.promedio} reviews={resumen.total} />
              ) : (
                <span className="text-[11.5px] text-ink-400">Sin reseñas aún</span>
              )}
              <span className="text-[11px] font-medium text-sv-primary">Ver perfil →</span>
            </Link>
            <div className="text-[11.5px] text-ink-400">
              Enviada el {new Date(propuesta.created_at).toLocaleDateString("es-AR")}
            </div>
          </div>
        </div>

        {/* Price + actions */}
        <div className="flex items-center gap-3 sm:gap-4 sm:shrink-0">
          <div className="text-right">
            <div className="font-display text-xl font-semibold leading-none tracking-tight text-sv-dark">
              ${Number(propuesta.precio).toLocaleString("es-AR")}
            </div>
            <div className="text-[11px] text-ink-400 mt-0.5">por consulta</div>
          </div>

          {!isAccepted && !isRejected && (
            <div className="flex gap-2 ml-auto sm:ml-0">
              <button
                type="button"
                disabled={pending}
                onClick={() => startTransition(async () => rechazarPropuesta(propuesta.id))}
                className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-500 hover:bg-ink-50 disabled:opacity-50 transition"
              >
                Rechazar
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => onAceptar(propuesta, publicacion)}
                className="rounded-lg bg-sv-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-sv-olive disabled:opacity-50 transition"
              >
                Aceptar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Banner: descuenta del total */}
      {propuesta.descuenta_de_presupuesto ? (
        <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5">
          <span className="shrink-0 text-amber-500">⚠️</span>
          <p className="text-[12px] font-medium leading-relaxed text-amber-900">
            <strong>Este monto se descuenta del presupuesto final.</strong> Si aceptás, el técnico lo restará del total del trabajo.
          </p>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-2.5">
          <span className="shrink-0 text-ink-400">ℹ️</span>
          <p className="text-[12px] font-medium leading-relaxed text-ink-500">
            Este monto <strong>no se descuenta</strong> del presupuesto final. Es un cargo independiente por la consulta.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── InteresadoRow (flujo de contacto directo gratis) ─────────────────────────
// A diferencia de PropuestaRow (flujo viejo con precio): no hay nada que
// aceptar/pagar, el contacto ya está disponible. El demandante puede hablar por
// WhatsApp con varios y, cuando decide, tocar "Elegir" para arrancar el
// seguimiento (código + reseña).
function InteresadoRow({
  propuesta,
  publicacion,
  perfil,
  resumen,
  puedeElegir,
  onElegido,
}: {
  propuesta: Propuesta;
  publicacion: Publicacion;
  perfil?: PerfilProfesional;
  resumen?: Resumen;
  puedeElegir: boolean;
  onElegido: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [confirmandoElegir, setConfirmandoElegir] = useState(false);

  const nombre = propuesta.nombre_profesional ?? "Profesional";
  const primerNombre = nombre.split(" ")[0];
  const initials = nombre.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const telefono = perfil?.telefono ?? null;

  const cat = CATEGORIES.find((c) => c.slug === publicacion.category_slug);
  const mensaje = encodeURIComponent(
    `Hola ${primerNombre}! Te contacto por SolvIT por mi consulta: "${publicacion.title}" (${cat?.name ?? publicacion.category_slug} · ${publicacion.zone}). ¿Podemos hablar?`
  );
  const waLink = telefono ? `https://wa.me/${telefono.replace(/\D/g, "")}?text=${mensaje}` : null;

  function handleElegir() {
    setError("");
    startTransition(async () => {
      const r = await elegirTecnico(propuesta.id, publicacion.id);
      if ("error" in r) {
        setError(r.error);
        return;
      }
      onElegido();
    });
  }

  return (
    <div className="rounded-xl border border-ink-100 bg-[#f5fdf9] p-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3 min-w-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sv-dark to-sv-primary text-xs font-bold text-white">
            {initials}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/tecnico/${propuesta.profesional_id}`}
                className="text-sm font-semibold text-sv-dark transition hover:text-sv-primary hover:underline"
              >
                {nombre}
              </Link>
            </div>
            <Link href={`/tecnico/${propuesta.profesional_id}`} className="mt-0.5 inline-flex items-center gap-1.5">
              {resumen ? (
                <StarRating rating={resumen.promedio} reviews={resumen.total} />
              ) : (
                <span className="text-[11.5px] text-ink-400">Sin reseñas aún</span>
              )}
              <span className="text-[11px] font-medium text-sv-primary">Ver perfil →</span>
            </Link>
          </div>
        </div>

        {/* Tarifa de conexión: tachada, gratis por ahora. En mobile no se repite
            acá — ya se ve grande arriba, en el header del modal. */}
        <div className="hidden text-right shrink-0 sm:block">
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-sm text-ink-300 line-through">${COMISION_CONSULTA.toLocaleString("es-AR")}</span>
            <span className="font-display text-xl font-bold leading-none tracking-tight text-emerald-600">$0</span>
          </div>
          <div className="text-[11px] text-ink-400 mt-0.5">tarifa de conexión</div>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">{error}</p>
      )}

      {!confirmandoElegir ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <a
            href={waLink ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!waLink}
            className={`flex-1 rounded-lg px-4 py-3 text-center text-sm font-semibold transition sm:py-2 sm:text-xs ${
              waLink
                ? "bg-[#25D366] text-white hover:brightness-95"
                : "pointer-events-none bg-ink-100 text-ink-400"
            }`}
          >
            💬 Hablar por WhatsApp
          </a>
          {puedeElegir && (
            <button
              type="button"
              onClick={() => setConfirmandoElegir(true)}
              className="flex-1 rounded-lg bg-sv-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-sv-olive sm:py-2 sm:text-xs"
            >
              Elegir a este técnico
            </button>
          )}
        </div>
      ) : (
        <div className="mt-3 rounded-lg border border-sv-primary/25 bg-sv-primary/5 p-3">
          <p className="text-xs text-ink-600">
            ¿Confirmás que elegís a <strong className="text-sv-dark">{primerNombre}</strong>? Se genera el
            código de seguimiento y el trabajo deja de mostrarse a nuevos técnicos.
          </p>
          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmandoElegir(false)}
              className="rounded-lg border border-ink-200 px-3 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-ink-50 disabled:opacity-50 sm:py-1.5 sm:text-xs"
            >
              Todavía no
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleElegir}
              className="rounded-lg bg-sv-primary px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-sv-olive disabled:opacity-50 sm:py-1.5 sm:text-xs"
            >
              {pending ? "Confirmando…" : `Sí, elegir a ${primerNombre}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TecnicosInteresadosModal ──────────────────────────────────────────────────
// Se abre a pantalla completa (bottom sheet en mobile) al tocar "Ver técnicos
// interesados" — antes esto se expandía inline y no llamaba la atención. El
// header destaca bien grande que conectar es gratis por ser de los primeros.
function TecnicosInteresadosModal({
  publicacion,
  interesados,
  perfilMap,
  resumenMap,
  onClose,
  onElegido,
}: {
  publicacion: Publicacion;
  interesados: Propuesta[];
  perfilMap: Record<string, PerfilProfesional>;
  resumenMap: Record<string, Resumen>;
  onClose: () => void;
  onElegido: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const ordenados = [...interesados].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div
      className="animate-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="animate-modal relative flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header celebratorio: el foco es que se note bien que es gratis */}
        <div className="relative shrink-0 bg-gradient-to-br from-sv-dark to-sv-primary px-6 pb-7 pt-6 text-center text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
          >
            ✕
          </button>
          <div className="text-4xl">🎉</div>
          <h2 className="display mt-2 text-xl font-bold leading-snug sm:text-2xl">
            {interesados.length} técnico{interesados.length !== 1 ? "s" : ""} quiere
            {interesados.length !== 1 ? "n" : ""} hacer tu trabajo
          </h2>
          <p className="mt-2 text-[13px] text-white/80">
            Sos de los primeros usuarios de SolvIT — por eso conectar es
          </p>
          <div className="mt-1.5 flex items-center justify-center gap-2.5">
            <span className="text-lg font-medium text-white/50 line-through">
              ${COMISION_CONSULTA.toLocaleString("es-AR")}
            </span>
            <span className="font-display text-4xl font-extrabold text-emerald-300">$0</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#f5fdf9] p-4">
          <div className="space-y-2.5">
            {ordenados.map((prop) => (
              <InteresadoRow
                key={prop.id}
                propuesta={prop}
                publicacion={publicacion}
                perfil={perfilMap[prop.profesional_id]}
                resumen={resumenMap[prop.profesional_id]}
                puedeElegir={publicacion.status === "abierto"}
                onElegido={onElegido}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ProfesionalContacto ──────────────────────────────────────────────────────
function ProfesionalContacto({
  propuesta,
  pubTitle,
  pubStatus,
  perfil,
}: {
  propuesta: Propuesta;
  pubTitle: string;
  pubStatus: string;
  perfil: PerfilProfesional | null;
}) {
  const [reportando, setReportando] = useState(false);
  const nombre = propuesta.nombre_profesional ?? "Profesional";
  const puedeReportar = pubStatus === "en_curso" || pubStatus === "cerrado";
  const initials = nombre.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  // Prefiere datos de perfiles_profesionales; retrocompatible con propuestas antiguas
  const telefono = perfil?.telefono ?? propuesta.profesional_telefono ?? null;
  const emailPro = perfil?.email ?? propuesta.profesional_email ?? null;
  const mensaje = encodeURIComponent(
    `Hola ${nombre.split(" ")[0]}! Te contacto por SolvIT, acepté tu propuesta para el trabajo: "${pubTitle}". ¿Cuándo podemos coordinar la primera consulta?`
  );
  const waLink = telefono
    ? `https://wa.me/${telefono.replace(/\D/g, "")}?text=${mensaje}`
    : null;

  return (
    <div className="border-t border-ink-100 bg-sv-primary/4 px-5 py-4">
      <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-wide text-sv-olive">
        🔓 Datos desbloqueados
      </p>

      {/* Pro header */}
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sv-dark to-sv-primary text-xs font-bold text-white">
          {initials}
        </span>
        <div>
          <p className="text-sm font-semibold text-sv-dark">{nombre}</p>
          <p className="text-[11px] text-ink-400">Profesional verificado en SolvIT</p>
        </div>
      </div>

      {/* Filas de contacto */}
      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white divide-y divide-ink-100">
        {telefono && (
          <div className="flex items-center gap-3 px-4 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Teléfono</p>
              <p className="truncate text-sm font-medium text-sv-dark">{telefono}</p>
            </div>
          </div>
        )}
        {emailPro && (
          <div className="flex items-center gap-3 px-4 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Email</p>
              <p className="truncate text-sm font-medium text-sv-dark">{emailPro}</p>
            </div>
          </div>
        )}
        {propuesta.profesional_zona && (
          <div className="px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">Zona</p>
            <p className="text-sm font-medium text-sv-dark">{propuesta.profesional_zona} · zona de trabajo</p>
          </div>
        )}
      </div>

      {/* Trabajo ya cerrado */}
      {pubStatus === "cerrado" && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-[12.5px] font-semibold text-emerald-700">✓ Trabajo finalizado</p>
          <p className="mt-1 text-[12px] leading-relaxed text-emerald-700/80">
            El servicio se completó y la consulta quedó cerrada. Dejamos los datos del profesional por si los necesitás más adelante.
          </p>
        </div>
      )}

      {waLink && (
        <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-primary mt-3 block w-full text-center text-sm hover:!bg-[#1ebe5d]">
          WhatsApp a {nombre.split(" ")[0]}
        </a>
      )}

      {puedeReportar && (
        <button
          type="button"
          onClick={() => setReportando(true)}
          className="mt-3 w-full text-center text-xs text-ink-400 transition hover:text-rose-600"
        >
          ¿Hubo un problema? Reportalo acá
        </button>
      )}

      {reportando && (
        <ReportarProblemaModal
          propuestaId={propuesta.id}
          publicacionId={propuesta.publicacion_id}
          rol="demandante"
          onClose={() => setReportando(false)}
        />
      )}
    </div>
  );
}

// ─── MiConsultaCard ───────────────────────────────────────────────────────────
// ─── CalificarBlock ───────────────────────────────────────────────────────────
function CalificarBlock({
  publicacionId,
  yaResenada,
}: {
  publicacionId: string;
  yaResenada: boolean;
}) {
  const router = useRouter();
  const [estrellas, setEstrellas] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [pending, startT] = useTransition();
  const [error, setError] = useState("");
  const [listo, setListo] = useState(false);

  if (yaResenada || listo) {
    return (
      <div className="border-t border-ink-100 bg-emerald-50 px-5 py-4">
        <p className="text-[12.5px] font-semibold text-emerald-700">
          ⭐ ¡Gracias por calificar al técnico!
        </p>
      </div>
    );
  }

  function enviar() {
    if (estrellas < 1) {
      setError("Elegí cuántas estrellas.");
      return;
    }
    setError("");
    startT(async () => {
      const r = await crearResena(publicacionId, estrellas, comentario);
      if ("error" in r) {
        setError(r.error);
        return;
      }
      setListo(true);
      router.refresh();
    });
  }

  return (
    <div className="border-t border-ink-100 bg-amber-50/60 px-5 py-4">
      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-amber-700">
        ⭐ Calificá al técnico
      </p>
      <p className="mt-1 text-[12.5px] text-ink-500">
        ¿Cómo fue tu experiencia? Tu reseña ayuda a otros.
      </p>
      <div className="mt-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setEstrellas(n)}
            aria-label={`${n} estrella${n !== 1 ? "s" : ""}`}
            className={`text-2xl leading-none ${(hover || estrellas) >= n ? "text-amber-400" : "text-ink-300"}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Contá cómo fue (opcional)"
        rows={2}
        className="field mt-2 resize-none text-sm"
      />
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
      <button
        type="button"
        disabled={pending}
        onClick={enviar}
        className="btn-primary mt-2 text-sm disabled:opacity-50"
      >
        {pending ? "Enviando…" : "Enviar calificación"}
      </button>
    </div>
  );
}

function MiConsultaCard({
  pub,
  expanded,
  onToggle,
  onAceptar,
  perfilMap,
  resumenMap,
  yaResenada,
}: {
  pub: Publicacion;
  expanded: boolean;
  onToggle: () => void;
  onAceptar: (p: Propuesta, pub: Publicacion) => void;
  perfilMap: Record<string, PerfilProfesional>;
  resumenMap: Record<string, Resumen>;
  yaResenada: boolean;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(false);
  const [borrando, startBorrar] = useTransition();
  const [borrarError, setBorrarError] = useState("");
  const [mostrarInteresados, setMostrarInteresados] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú "⋯" al tocar/clickear afuera.
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickFuera(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, [menuOpen]);

  function handleEliminar() {
    setBorrarError("");
    startBorrar(async () => {
      const r = await eliminarPublicacion(pub.id);
      if ("error" in r) {
        setBorrarError(r.error);
        return;
      }
      setMenuOpen(false);
      router.refresh();
    });
  }

  const cat = CATEGORIES.find((c) => c.slug === pub.category_slug);
  const pendingCount = pub.propuestas.filter(
    (p) => !p.estado || p.estado === "pendiente"
  ).length;
  // Flujo de contacto directo gratis: técnicos interesados a la espera de que
  // el demandante elija con cuál trabajar (ver InteresadoRow más arriba).
  const interesados = pub.propuestas.filter(
    (p) => p.contacto_directo && p.estado === "interesado"
  );
  const propuestaAceptada =
    pub.propuestas.find((p) => p.estado === "aceptada" || p.estado === "completada") ?? null;
  const perfil = propuestaAceptada ? (perfilMap[propuestaAceptada.profesional_id] ?? null) : null;

  const hayInteresados = pub.status === "abierto" && interesados.length > 0;
  const hayPendientesLegacy = pub.status === "abierto" && !hayInteresados && pendingCount > 0;

  const toggleBtn = hayInteresados ? (
    <button
      type="button"
      onClick={() => setMostrarInteresados(true)}
      className="rounded-xl bg-sv-primary px-4 py-2.5 text-[12.5px] font-semibold text-white transition hover:bg-sv-olive whitespace-nowrap"
    >
      🎉 Ver {interesados.length} técnico{interesados.length !== 1 ? "s" : ""} interesado{interesados.length !== 1 ? "s" : ""}
    </button>
  ) : hayPendientesLegacy ? (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-xl px-4 py-2.5 text-[12.5px] font-semibold transition whitespace-nowrap ${
        expanded
          ? "border border-ink-200 bg-ink-50 text-sv-dark"
          : "bg-sv-dark text-white hover:bg-sv-olive"
      }`}
    >
      {expanded ? "Ocultar" : `Ver ${pendingCount} propuesta${pendingCount !== 1 ? "s" : ""}`}
    </button>
  ) : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-[0_1px_2px_rgba(40,63,59,0.04)]">
      <div className="flex gap-4 p-5">
        <ConsultaThumb slug={pub.category_slug} photo={pub.photo ?? null} />

        <div className="flex flex-1 min-w-0 flex-col gap-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <StatusPill status={pub.status} />
              <span className="text-[11.5px] text-ink-400">
                {cat?.name} · {pub.zone} · {new Date(pub.created_at).toLocaleDateString("es-AR")}
              </span>
            </div>
            <h3 className="display mt-1 text-[17px] leading-snug text-sv-dark">
              {pub.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-ink-400">{pub.description}</p>
          </div>

          {/* Botón full-width en mobile */}
          {toggleBtn && <div className="sm:hidden w-full">{toggleBtn}</div>}
        </div>

        {/* Botón inline solo en sm+ */}
        {toggleBtn && <div className="hidden sm:flex shrink-0 self-center">{toggleBtn}</div>}

        {pub.status === "abierto" && !hayInteresados && !hayPendientesLegacy && pub.propuestas.length > 0 && (
          <span className="hidden sm:flex shrink-0 self-center text-xs text-ink-400">Sin nuevas</span>
        )}

        {pub.status === "abierto" && (
          <div ref={menuRef} className="relative shrink-0 self-start">
            <button
              type="button"
              onClick={() => { setMenuOpen((v) => !v); setConfirmandoBorrar(false); }}
              aria-label="Opciones de la publicación"
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-xl leading-none transition ${
                menuOpen ? "bg-ink-100 text-ink-700" : "text-ink-400 hover:bg-ink-50 hover:text-ink-700"
              }`}
            >
              ⋯
            </button>

            {/* Menú desplegable, anclado justo debajo del botón */}
            {menuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1.5 w-60 rounded-xl border border-ink-100 bg-white p-3 shadow-lg">
                {!confirmandoBorrar ? (
                  <button
                    type="button"
                    onClick={() => setConfirmandoBorrar(true)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    🗑 Eliminar publicación
                  </button>
                ) : (
                  <div>
                    <p className="px-0.5 text-[13px] text-ink-700">
                      ¿Seguro? No se puede deshacer.
                    </p>
                    <div className="mt-2.5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmandoBorrar(false)}
                        className="flex-1 rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-600 transition hover:bg-ink-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={borrando}
                        onClick={handleEliminar}
                        className="flex-1 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                      >
                        {borrando ? "Eliminando…" : "Sí, eliminar"}
                      </button>
                    </div>
                    {borrarError && <p className="mt-1.5 text-xs text-rose-600">{borrarError}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Esperando el primer interesado — tranquiliza mientras no hay actividad */}
      {pub.status === "abierto" && pub.propuestas.length === 0 && (
        <div className="border-t border-ink-100 bg-ink-50/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sv-primary" />
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-400">
              Buscando técnicos
            </p>
          </div>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-500">
            Ya está publicado y visible para técnicos verificados de tu zona y rubro. Apenas alguien
            esté interesado te avisamos por mail y acá mismo — no hace falta que hagas nada más.
          </p>
        </div>
      )}

      {/* Técnicos interesados (contacto directo gratis) — banner clickeable y celebratorio */}
      {hayInteresados && (
        <button
          type="button"
          onClick={() => setMostrarInteresados(true)}
          className="block w-full border-t border-ink-100 bg-gradient-to-r from-sv-primary/10 to-emerald-50 px-5 py-4 text-left transition hover:from-sv-primary/15"
        >
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-sv-olive">
            🎉 {interesados.length} técnico{interesados.length !== 1 ? "s" : ""} quiere{interesados.length !== 1 ? "n" : ""} hacer este trabajo — ¡gratis!
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-500">
            Sos de los primeros usuarios: conectar no cuesta nada.{" "}
            <strong className="text-sv-dark">Tocá para ver quién es y elegir →</strong>
          </p>
        </button>
      )}

      {/* Nuevas propuestas recibidas (flujo viejo) — aviso destacado para el demandante */}
      {pub.status === "abierto" && !hayInteresados && pendingCount > 0 && !expanded && (
        <div className="border-t border-ink-100 bg-sv-primary/5 px-5 py-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-sv-olive">
            📩 {pendingCount} propuesta{pendingCount !== 1 ? "s" : ""} nueva{pendingCount !== 1 ? "s" : ""}
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-500">
            Un técnico te envió una oferta para este problema. Tocá{" "}
            <strong className="text-sv-dark">
              &ldquo;Ver {pendingCount} propuesta{pendingCount !== 1 ? "s" : ""}&rdquo;
            </strong>{" "}
            para revisarla y aceptar la que más te convenga.
          </p>
        </div>
      )}

      {/* Pago en revisión — contacto bloqueado hasta que el admin verifique */}
      {pub.status === "en_revision" && (
        <div className="border-t border-ink-100 bg-amber-50 px-5 py-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-amber-700">
            ⏳ Pago en revisión
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-amber-900">
            Estamos verificando tu transferencia. El contacto del profesional se desbloquea apenas
            confirmemos el pago. Si todavía no lo enviaste, mandanos el comprobante por WhatsApp.
          </p>
        </div>
      )}

      {/* En disputa — info para el demandante */}
      {pub.status === "en_disputa" && (
        <div className="border-t border-ink-100 bg-rose-50 px-5 py-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-rose-700">
            ⚠️ Consulta en disputa
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-rose-900">
            Se reportó un problema con este trabajo. El equipo de SolvIT está revisando el caso y te
            va a contactar para resolverlo. <strong>No entregues el código</strong> hasta que se resuelva.
          </p>
        </div>
      )}

      {/* Código OTP — visible solo para el demandante cuando el trabajo está en curso */}
      {pub.status === "en_curso" && propuestaAceptada?.codigo_pago && (
        <CodigoOTPBlock codigo={propuestaAceptada.codigo_pago} />
      )}

      {/* Datos del profesional — desbloqueados cuando la propuesta fue aceptada o completada */}
      {(pub.status === "en_curso" || pub.status === "cerrado" || pub.status === "en_disputa") && propuestaAceptada && (
        <ProfesionalContacto propuesta={propuestaAceptada} pubTitle={pub.title} pubStatus={pub.status} perfil={perfil} />
      )}

      {/* Calificar al técnico cuando el trabajo está cerrado */}
      {pub.status === "cerrado" && propuestaAceptada && (
        <CalificarBlock publicacionId={pub.id} yaResenada={yaResenada} />
      )}

      {expanded && pub.status === "abierto" && pendingCount > 0 && (
        <div className="border-t border-ink-100 px-5 pb-5 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-display text-sm font-semibold text-sv-dark">
              {pub.propuestas.length} propuesta{pub.propuestas.length !== 1 ? "s" : ""} recibidas
            </h4>
            <span className="text-[11px] text-ink-400">Ordenadas por precio</span>
          </div>
          <div className="space-y-2">
            {[...pub.propuestas]
              .filter((p) => !p.contacto_directo)
              .sort((a, b) => Number(a.precio) - Number(b.precio))
              .map((prop) => (
                <PropuestaRow
                  key={prop.id}
                  propuesta={prop}
                  publicacion={pub}
                  resumen={resumenMap[prop.profesional_id]}
                  onAceptar={onAceptar}
                />
              ))}
          </div>
        </div>
      )}

      {mostrarInteresados && (
        <TecnicosInteresadosModal
          publicacion={pub}
          interesados={interesados}
          perfilMap={perfilMap}
          resumenMap={resumenMap}
          onClose={() => setMostrarInteresados(false)}
          onElegido={() => {
            setMostrarInteresados(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

// ─── StatCell ─────────────────────────────────────────────────────────────────
function statBorder(i: number) {
  const cls: string[] = ["border-ink-100"];
  if (i % 2 === 1) cls.push("border-l");
  if (i >= 2) cls.push("border-t", "sm:border-t-0");
  if (i > 0) cls.push("sm:border-l");
  return cls.join(" ");
}

// ─── DemandanteView ───────────────────────────────────────────────────────────
export function DemandanteView({
  publicaciones,
  perfilMap,
  resumenMap,
  resenadasIds,
  nombre,
  apellido,
  email,
}: {
  publicaciones: Publicacion[];
  perfilMap: Record<string, PerfilProfesional>;
  resumenMap: Record<string, Resumen>;
  resenadasIds: string[];
  nombre?: string;
  apellido?: string;
  email?: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("abierto");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pagoInfo, setPagoInfo] = useState<{ propuesta: Propuesta; publicacion: Publicacion } | null>(null);

  // Notificaciones en vivo: las maneja RealtimeRefresh (montado en el Header
  // para toda la app) — escucha cambios en `propuestas` y hace router.refresh(),
  // lo que además actualiza el punto rojo del nav. No hace falta una suscripción
  // propia acá.

  function handleAceptar(propuesta: Propuesta, publicacion: Publicacion) {
    setPagoInfo({ propuesta, publicacion });
  }

  function handleCerrarModal() {
    setPagoInfo(null);
    router.refresh();
  }

  const displayName = [nombre, apellido].filter(Boolean).join(" ") || email || "Usuario";
  const initials =
    nombre && apellido
      ? `${nombre[0]}${apellido[0]}`.toUpperCase()
      : nombre
      ? nombre.slice(0, 2).toUpperCase()
      : "U";

  const totalPropuestas = publicaciones.reduce((s, p) => s + p.propuestas.length, 0);

  const stats = [
    { value: publicaciones.filter((p) => p.status === "abierto" || p.status === "en_revision" || p.status === "en_curso" || p.status === "en_disputa").length, label: "Consultas activas", accent: true },
    { value: publicaciones.filter((p) => p.status === "cerrado").length, label: "Resueltas", accent: false },
    { value: totalPropuestas, label: "Propuestas recibidas", accent: false },
    { value: publicaciones.filter((p) => p.propuestas.some((pr) => pr.estado === "aceptada" || pr.estado === "completada")).length, label: "Con profesional", accent: false },
  ];

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "abierto",  label: "Activas",  count: publicaciones.filter((p) => p.status === "abierto" || p.status === "en_revision" || p.status === "en_curso" || p.status === "en_disputa").length },
    { id: "cerrado",  label: "Cerradas", count: publicaciones.filter((p) => p.status === "cerrado").length },
  ];

  // "abierto" tab incluye tanto abierto como en_curso
  const filtered = tab === "abierto"
    ? publicaciones.filter((p) => p.status === "abierto" || p.status === "en_revision" || p.status === "en_curso" || p.status === "en_disputa")
    : publicaciones.filter((p) => p.status === "cerrado");

  if (publicaciones.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="text-4xl">📋</div>
        <h3 className="display mt-3 text-2xl">Todavía no publicaste nada</h3>
        <p className="mt-2 text-ink-400">
          Cuando publiques un problema, lo vas a ver acá junto con las propuestas que recibas.
        </p>
        <Link href="/publicar" className="btn-primary mt-6">
          Publicar mi primer problema
        </Link>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-4 sm:space-y-5">
      {/* Profile header — compacto en mobile para no tapar las consultas */}
      <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-3.5 shadow-[0_1px_2px_rgba(40,63,59,0.04)] sm:gap-5 sm:p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sv-dark to-sv-primary font-display text-base font-semibold text-white sm:h-20 sm:w-20 sm:text-3xl">
          {initials}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:mb-1.5 sm:gap-2.5">
            <h1 className="display text-base sm:text-2xl">{displayName}</h1>
            <span className="rounded-full bg-zap-100 px-2 py-0.5 text-[10.5px] font-semibold text-zap-700 sm:px-2.5 sm:py-1 sm:text-[11.5px]">
              Demandante
            </span>
          </div>
          {email && <p className="hidden text-sm text-ink-400 sm:block">✉ {email}</p>}
        </div>
      </div>

      {/* Stat strip — en mobile, solo las 2 métricas que importan para actuar */}
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-ink-100 bg-white sm:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`p-3 sm:p-5 ${statBorder(i)} ${i >= 2 ? "hidden sm:block" : ""}`}>
            <div
              className={`font-display text-xl leading-none tracking-tight sm:text-[28px] ${
                s.accent ? "text-sv-primary" : "text-sv-dark"
              }`}
            >
              {s.value}
            </div>
            <div className="mt-1 text-[11px] text-ink-400 sm:mt-1.5 sm:text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Section */}
      <div>
        <h2 className="display mb-3 text-lg sm:mb-3.5 sm:text-[22px]">Mis consultas</h2>

        {/* Tab bar */}
        <div className="flex border-b border-ink-100">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`mr-5 inline-flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition ${
                tab === t.id
                  ? "border-sv-primary text-sv-dark"
                  : "border-transparent text-ink-400 hover:text-sv-dark"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                  tab === t.id ? "bg-sv-primary text-white" : "bg-ink-100 text-ink-400"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-200 p-12 text-center">
              <div className="text-3xl opacity-60">📭</div>
              <h4 className="display mt-2.5 text-base">Nada por acá</h4>
              <p className="mt-1 text-sm text-ink-400">No tenés consultas en este estado.</p>
            </div>
          ) : (
            filtered.map((pub) => (
              <MiConsultaCard
                key={pub.id}
                pub={pub}
                expanded={expandedId === pub.id}
                onToggle={() =>
                  setExpandedId(expandedId === pub.id ? null : pub.id)
                }
                onAceptar={handleAceptar}
                perfilMap={perfilMap}
                resumenMap={resumenMap}
                yaResenada={resenadasIds.includes(pub.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>

    {pagoInfo && (
      <AceptarModal
        propuesta={pagoInfo.propuesta as PropuestaParaPago}
        publicacion={pagoInfo.publicacion as PublicacionParaPago}
        onClose={() => setPagoInfo(null)}
        onPagoExitoso={handleCerrarModal}
      />
    )}
  </>
  );
}
