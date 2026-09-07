"use client";

import { useEffect, useState } from "react";

// Cartel que aparece al volver del mail de confirmación (2026-09-07).
//
// Sin esto, el usuario tocaba el link, aterrizaba en una pantalla cualquiera y
// no tenía forma de saber si la confirmación había funcionado ni si estaba
// dentro. Es el primer momento de la cuenta: conviene decirlo.
//
// Lo dispara ?bienvenida=1, que pone /auth/callback al volver del mail. Se
// limpia de la URL al mostrarse, para que no reaparezca al recargar.
export function Bienvenida({ esProfesional }: { esProfesional: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("bienvenida") !== "1") return;
    setVisible(true);
    p.delete("bienvenida");
    const q = p.toString();
    window.history.replaceState(null, "", window.location.pathname + (q ? `?${q}` : ""));
  }, []);

  if (!visible) return null;

  return (
    <div className="border-b border-sv-primary/20 bg-sv-mint">
      <div className="container-home flex flex-wrap items-center gap-x-3 gap-y-1 py-3.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sv-primary text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <p className="text-[14.5px] font-semibold text-sv-dark">Cuenta confirmada</p>
        <p className="text-[14px] text-ink-600">
          {esProfesional
            ? "Ya estás dentro. Completá tu perfil para que te encuentren mejor."
            : "Ya estás dentro. Buscá al técnico que necesites y escribile directo."}
        </p>
      </div>
    </div>
  );
}
