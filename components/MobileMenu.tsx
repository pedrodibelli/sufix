"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileMenu({ hasUser, dark = false }: { hasUser: boolean; dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const barColor = dark ? "bg-white" : "bg-sv-dark";
  const btnHover = dark ? "hover:bg-white/10" : "hover:bg-zap-100";
  const dropBg = dark ? "bg-[#0e1a17] border-white/10" : "bg-white border-ink-100";
  const linkClass = dark
    ? "rounded-xl px-4 py-3.5 text-sm font-medium text-zap-100/80 transition hover:bg-white/10 hover:text-white"
    : "rounded-xl px-4 py-3.5 text-sm font-medium text-sv-dark transition hover:bg-zap-100";

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
