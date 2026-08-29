"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/Avatar";

interface Props {
  displayName: string;
  email: string;
  initials: string;
  avatarUrl?: string | null;
  esProfesional: boolean;
  isAdmin: boolean;
  dark?: boolean;
}

// El prop "dark" queda en la firma solo para no romper los call sites que
// todavía lo pasan (Header, etc.) — desde el rediseño 2026-08-28 se unificó
// todo a un solo tema claro, así que ya no cambia nada visualmente.
export function UserMenu({
  displayName,
  email,
  initials,
  avatarUrl = null,
  esProfesional,
  isAdmin,
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

  const avatarCls = "bg-sv-dark";
  const nameCls = "text-sv-dark";
  const roleBadgeCls = esProfesional ? "bg-sv-primary/15 text-sv-olive" : "bg-amber-100 text-amber-700";

  const dropBg = "bg-white border-ink-100";
  const itemCls = "text-sv-dark hover:bg-zap-100";
  const dividerCls = "border-ink-100";
  const subtleCls = "text-ink-400";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menú de usuario"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full transition sm:border sm:border-ink-100 sm:bg-ink-50/60 sm:py-1 sm:pl-1.5 sm:pr-2.5 sm:hover:bg-ink-100"
      >
        <Avatar
          url={avatarUrl}
          initials={initials}
          size={28}
          fallbackClass={avatarCls}
          textClass="text-[10px]"
          className="ring-2 ring-sv-primary/50 ring-offset-1 ring-offset-white sm:ring-0"
        />
        <span className={`hidden text-sm font-medium sm:inline ${nameCls}`}>{displayName}</span>
        <span className={`hidden rounded-full px-1.5 py-px text-[10px] font-semibold sm:inline ${roleBadgeCls}`}>
          {roleLabel}
        </span>
        <svg
          className={`hidden h-3.5 w-3.5 transition-transform sm:block ${subtleCls} ${open ? "rotate-180" : ""}`}
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
                <Avatar url={avatarUrl} initials={initials} size={32} fallbackClass={avatarCls} textClass="text-[11px]" />
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
              <Link href="/perfil" onClick={close} className={`rounded-xl px-3 py-2 text-sm font-medium transition ${itemCls}`}>
                Mi perfil
              </Link>
              <Link href="/como-funciona" onClick={close} className={`rounded-xl px-3 py-2 text-sm font-medium transition ${itemCls}`}>
                Cómo funciona
              </Link>
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
                className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
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
