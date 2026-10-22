"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { registrarAperturaPopup, registrarContacto } from "@/app/tecnico/[id]/actions";
import { MailContactoModal, leerMailGuardado } from "@/components/MailContactoModal";
import { supabase } from "@/lib/supabase";

// Mismo <a> de siempre hacia wa.me, pero deja un registro liviano del clic
// (con cuenta o sin ella) en paralelo — no frena ni demora la apertura de
// WhatsApp: el link abre en pestaña nueva y el registro corre atrás, best-effort.
//
// Desde 2026-10-22, la primera vez que alguien sin cuenta lo toca, antes de
// abrir WhatsApp aparece un pop-up que pide el mail (MailContactoModal). Las
// veces siguientes ya no: el mail quedó guardado en el navegador. Con sesión
// iniciada tampoco: el mail de la cuenta ya lo tenemos.

// ¿Hay sesión? Se mira una sola vez para toda la página (hay hasta 12+
// botones por tanda) y se mantiene al día si la persona entra o sale. Es
// estado de módulo y no de React a propósito: sólo se consulta en el momento
// del clic, no cambia nada de lo que se dibuja.
let sesionIniciada = false;
let vigilando = false;
function vigilarSesion() {
  if (vigilando) return;
  vigilando = true;
  supabase.auth
    .getSession()
    .then(({ data }) => {
      sesionIniciada = !!data.session;
    })
    .catch(() => {});
  supabase.auth.onAuthStateChange((_evento, sesion) => {
    sesionIniciada = !!sesion;
  });
}

function nuevoId(): string {
  // randomUUID existe recién desde iOS 15.4: en un iPhone más viejo no está.
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // Navegadores viejos: UUID v4 a mano.
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function ContactarWhatsAppButton({
  tecnicoId,
  tecnicoNombre,
  waLink,
  origen,
  className,
  children,
}: {
  tecnicoId: string;
  tecnicoNombre: string;
  waLink: string | null;
  origen: "home" | "perfil" | "consultas";
  className?: string;
  children: React.ReactNode;
}) {
  // Id de esta apertura del pop-up (null = cerrado). Viaja en los dos
  // registros, "se abrió" y "siguió", para medir cuánta gente se pierde ahí.
  const [aperturaId, setAperturaId] = useState<string | null>(null);

  useEffect(vigilarSesion, []);

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (!waLink) return;
    if (sesionIniciada) {
      registrarContacto(tecnicoId, origen).catch(() => {});
      return;
    }
    const guardado = leerMailGuardado();
    if (guardado) {
      registrarContacto(tecnicoId, origen, { email: guardado }).catch(() => {});
      return;
    }
    // Primera vez sin cuenta: no se abre WhatsApp todavía, se pide el mail.
    e.preventDefault();
    const id = nuevoId();
    setAperturaId(id);
    registrarAperturaPopup(tecnicoId, id).catch(() => {});
  }

  return (
    <>
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
      {aperturaId && waLink && (
        <MailContactoModal
          tecnicoNombre={tecnicoNombre}
          waLink={waLink}
          onClose={() => setAperturaId(null)}
          onContinuar={(datos) => {
            registrarContacto(tecnicoId, origen, { ...datos, aperturaId }).catch(() => {});
            // En el próximo tick: primero que el link del pop-up termine de
            // abrir WhatsApp, después se desmonta.
            setTimeout(() => setAperturaId(null), 0);
          }}
        />
      )}
    </>
  );
}
