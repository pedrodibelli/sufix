"use client";

import { useState, useTransition } from "react";
import { reportarPerfil } from "./actions";

// Motivos cerrados + detalle libre: pensado para que reportar sea de un
// clic y medio. Los textos son los problemas reales que puede tener un
// perfil de este directorio (2026-09-03).
const MOTIVOS = [
  { value: "datos_incorrectos", label: "El teléfono o los datos no son correctos" },
  { value: "no_es_el_tecnico", label: "El perfil no corresponde a esta persona" },
  { value: "no_trabaja", label: "Ya no trabaja o no atiende" },
  { value: "trato", label: "Tuve un problema con su trato o su trabajo" },
  { value: "otro", label: "Otro motivo" },
];

export function ReportarPerfilModal({
  tecnicoId,
  nombre,
  onClose,
}: {
  tecnicoId: string;
  nombre: string;
  onClose: () => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleEnviar() {
    if (!motivo) {
      setError("Elegí un motivo.");
      return;
    }
    setError("");
    startTransition(async () => {
      const r = await reportarPerfil(tecnicoId, motivo, detalle);
      if ("error" in r) setError(r.error);
      else setEnviado(true);
    });
  }

  return (
    <div
      className="animate-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="animate-modal relative w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {enviado ? (
          <div className="p-8 text-center">
            <h3 className="display text-xl text-sv-dark">Gracias por avisarnos</h3>
            <p className="mt-2 text-sm text-ink-500">
              Vamos a revisar el perfil de {nombre}. Si hace falta, lo damos de baja del directorio.
            </p>
            <button type="button" onClick={onClose} className="btn-primary mt-6 w-full">
              Cerrar
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-7">
            <h3 className="display text-xl text-sv-dark">Reportar este perfil</h3>
            <p className="mt-1.5 text-sm text-ink-500">
              Contanos qué pasa con el perfil de {nombre}. Lo revisa una persona de nuestro equipo.
            </p>

            <div className="mt-5 space-y-2">
              {MOTIVOS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMotivo(m.value)}
                  aria-pressed={motivo === m.value}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                    motivo === m.value
                      ? "border-sv-primary bg-sv-primary/10 font-medium text-sv-dark"
                      : "border-ink-200 text-ink-600 hover:border-sv-primary/60"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <label className="label mt-5 block">Detalle (opcional)</label>
            <textarea
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Contanos un poco más, si querés."
              className="field resize-none"
            />

            {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

            <div className="mt-5 flex gap-2.5">
              <button type="button" onClick={onClose} className="btn-ghost flex-1">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEnviar}
                disabled={isPending}
                className="btn-primary flex-1 disabled:opacity-60"
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
