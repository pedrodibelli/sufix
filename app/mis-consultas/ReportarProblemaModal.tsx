"use client";

import { useState, useTransition } from "react";
import { reportarProblema } from "./actions";

interface Props {
  propuestaId: string;
  publicacionId: string;
  rol: "demandante" | "oferente";
  dark?: boolean;
  onClose: () => void;
}

export function ReportarProblemaModal({ propuestaId, publicacionId, rol, dark, onClose }: Props) {
  const [motivo, setMotivo] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleEnviar() {
    if (motivo.trim().length < 10) {
      setError("Por favor describí el problema con más detalle.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await reportarProblema(propuestaId, publicacionId, motivo, rol);
      if ("error" in result) {
        setError(result.error);
      } else {
        setEnviado(true);
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={enviado ? onClose : undefined}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {enviado ? (
          <div className="flex flex-col items-center px-8 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
              ✅
            </div>
            <h2 className="display mt-4 text-xl text-sv-dark">Reporte enviado</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-400">
              El equipo de Sufix te va a contactar por WhatsApp en{" "}
              <strong className="text-sv-dark">menos de 24 hs</strong> para resolver la situación.
            </p>
            <button type="button" onClick={onClose} className="btn-primary mt-6 w-full">
              Entendido
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="display text-xl text-sv-dark">Reportar un problema</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-ink-100 transition"
              >
                ✕
              </button>
            </div>

            <p className="mb-4 text-sm leading-relaxed text-ink-400">
              Contanos qué pasó para que el equipo de Sufix pueda ayudarte.
            </p>

            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: el técnico no se presentó, el trabajo no quedó como se acordó..."
              rows={4}
              className="field resize-none text-sm"
            />

            {error && (
              <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>
            )}

            <div className="mt-4 flex gap-3">
              <button type="button" onClick={onClose} className="btn-ghost flex-1">
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPending || motivo.trim().length < 10}
                onClick={handleEnviar}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {isPending ? "Enviando…" : "Enviar reporte"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
