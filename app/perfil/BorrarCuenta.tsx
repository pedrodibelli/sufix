"use client";

import { useState, useTransition } from "react";
import { borrarCuenta } from "./actions";

// Baja de cuenta, para los dos roles (2026-09-07). Va al final de /perfil,
// en tono discreto: es una salida, no algo que queramos empujar.
//
// Pide escribir BORRAR a mano en vez de un "¿estás seguro?": es irreversible
// y con un solo botón de confirmación es demasiado fácil hacerlo sin querer.
export function BorrarCuenta({ esProfesional }: { esProfesional: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <section className="mt-10 border-t border-ink-100 pt-6">
      {!abierto ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-[15px] font-semibold text-sv-dark">Borrar mi cuenta</h2>
            <p className="mt-0.5 text-[13.5px] text-ink-500">
              {esProfesional
                ? "Se borra tu perfil del directorio y dejás de aparecer en las búsquedas."
                : "Se borran tus datos y las reseñas que dejaste."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAbierto(true)}
            className="shrink-0 rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
          >
            Borrar cuenta
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5">
          <h2 className="font-display text-[15px] font-semibold text-sv-dark">
            ¿Seguro que querés borrar tu cuenta?
          </h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-700">
            Esto no se puede deshacer. Se borran{" "}
            {esProfesional
              ? "tu perfil público, tu foto y las reseñas que recibiste. Dejás de aparecer en el directorio al instante."
              : "tus datos de cuenta, tu foto y las reseñas que dejaste."}
          </p>

          <label htmlFor="confirmar" className="mt-4 block text-[13px] font-medium text-ink-700">
            Escribí <span className="font-semibold text-sv-dark">BORRAR</span> para confirmar
          </label>
          <input
            id="confirmar"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            autoComplete="off"
            className="field mt-1.5 max-w-[220px]"
            placeholder="BORRAR"
          />

          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              type="button"
              disabled={isPending || texto.trim().toUpperCase() !== "BORRAR"}
              onClick={() => {
                setError("");
                startTransition(async () => {
                  const r = await borrarCuenta(texto);
                  if ("error" in r) setError(r.error);
                  // Recarga completa: la sesión ya se cerró del lado del
                  // servidor, así que hay que rearmar todo desde cero.
                  else window.location.href = "/";
                });
              }}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Borrando…" : "Sí, borrar mi cuenta"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => { setAbierto(false); setTexto(""); setError(""); }}
              className="btn-ghost text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
