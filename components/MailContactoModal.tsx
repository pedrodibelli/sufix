"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { emailValido, normalizarEmail, sugerirEmail } from "@/lib/email";
import { IconClose, IconWhatsApp } from "@/components/icons";

// Pop-up que pide el mail antes de abrir WhatsApp (2026-10-22, ver CLAUDE.md
// §24). Idea tomada de parairnos.com: el directorio sigue sin pedir cuenta,
// pero ahora sabemos quién contacta a quién — que es lo que permite mandarle
// consejos de seguridad y, a la semana, preguntarle cómo le fue y pedirle la
// reseña.
//
// Se pide UNA vez por navegador: el mail queda en localStorage y los
// contactos siguientes van directo a WhatsApp (ContactarWhatsAppButton).

const CLAVE = "sufix_contacto_email";

export function leerMailGuardado(): string | null {
  try {
    const v = localStorage.getItem(CLAVE);
    return v && emailValido(v) ? v : null;
  } catch {
    return null;
  }
}

function guardarMail(email: string) {
  try {
    localStorage.setItem(CLAVE, email);
  } catch {
    // modo privado o storage bloqueado: la próxima vez se pide de nuevo, nada más
  }
}

export type DatosContacto = { email: string; telefono?: string; aceptaNovedades: boolean };

export function MailContactoModal({
  tecnicoNombre,
  waLink,
  onClose,
  onContinuar,
}: {
  tecnicoNombre: string;
  waLink: string;
  onClose: () => void;
  onContinuar: (datos: DatosContacto) => void;
}) {
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [novedades, setNovedades] = useState(false);
  const [error, setError] = useState("");
  // El mail sobre el que ya avisamos "¿quisiste decir…?". Si insiste con el
  // mismo, lo dejamos seguir: hay dominios reales parecidos a los comunes.
  const [yaAvisado, setYaAvisado] = useState("");
  const [montado, setMontado] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const limpio = normalizarEmail(email);
  const sugerencia = emailValido(limpio) ? sugerirEmail(limpio) : null;

  // createPortal necesita document.body, que no existe en el servidor.
  useEffect(() => setMontado(true), []);

  useEffect(() => {
    if (montado) inputRef.current?.focus();
  }, [montado]);

  // Esc cierra; el fondo no scrollea mientras el pop-up está abierto.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflowPrevio;
    };
  }, []);

  // El botón "Continuar a WhatsApp" es un <a> de verdad, no un botón que
  // después hace window.open: así WhatsApp abre igual que siempre, sin que
  // ningún bloqueador de pop-ups lo frene (en iOS, un window.open después de
  // esperar al servidor se bloquea). Si el mail no está bien, se cancela el
  // link y no se abre nada.
  function handleContinuar(e: MouseEvent<HTMLAnchorElement>) {
    if (!emailValido(limpio)) {
      e.preventDefault();
      setError(limpio ? "Revisá el mail: tiene que ser algo como nombre@gmail.com." : "Escribí tu mail para seguir.");
      inputRef.current?.focus();
      return;
    }
    if (sugerencia && yaAvisado !== limpio) {
      e.preventDefault();
      setYaAvisado(limpio);
      return;
    }
    guardarMail(limpio);
    onContinuar({ email: limpio, telefono: telefono.trim() || undefined, aceptaNovedades: novedades });
  }

  if (!montado) return null;

  return createPortal(
    <div
      className="animate-backdrop fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mail-contacto-titulo"
        className="animate-modal relative max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3.5 top-3.5 rounded-full p-1.5 text-ink-400 transition-colors hover:bg-zap-100 hover:text-ink-600"
        >
          <IconClose className="h-4 w-4" />
        </button>

        <h3 id="mail-contacto-titulo" className="display pr-7 text-lg leading-snug text-sv-dark sm:text-xl">
          Para chatear con {tecnicoNombre}, dejanos tu mail
        </h3>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-500">
          Si es tu primera vez en Sufix, te mandamos unos consejos de seguridad para contratar tranquilo.
        </p>

        <form
          noValidate
          className="mt-4"
          onSubmit={(e) => {
            // Enter en un campo = tocar el botón. El click sobre el <a> corre
            // la misma validación y, si pasa, abre WhatsApp.
            e.preventDefault();
            linkRef.current?.click();
          }}
        >
          <label htmlFor="mail-contacto-email" className="label">Tu mail</label>
          <input
            ref={inputRef}
            id="mail-contacto-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="nombre@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            aria-invalid={!!error}
            className="field py-2.5"
          />
          {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
          {!error && sugerencia && (
            <p className={`mt-1.5 text-xs ${yaAvisado === limpio ? "font-medium text-amber-700" : "text-ink-500"}`}>
              ¿Quisiste decir{" "}
              <button
                type="button"
                onClick={() => setEmail(sugerencia)}
                className="font-semibold text-sv-primary underline underline-offset-2"
              >
                {sugerencia}
              </button>
              ?{yaAvisado === limpio && " Si está bien como lo escribiste, tocá Continuar de nuevo."}
            </p>
          )}

          <label htmlFor="mail-contacto-tel" className="label mt-3.5">
            Tu WhatsApp <span className="font-normal text-ink-400">(opcional)</span>
          </label>
          <input
            id="mail-contacto-tel"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="11 2345 6789"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="field py-2.5"
          />

          <label className="mt-3.5 flex cursor-pointer items-start gap-2.5 text-[13.5px] text-ink-600">
            <input
              type="checkbox"
              checked={novedades}
              onChange={(e) => setNovedades(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[#4E7A3E]"
            />
            Quiero recibir novedades de Sufix
          </label>

          <a
            ref={linkRef}
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleContinuar}
            className="btn mt-4 w-full bg-[#25D366] py-3 text-base text-white hover:brightness-95"
          >
            <IconWhatsApp className="h-4 w-4" /> Continuar a WhatsApp
          </a>

          <p className="mt-2.5 text-center text-[11.5px] leading-relaxed text-ink-400">
            En unos días te preguntamos cómo te fue. Te das de baja con un clic.{" "}
            <Link href="/privacidad" target="_blank" className="underline underline-offset-2">
              Privacidad
            </Link>
          </p>
        </form>
      </div>
    </div>,
    document.body
  );
}
