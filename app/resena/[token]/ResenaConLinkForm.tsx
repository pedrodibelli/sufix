"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { enviarResenaConLink } from "./actions";

const ETIQUETAS = ["", "Malo", "Regular", "Bueno", "Muy bueno", "Excelente"];

// Mismo formulario de estrellas que DejarResenaForm (/tecnico/[id]), pero
// autorizado por el token del mail en vez de por una sesión, y con un campo
// para el nombre: sin cuenta no hay de dónde sacarlo.
export function ResenaConLinkForm({
  token,
  nombre,
  tecnicoId,
  inicial,
}: {
  token: string;
  nombre: string;
  tecnicoId: string;
  inicial: { estrellas: number; comentario: string; autor: string } | null;
}) {
  const [estrellas, setEstrellas] = useState(inicial?.estrellas ?? 0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState(inicial?.comentario ?? "");
  const [autor, setAutor] = useState(inicial?.autor ?? "");
  const [pending, startT] = useTransition();
  const [error, setError] = useState("");
  const [listo, setListo] = useState(false);

  if (listo) {
    return (
      <div className="card mt-6 p-6 text-center">
        <h2 className="display text-xl text-sv-dark">¡Gracias por tu reseña!</h2>
        <p className="mt-2 text-sm text-ink-500">
          Ya se ve en el perfil de {nombre}. Le ayuda a otros vecinos a elegir, y a {nombre} a conseguir más trabajo.
        </p>
        <Link href={`/tecnico/${tecnicoId}`} className="btn-primary mt-6 w-full">
          Ver el perfil de {nombre}
        </Link>
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
      const r = await enviarResenaConLink(token, estrellas, comentario, autor);
      if ("error" in r) setError(r.error);
      else setListo(true);
    });
  }

  const visibles = hover || estrellas;

  return (
    <div className="card mt-6 p-6">
      {inicial && (
        <p className="mb-4 rounded-xl bg-sv-mint/60 px-3.5 py-2.5 text-[13px] text-sv-olive">
          Ya le dejaste una reseña. Si querés, podés cambiarla.
        </p>
      )}

      <p className="label">¿Cómo lo calificarías?</p>
      <div className="flex items-center gap-3">
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onMouseEnter={() => setHover(n)}
              onClick={() => {
                setEstrellas(n);
                setError("");
              }}
              aria-label={`${n} estrella${n !== 1 ? "s" : ""}`}
              aria-pressed={estrellas === n}
              className={`text-[34px] leading-none transition-colors ${visibles >= n ? "text-amber-400" : "text-ink-300"}`}
            >
              ★
            </button>
          ))}
        </div>
        {visibles > 0 && <span className="text-sm font-medium text-ink-600">{ETIQUETAS[visibles]}</span>}
      </div>

      <label htmlFor="resena-comentario" className="label mt-5">
        Contá cómo fue <span className="font-normal text-ink-400">(opcional)</span>
      </label>
      <textarea
        id="resena-comentario"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="¿Llegó cuando dijo? ¿Respetó el presupuesto? ¿Lo recomendarías?"
        className="field resize-none"
      />

      <label htmlFor="resena-autor" className="label mt-4">
        Tu nombre <span className="font-normal text-ink-400">(opcional)</span>
      </label>
      <input
        id="resena-autor"
        value={autor}
        onChange={(e) => setAutor(e.target.value)}
        maxLength={40}
        autoComplete="name"
        placeholder="Ej: Laura M."
        className="field"
      />
      <p className="mt-1.5 text-xs text-ink-400">Es lo que se muestra arriba de tu reseña. Si lo dejás vacío, aparece como “Cliente”.</p>

      {error && <p className="mt-4 text-sm font-medium text-rose-600">{error}</p>}

      <button type="button" onClick={enviar} disabled={pending} className="btn-primary mt-5 w-full disabled:opacity-60">
        {pending ? "Publicando…" : inicial ? "Guardar cambios" : "Publicar reseña"}
      </button>
      <p className="mt-3 text-center text-xs text-ink-400">No hace falta crear una cuenta. Tu mail no se muestra.</p>
    </div>
  );
}
