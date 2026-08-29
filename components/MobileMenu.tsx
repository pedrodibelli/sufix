"use client";

import { useState } from "react";
import Link from "next/link";

// El prop "dark" queda en la firma solo para no romper los call sites que
// todavía lo pasan (Header, etc.) — desde el rediseño 2026-08-28 se unificó
// todo a un solo tema claro, así que ya no cambia nada visualmente.
export function MobileMenu({ hasUser }: { hasUser: boolean; dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const barColor = "bg-sv-dark";
  const btnHover = "hover:bg-zap-100";
  const dropBg = "bg-white border-ink-100";
  const linkClass = "rounded-xl px-4 py-3.5 text-sm font-medium text-sv-dark transition hover:bg-zap-100";

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((v) => !v)}
        className={`flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-lg transition ${btnHover} sm:hidden`}
      >
        <span className={`h-[2px] w-5 rounded-full ${barColor} transition-all duration-200 ${open ? "translate-y-[7px] rotate-45" : ""}`} />
        <span className={`h-[2px] w-5 rounded-full ${barColor} transition-all duration-200 ${open ? "opacity-0" : ""}`} />
        <span className={`h-[2px] w-5 rounded-full ${barColor} transition-all duration-200 ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 top-14 z-30 sm:hidden" onClick={close} />
          <div className={`absolute left-0 right-0 top-14 z-40 border-b px-4 py-2 shadow-lg sm:hidden ${dropBg}`}>
            <nav className="flex flex-col">
              <Link href="/como-funciona" onClick={close} className={linkClass}>Cómo funciona</Link>
              {!hasUser && <Link href="/ingresar" onClick={close} className={linkClass}>Ingresar</Link>}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
