"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/data";
import { CategoryArt } from "@/components/CategoryArt";
import { rechazarPropuesta, eliminarPublicacion } from "./actions";
import { AceptarModal, type PropuestaParaPago, type PublicacionParaPago } from "@/components/AceptarModal";
import { ReportarProblemaModal } from "./ReportarProblemaModal";

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
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
        <Image src={photo} alt="" fill sizes="64px" className="object-cover" />
      </div>
    );
  }
  return (
    <CategoryArt
      icon={cat?.icon ?? "🔧"}
      hue={cat?.hue ?? 180}
      className="h-16 w-16 shrink-0 rounded-2xl"
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
        Entregáselo al técnico <strong>únicamente cuando el servicio esté completo</strong>.
        Es lo que le permite confirmar el cobro. No lo compartás antes.
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
  onAceptar,
}: {
  propuesta: Propuesta;
  publicacion: Publicacion;
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
              <span className="text-sm font-semibold text-sv-dark">{nombre}</span>
              {(isAccepted || isRejected) && <StatusPill status={estado} />}
            </div>
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

      {/* Aviso: cómo cerrar el trabajo — solo mientras está EN CURSO */}
      {pubStatus === "en_curso" && (
        <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800">
            ⚠️ Cómo cerrar el trabajo
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-amber-900">
            Cuando <strong>{nombre.split(" ")[0]}</strong> termine el trabajo, entregale tu{" "}
            <strong>código de 4 dígitos</strong>. El técnico lo ingresa en SolvIT para confirmar que
            el servicio se completó. <strong>No lo compartas antes</strong> de que el trabajo esté listo.
          </p>
        </div>
      )}

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
function MiConsultaCard({
  pub,
  expanded,
  onToggle,
  onAceptar,
  perfilMap,
}: {
  pub: Publicacion;
  expanded: boolean;
  onToggle: () => void;
  onAceptar: (p: Propuesta, pub: Publicacion) => void;
  perfilMap: Record<string, PerfilProfesional>;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(false);
  const [borrando, startBorrar] = useTransition();
  const [borrarError, setBorrarError] = useState("");

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
  const propuestaAceptada =
    pub.propuestas.find((p) => p.estado === "aceptada" || p.estado === "completada") ?? null;
  const perfil = propuestaAceptada ? (perfilMap[propuestaAceptada.profesional_id] ?? null) : null;

  const toggleBtn = pub.status === "abierto" && pendingCount > 0 ? (
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

        {pub.status === "abierto" && pendingCount === 0 && pub.propuestas.length > 0 && (
          <span className="hidden sm:flex shrink-0 self-center text-xs text-ink-400">Sin nuevas</span>
        )}

        {pub.status === "abierto" && (
          <button
            type="button"
            onClick={() => { setMenuOpen((v) => !v); setConfirmandoBorrar(false); }}
            aria-label="Opciones de la publicación"
            className="shrink-0 self-start rounded-lg px-2 py-1 text-lg leading-none text-ink-400 transition hover:bg-ink-50 hover:text-ink-700"
          >
            ⋯
          </button>
        )}
      </div>

      {/* Menú ⋯ — eliminar publicación (solo abiertas) */}
      {menuOpen && pub.status === "abierto" && (
        <div className="border-t border-ink-100 bg-rose-50/60 px-5 py-4">
          {!confirmandoBorrar ? (
            <button
              type="button"
              onClick={() => setConfirmandoBorrar(true)}
              className="text-sm font-semibold text-rose-600 hover:underline"
            >
              🗑 Eliminar publicación
            </button>
          ) : (
            <div>
              <p className="text-sm text-ink-700">
                ¿Seguro que querés eliminarla? No se puede deshacer.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmandoBorrar(false)}
                  className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-600 transition hover:bg-ink-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={borrando}
                  onClick={handleEliminar}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {borrando ? "Eliminando…" : "Sí, eliminar"}
                </button>
              </div>
              {borrarError && <p className="mt-1.5 text-xs text-rose-600">{borrarError}</p>}
            </div>
          )}
        </div>
      )}

      {/* Nuevas propuestas recibidas — aviso destacado para el demandante */}
      {pub.status === "abierto" && pendingCount > 0 && !expanded && (
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

      {/* Código OTP — visible solo para el demandante cuando el trabajo está en curso */}
      {pub.status === "en_curso" && propuestaAceptada?.codigo_pago && (
        <CodigoOTPBlock codigo={propuestaAceptada.codigo_pago} />
      )}

      {/* Datos del profesional — desbloqueados cuando la propuesta fue aceptada o completada */}
      {(pub.status === "en_curso" || pub.status === "cerrado" || pub.status === "en_disputa") && propuestaAceptada && (
        <ProfesionalContacto propuesta={propuestaAceptada} pubTitle={pub.title} pubStatus={pub.status} perfil={perfil} />
      )}

      {expanded && pub.status === "abierto" && (
        <div className="border-t border-ink-100 px-5 pb-5 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-display text-sm font-semibold text-sv-dark">
              {pub.propuestas.length} propuesta{pub.propuestas.length !== 1 ? "s" : ""} recibidas
            </h4>
            <span className="text-[11px] text-ink-400">Ordenadas por precio</span>
          </div>
          <div className="space-y-2">
            {[...pub.propuestas]
              .sort((a, b) => Number(a.precio) - Number(b.precio))
              .map((prop) => (
                <PropuestaRow
                  key={prop.id}
                  propuesta={prop}
                  publicacion={pub}
                  onAceptar={onAceptar}
                />
              ))}
          </div>
        </div>
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
  nombre,
  apellido,
  email,
}: {
  publicaciones: Publicacion[];
  perfilMap: Record<string, PerfilProfesional>;
  nombre?: string;
  apellido?: string;
  email?: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("abierto");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pagoInfo, setPagoInfo] = useState<{ propuesta: Propuesta; publicacion: Publicacion } | null>(null);

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
    <div className="space-y-5">
      {/* Profile header */}
      <div className="flex items-center gap-5 rounded-2xl border border-ink-100 bg-white p-6 shadow-[0_1px_2px_rgba(40,63,59,0.04)]">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sv-dark to-sv-primary font-display text-3xl font-semibold text-white">
          {initials}
        </span>
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
            <h1 className="display text-2xl">{displayName}</h1>
            <span className="rounded-full bg-zap-100 px-2.5 py-1 text-[11.5px] font-semibold text-zap-700">
              Demandante
            </span>
          </div>
          {email && <p className="text-sm text-ink-400">✉ {email}</p>}
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-ink-100 bg-white sm:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`p-5 ${statBorder(i)}`}>
            <div
              className={`font-display text-[26px] leading-none tracking-tight sm:text-[28px] ${
                s.accent ? "text-sv-primary" : "text-sv-dark"
              }`}
            >
              {s.value}
            </div>
            <div className="mt-1.5 text-xs text-ink-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Section */}
      <div>
        <h2 className="display mb-3.5 text-xl sm:text-[22px]">Mis consultas</h2>

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
