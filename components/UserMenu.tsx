"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Props {
  displayName: string;
  email: string;
  initials: string;
  esProfesional: boolean;
  isAdmin: boolean;
  dark?: boolean;
}

export function UserMenu({
  displayName,
  email,
  initials,
  esProfesional,
  isAdmin,
  dark = false,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  async function handleLogout() {
    close();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const roleLabel = esProfesional ? "Técnico" : "Cliente";

  const pillCls = dark
    ? "border-white/15 bg-white/10 hover:bg-white/15"
    : "border-ink-100 bg-ink-50/60 hover:bg-ink-100";
  const avatarCls = dark ? "bg-zap-500" : "bg-sv-dark";
  const nameCls = dark ? "text-zap-50" : "text-sv-dark";
  const roleBadgeCls = dark
    ? "bg-zap-500/20 text-zap-300"
    : esProfesional
    ? "bg-sv-primary/15 text-sv-olive"
    : "bg-amber-100 text-amber-700";

  const dropBg = dark ? "bg-[#0e1a17] border-white/10" : "bg-white border-ink-100";
  const itemCls = dark
    ? "text-zap-100/80 hover:bg-white/10 hover:text-white"
    : "text-sv-dark hover:bg-zap-100";
  const dividerCls = dark ? "border-white/10" : "border-ink-100";
  const subtleCls = dark ? "text-zap-400" : "text-ink-400";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menú de usuario"
        aria-expanded={open}
        className={`flex items-center gap-2.5 rounded-full border py-1 pl-1.5 pr-2.5 transition ${pillCls}`}
      >
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${avatarCls}`}>
          {initials}
        </span>
        <span className={`hidden text-sm font-medium sm:inline ${nameCls}`}>{displayName}</span>
        <span className={`hidden rounded-full px-1.5 py-px text-[10px] font-semibold sm:inline ${roleBadgeCls}`}>
          {roleLabel}
        </span>
        <svg
          className={`h-3.5 w-3.5 transition-transform ${subtleCls} ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop para cerrar al tocar afuera */}
          <div className="fixed inset-0 z-40" onClick={close} />

          <div className={`absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border shadow-lg ${dropBg}`}>
            {/* Datos del usuario */}
            <div className={`border-b px-4 py-3 ${dividerCls}`}>
              <div className="flex items-center gap-2">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${avatarCls}`}>
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className={`truncate text-sm font-semibold ${nameCls}`}>{displayName}</p>
                  <p className={`truncate text-[11px] ${subtleCls}`}>{email}</p>
                </div>
              </div>
              <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleBadgeCls}`}>
                {roleLabel}
              </span>
            </div>

            {/* Accesos */}
            <nav className="flex flex-col p-1.5">
              <Link href="/mis-consultas" onClick={close} className={`rounded-xl px-3 py-2 text-sm font-medium transition ${itemCls}`}>
                Mis consultas
              </Link>
              {!esProfesional && (
                <Link href="/mis-publicaciones" onClick={close} className={`rounded-xl px-3 py-2 text-sm font-medium transition ${itemCls}`}>
                  Mis publicaciones
                </Link>
              )}
              {isAdmin && (
                <Link href="/admin" onClick={close} className={`rounded-xl px-3 py-2 text-sm font-medium transition ${itemCls}`}>
                  Admin
                </Link>
              )}
            </nav>

            {/* Cerrar sesión */}
            <div className={`border-t p-1.5 ${dividerCls}`}>
              <button
                type="button"
                onClick={handleLogout}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                  dark ? "text-rose-300 hover:bg-rose-500/10" : "text-rose-600 hover:bg-rose-50"
                }`}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
