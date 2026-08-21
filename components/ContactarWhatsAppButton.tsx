"use client";

import { registrarContacto } from "@/app/tecnico/[id]/actions";

// Mismo <a> de siempre hacia wa.me, pero deja un registro liviano del clic
// (con cuenta o sin ella) en paralelo — no frena ni demora la apertura de
// WhatsApp: el link abre en pestaña nueva y el registro corre atrás, best-effort.
export function ContactarWhatsAppButton({
  tecnicoId,
  waLink,
  origen,
  className,
  children,
}: {
  tecnicoId: string;
  waLink: string | null;
  origen: "home" | "perfil" | "consultas";
  className?: string;
  children: React.ReactNode;
}) {
  function handleClick() {
    if (!waLink) return;
    registrarContacto(tecnicoId, origen).catch(() => {});
  }

  return (
    <a
      href={waLink ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={!waLink}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
