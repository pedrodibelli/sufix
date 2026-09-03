"use client";

import { useState } from "react";
import { ReportarPerfilModal } from "./ReportarPerfilModal";

// Envoltorio cliente para poder abrir el modal desde el perfil, que es un
// server component. El botón es deliberadamente discreto: es una salida de
// seguridad, no una acción que queramos empujar (2026-09-03).
export function ReportarPerfilBoton({ tecnicoId, nombre }: { tecnicoId: string; nombre: string }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="text-[13px] text-ink-400 underline underline-offset-2 transition-colors hover:text-ink-600"
      >
        ¿Algo no cuadra con este perfil? Reportalo
      </button>
      {abierto && (
        <ReportarPerfilModal tecnicoId={tecnicoId} nombre={nombre} onClose={() => setAbierto(false)} />
      )}
    </>
  );
}
