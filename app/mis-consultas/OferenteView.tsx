"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/data";
import { CategoryArt } from "@/components/CategoryArt";
import { confirmarCodigo, cancelarInteres } from "./actions";
import { ReportarProblemaModal } from "./ReportarProblemaModal";

type Propuesta = {
  id: string;
  publicacion_id: string;
  precio: number;
  titulo: string | null;
  zona: string | null;
  categoria: string | null;
  demandante: string | null;
  estado: string | null;
  created_at: string;
  photo: string | null;
  contacto_directo: boolean | null;
};

type Tab = "todas" | "pendiente" | "interesado" | "aceptada" | "completada" | "rechazada";

const ESTADO_MAP: Record<string, { label: string; cls: string; darkCls: string }> = {
  pendiente:        { label: "Pendiente",        cls: "bg-amber-100 text-amber-700",     darkCls: "bg-amber-400/15 text-amber-300" },
  pago_en_revision: { label: "Pago en revisión",  cls: "bg-amber-100 text-amber-700",     darkCls: "bg-amber-400/15 text-amber-300" },
  interesado: { label: "Esperando al cliente", cls: "bg-blue-100 text-blue-700",         darkCls: "bg-blue-400/15 text-blue-300" },
  cancelada: { label: "Cancelaste el interés", cls: "bg-ink-100 text-ink-500",           darkCls: "bg-white/10 text-zap-400" },
  aceptada:   { label: "Aceptada",   cls: "bg-sv-primary/10 text-sv-olive",    darkCls: "bg-zap-500/20 text-zap-300" },
  completada: { label: "Completada", cls: "bg-emerald-100 text-emerald-700",   darkCls: "bg-emerald-500/20 text-emerald-300" },
  rechazada:  { label: "Rechazada",  cls: "bg-rose-100 text-rose-700",         darkCls: "bg-rose-500/15 text-rose-400" },
  en_disputa: { label: "En disputa", cls: "bg-rose-100 text-rose-700",         darkCls: "bg-rose-500/20 text-rose-300" },
};

function StatusPill({ estado, dark }: { estado: string; dark: boolean }) {
  const s = ESTADO_MAP[estado] ?? ESTADO_MAP.pendiente;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${dark ? s.darkCls : s.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {s.label}
    </span>
  );
}

// ─── ConfirmarCodigoBlock ─────────────────────────────────────────────────────
function ConfirmarCodigoBlock({ propuestaId, dark }: { propuestaId: string; dark: boolean }) {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirmar() {
    if (codigo.length !== 4) return;
    setError("");
    startTransition(async () => {
      const result = await confirmarCodigo(propuestaId, codigo);
      if ("error" in result) {
        setError(result.error);
        setCodigo("");
      } else {
        setConfirmado(true);
      }
    });
  }

  const borderCls = dark ? "border-zap-500/20 bg-zap-500/5" : "border-sv-primary/20 bg-sv-primary/5";
  const labelCls  = dark ? "text-zap-400" : "text-sv-olive";
  const bodyCls   = dark ? "text-zap-300" : "text-ink-500";

  if (confirmado) {
    return (
      <div className={`mt-3 rounded-xl border p-4 text-center ${dark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50"}`}>
        <p className={`text-sm font-semibold ${dark ? "text-emerald-300" : "text-emerald-700"}`}>
          ✓ Trabajo confirmado
        </p>
        <p className={`mt-1 text-xs ${dark ? "text-emerald-400/70" : "text-emerald-600"}`}>
          El trabajo quedó registrado como completado en SolvIT.
        </p>
      </div>
    );
  }

  return (
    <div className={`mt-3 rounded-xl border p-4 ${borderCls}`}>
      <p className={`text-[10.5px] font-semibold uppercase tracking-wide ${labelCls}`}>
        Confirmar trabajo realizado
      </p>
      <p className={`mt-1 text-[12px] leading-relaxed ${bodyCls}`}>
        Pedile al demandante el código de 4 dígitos cuando el servicio esté completo e ingresalo acá para cerrar el trabajo.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          placeholder="0000"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 4))}
          className={`w-24 rounded-xl border px-3 py-2 text-center font-display text-xl font-semibold tracking-widest focus:outline-none ${
            dark
              ? "border-white/20 bg-white/5 text-zap-50 placeholder-zap-600 focus:border-zap-400"
              : "border-ink-200 bg-white text-sv-dark focus:border-sv-primary"
          }`}
        />
        <button
          type="button"
          disabled={codigo.length !== 4 || isPending}
          onClick={handleConfirmar}
          className="btn-primary flex-1 text-sm disabled:opacity-50"
        >
          {isPending ? "Confirmando…" : "Confirmar trabajo"}
        </button>
      </div>
      {error && (
        <p className={`mt-2 text-xs font-medium ${dark ? "text-rose-400" : "text-rose-600"}`}>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── MiPropuestaCard ──────────────────────────────────────────────────────────
function MiPropuestaCard({ p, dark }: { p: Propuesta; dark: boolean }) {
  const router = useRouter();
  const [reportando, setReportando] = useState(false);
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [cancelando, startCancelar] = useTransition();
  const cat = CATEGORIES.find((c) => c.slug === p.categoria);
  const estado = p.estado ?? "pendiente";
  const puedeReportar = estado === "aceptada" || estado === "completada";

  function handleCancelar() {
    setCancelError("");
    startCancelar(async () => {
      const r = await cancelarInteres(p.id);
      if ("error" in r) {
        setCancelError(r.error);
        return;
      }
      setConfirmandoCancelar(false);
      router.refresh();
    });
  }

  const cardCls = dark
    ? "rounded-2xl border border-white/10 bg-[#162420] p-5"
    : "rounded-2xl border border-ink-100 bg-white p-5 shadow-[0_1px_2px_rgba(40,63,59,0.04)]";

  const titleCls = dark ? "text-zap-50"   : "text-sv-dark";
  const metaCls  = dark ? "text-zap-400"  : "text-ink-400";
  const priceCls = dark ? "text-zap-50"   : "text-sv-dark";
  const labelCls = dark ? "text-zap-500"  : "text-ink-400";
  const demCls   = dark ? "text-zap-200"  : "text-sv-dark";

  const priceBlock = !p.contacto_directo && estado !== "rechazada" && (
    <>
      <div className={`font-display text-[22px] font-semibold leading-none tracking-tight ${priceCls}`}>
        ${Number(p.precio).toLocaleString("es-AR")}
      </div>
      <div className={`text-[11px] ${labelCls}`}>tu propuesta</div>
    </>
  );

  return (
    <div className={cardCls}>
      {/* Fila superior: thumb + contenido + precio (desktop) */}
      <div className="flex gap-4">
        {p.photo ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
            <Image src={p.photo} alt="" fill sizes="64px" className="object-cover" />
          </div>
        ) : (
          <CategoryArt
            icon={cat?.icon ?? "🔧"}
            hue={cat?.hue ?? 180}
            className="h-16 w-16 shrink-0 rounded-2xl"
          />
        )}

        <div className="flex flex-1 min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill estado={estado} dark={dark} />
            <span className={`text-[11.5px] ${metaCls}`}>
              {cat?.name} · {p.zona} · {new Date(p.created_at).toLocaleDateString("es-AR")}
            </span>
          </div>

          <h3 className={`display line-clamp-2 break-words text-[17px] leading-snug ${titleCls}`}>
            {p.titulo ?? "Consulta"}
          </h3>
          <div className={`text-[12.5px] ${metaCls}`}>
            Demandante:{" "}
            <span className={`font-medium break-words ${demCls}`}>{p.demandante ?? "—"}</span>
          </div>

          {/* Precio en mobile — debajo del título */}
          {priceBlock && (
            <div className="mt-2 flex items-baseline gap-1.5 sm:hidden">
              {priceBlock}
            </div>
          )}
        </div>

        {/* Precio en desktop — columna derecha */}
        {priceBlock && (
          <div className="hidden sm:flex shrink-0 flex-col items-end gap-1">
            {priceBlock}
          </div>
        )}
      </div>

      {/* Interesado (contacto directo gratis): esperando que el cliente elija */}
      {estado === "interesado" && p.contacto_directo && (
        <div className={`mt-3 rounded-xl border p-4 ${dark ? "border-blue-500/25 bg-blue-500/10" : "border-blue-200 bg-blue-50"}`}>
          <p className={`text-sm font-semibold ${dark ? "text-blue-300" : "text-blue-700"}`}>
            🙋 Le avisamos a {p.demandante ?? "el cliente"} que querés este trabajo
          </p>
          <p className={`mt-1 text-[12.5px] leading-relaxed ${dark ? "text-blue-100/80" : "text-blue-800"}`}>
            Es gratis, no tenés que hacer nada más. Si te elige entre los interesados, te va a escribir directo por WhatsApp.
          </p>

          {!confirmandoCancelar ? (
            <button
              type="button"
              onClick={() => setConfirmandoCancelar(true)}
              className={`mt-3 text-xs font-medium underline-offset-2 hover:underline ${dark ? "text-blue-300/70 hover:text-blue-200" : "text-blue-700/70 hover:text-blue-800"}`}
            >
              Ya no me interesa este trabajo
            </button>
          ) : (
            <div className={`mt-3 rounded-lg border p-3 ${dark ? "border-white/10 bg-black/20" : "border-blue-200 bg-white"}`}>
              <p className={`text-xs ${dark ? "text-zap-300" : "text-ink-600"}`}>
                ¿Seguro que ya no querés hacer este trabajo? El cliente deja de verte entre los interesados.
              </p>
              <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setConfirmandoCancelar(false)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition sm:py-1.5 sm:text-xs ${dark ? "border-white/15 text-zap-300 hover:bg-white/5" : "border-ink-200 text-ink-600 hover:bg-ink-50"}`}
                >
                  Seguir interesado
                </button>
                <button
                  type="button"
                  disabled={cancelando}
                  onClick={handleCancelar}
                  className="rounded-lg bg-rose-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50 sm:py-1.5 sm:text-xs"
                >
                  {cancelando ? "Cancelando…" : "Sí, cancelar interés"}
                </button>
              </div>
              {cancelError && <p className="mt-1.5 text-xs text-rose-500">{cancelError}</p>}
            </div>
          )}
        </div>
      )}

      {/* Aceptada (con o sin pago, según el flujo): aviso + input para cerrar con el código */}
      {estado === "aceptada" && (
        <>
          <div className={`mt-3 rounded-xl border p-4 ${dark ? "border-emerald-500/25 bg-emerald-500/10" : "border-emerald-200 bg-emerald-50"}`}>
            <p className={`text-sm font-semibold ${dark ? "text-emerald-300" : "text-emerald-700"}`}>
              {p.contacto_directo ? "🎉 ¡El cliente te eligió!" : "🎉 ¡Te aceptaron y ya pagaron!"}
            </p>
            <p className={`mt-1 text-[12.5px] leading-relaxed ${dark ? "text-emerald-100/80" : "text-emerald-800"}`}>
              {p.contacto_directo ? (
                <><strong>{p.demandante ?? "El cliente"}</strong> te eligió para este trabajo. Coordiná la visita por WhatsApp.</>
              ) : (
                <><strong>{p.demandante ?? "El cliente"}</strong> abonó la consulta. Coordiná la visita
                por WhatsApp. <strong>SolvIT te paga tu consulta</strong> cuando se cierre el trabajo.</>
              )}
            </p>
          </div>
          <ConfirmarCodigoBlock propuestaId={p.id} dark={dark} />
        </>
      )}

      {/* Trabajo completado */}
      {estado === "completada" && (
        <div className={`mt-3 rounded-xl border px-3 py-2.5 ${dark ? "border-emerald-500/20 bg-emerald-500/10" : "border-emerald-200 bg-emerald-50"}`}>
          <div className={`flex items-center gap-2 text-xs font-semibold ${dark ? "text-emerald-300" : "text-emerald-700"}`}>
            <span>✓</span>
            Trabajo completado
          </div>
          <p className={`mt-0.5 text-[11.5px] ${dark ? "text-emerald-400/70" : "text-emerald-600"}`}>
            El código fue confirmado y el trabajo quedó cerrado en SolvIT.
          </p>
        </div>
      )}

      {/* Botón reportar problema */}
      {puedeReportar && (
        <button
          type="button"
          onClick={() => setReportando(true)}
          className={`mt-3 w-full text-center text-xs transition ${dark ? "text-zap-600 hover:text-rose-400" : "text-ink-400 hover:text-rose-600"}`}
        >
          ¿Hubo un problema? Reportalo acá
        </button>
      )}

      {reportando && (
        <ReportarProblemaModal
          propuestaId={p.id}
          publicacionId={p.publicacion_id}
          rol="oferente"
          dark={dark}
          onClose={() => setReportando(false)}
        />
      )}

      {/* Propuesta rechazada */}
      {estado === "rechazada" && (
        <div className={`mt-3 rounded-xl border px-3 py-2.5 ${dark ? "border-rose-500/20 bg-rose-500/10" : "border-rose-200 bg-rose-50"}`}>
          <div className={`flex items-center gap-2 text-xs font-semibold ${dark ? "text-rose-400" : "text-rose-700"}`}>
            <span>✕</span>
            Propuesta rechazada
          </div>
          <p className={`mt-0.5 text-[11.5px] ${dark ? "text-rose-400/70" : "text-rose-500"}`}>
            El demandante no eligió tu propuesta. La consulta ya fue cerrada.
          </p>
        </div>
      )}
    </div>
  );
}

function statBorder(i: number) {
  const cls: string[] = [];
  if (i % 2 === 1) cls.push("border-l");
  if (i >= 2) cls.push("border-t", "sm:border-t-0");
  if (i > 0) cls.push("sm:border-l");
  return cls.join(" ");
}

export function OferenteView({
  propuestas,
  nombre,
  apellido,
  email,
}: {
  propuestas: Propuesta[];
  nombre?: string;
  apellido?: string;
  email?: string;
}) {
  const [tab, setTab] = useState<Tab>("todas");
  const dark = true;

  // Notificaciones en vivo: las maneja RealtimeRefresh (montado en el Header
  // para toda la app) — no hace falta una suscripción propia acá.

  const displayName = [nombre, apellido].filter(Boolean).join(" ") || email || "Profesional";
  const initials =
    nombre && apellido
      ? `${nombre[0]}${apellido[0]}`.toUpperCase()
      : nombre
      ? nombre.slice(0, 2).toUpperCase()
      : "P";

  const getEstado = (p: Propuesta) => p.estado ?? "pendiente";

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "todas",      label: "Todas",       count: propuestas.length },
    { id: "pendiente",  label: "Pendientes",  count: propuestas.filter((p) => getEstado(p) === "pendiente").length },
    { id: "interesado", label: "Interesado",  count: propuestas.filter((p) => getEstado(p) === "interesado").length },
    { id: "aceptada",   label: "Aceptadas",   count: propuestas.filter((p) => getEstado(p) === "aceptada").length },
    { id: "completada", label: "Completadas", count: propuestas.filter((p) => getEstado(p) === "completada").length },
    { id: "rechazada",  label: "Rechazadas",  count: propuestas.filter((p) => getEstado(p) === "rechazada").length },
  ];

  const filtered = tab === "todas" ? propuestas : propuestas.filter((p) => getEstado(p) === tab);

  const stats = [
    { value: propuestas.length,                                                            label: "Enviadas",    accent: false },
    { value: propuestas.filter((p) => getEstado(p) === "aceptada").length,                label: "Aceptadas",   accent: true  },
    { value: propuestas.filter((p) => getEstado(p) === "completada").length,              label: "Completadas", accent: false },
    { value: propuestas.filter((p) => getEstado(p) === "rechazada").length,               label: "Rechazadas",  accent: false },
  ];

  if (propuestas.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#162420] p-10 text-center">
        <div className="text-4xl">🔧</div>
        <h3 className="display mt-3 text-2xl text-zap-50">Todavía no enviaste propuestas</h3>
        <p className="mt-2 text-zap-400">
          Cuando contactés a un demandante, tus propuestas van a aparecer acá.
        </p>
        <Link href="/" className="btn-primary mt-6 inline-block">
          Ver consultas disponibles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Profile header — compacto en mobile para no tapar los trabajos */}
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#162420] p-3.5 sm:gap-4 sm:p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zap-600 to-zap-400 font-display text-base font-semibold text-white sm:h-20 sm:w-20 sm:text-3xl">
          {initials}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:mb-1.5">
            <h1 className="display text-base text-zap-50 sm:text-2xl">{displayName}</h1>
            <span className="rounded-full bg-zap-500/20 px-2 py-0.5 text-[10.5px] font-semibold text-zap-300 sm:px-2.5 sm:py-1 sm:text-[11.5px]">
              Técnico
            </span>
          </div>
          {email && <p className="hidden text-sm text-zap-500 sm:block">✉ {email}</p>}
        </div>
      </div>

      {/* Stat strip — en mobile, solo las 2 métricas que importan para actuar */}
      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-[#162420] sm:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className={`p-3 sm:p-5 ${statBorder(i)} border-white/10 ${i >= 2 ? "hidden sm:block" : ""}`}>
            <div className={`font-display text-xl leading-none tracking-tight sm:text-[28px] ${s.accent ? "text-zap-300" : "text-zap-50"}`}>
              {s.value}
            </div>
            <div className="mt-1 text-[11px] text-zap-500 sm:mt-1.5 sm:text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Section */}
      <div>
        <h2 className="display mb-3 text-lg text-zap-50 sm:mb-3.5 sm:text-[22px]">Mis propuestas</h2>

        {/* Tab bar */}
        <div className="no-scrollbar flex overflow-x-auto border-b border-white/10">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`mr-3 inline-flex shrink-0 items-center gap-1.5 border-b-2 pb-3 text-xs font-semibold transition sm:mr-4 sm:gap-2 sm:text-sm ${
                tab === t.id
                  ? "border-zap-400 text-zap-50"
                  : "border-transparent text-zap-500 hover:text-zap-200"
              }`}
            >
              {t.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:text-[11px] ${
                tab === t.id ? "bg-zap-400 text-sv-dark" : "bg-white/10 text-zap-400"
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center">
              <div className="text-3xl opacity-60">📭</div>
              <h4 className="display mt-2.5 text-base text-zap-50">Nada por acá</h4>
              <p className="mt-1 text-sm text-zap-400">No tenés propuestas en este estado.</p>
            </div>
          ) : (
            filtered.map((p) => <MiPropuestaCard key={p.id} p={p} dark={dark} />)
          )}
        </div>
      </div>
    </div>
  );
}
