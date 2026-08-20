"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearResenaDirecta } from "./actions";

// Reseña directa: cualquier usuario logueado puede calificar a este técnico
// sin depender de un trabajo publicado/cerrado. Mismo look que el viejo
// CalificarBlock de mis-consultas, pero independiente.
export function DejarResenaForm({ tecnicoId }: { tecnicoId: string }) {
  const router = useRouter();
  const [estrellas, setEstrellas] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [pending, startT] = useTransition();
  const [error, setError] = useState("");
  const [listo, setListo] = useState(false);

  if (listo) {
    return (
      <div className="card mt-5 border-emerald-100 bg-emerald-50 p-5">
        <p className="text-sm font-semibold text-emerald-700">⭐ ¡Gracias por tu reseña!</p>
      </div>
    );
  }

  function enviar() {
    if (estrellas < 1) {
      setError("Elegí cuántas estrellas.");
      return;
    }
    setError("");
    startT(async () => {
      const r = await crearResenaDirecta(tecnicoId, estrellas, comentario);
      if ("error" in r) {
        setError(r.error);
        return;
      }
      setListo(true);
      router.refresh();
    });
  }

  return (
    <div className="card mt-5 p-5">
      <p className="text-sm font-semibold text-sv-dark">Dejá tu reseña</p>
      <p className="mt-1 text-xs text-ink-400">¿Ya lo contactaste? Contale a otros cómo te fue.</p>
      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setEstrellas(n)}
            aria-label={`${n} estrella${n !== 1 ? "s" : ""}`}
            className={`text-2xl leading-none ${(hover || estrellas) >= n ? "text-amber-400" : "text-ink-300"}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        placeholder="Contá cómo fue (opcional)"
        rows={2}
        className="field mt-3 resize-none text-sm"
      />
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
      <button
        type="button"
        disabled={pending}
        onClick={enviar}
        className="btn-primary mt-3 text-sm disabled:opacity-50"
      >
        {pending ? "Enviando…" : "Enviar reseña"}
      </button>
    </div>
  );
}
