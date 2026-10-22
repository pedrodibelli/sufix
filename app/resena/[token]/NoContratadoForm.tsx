"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { responderNoContratado } from "./actions";
import { MOTIVOS_NO_CONTRATADO } from "./motivos";

// "No lo contraté", desde el mail de seguimiento. El motivo es opcional, pero
// es oro: "no me respondió" repetido sobre un mismo técnico es la señal más
// clara de un perfil que hay que revisar (se ve en /admin).
export function NoContratadoForm({ token, nombre }: { token: string; nombre: string }) {
  const [motivo, setMotivo] = useState("");
  const [pending, startT] = useTransition();
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  if (enviado) {
    return (
      <div className="card mt-6 p-6 text-center">
        <h2 className="display text-xl text-sv-dark">Gracias por contarnos</h2>
        <p className="mt-2 text-sm text-ink-500">Nos sirve para saber qué técnicos responden y cuáles no.</p>
        <Link href="/" className="btn-primary mt-6 w-full">
          Buscar otro técnico
        </Link>
        <Link href={`/resena/${token}`} className="mt-4 inline-block text-sm text-ink-500 underline underline-offset-2">
          ¿Al final lo contrataste? Dejale una reseña
        </Link>
      </div>
    );
  }

  function enviar() {
    setError("");
    startT(async () => {
      const r = await responderNoContratado(token, motivo);
      if ("error" in r) setError(r.error);
      else setEnviado(true);
    });
  }

  return (
    <div className="card mt-6 p-6">
      <p className="text-[15px] font-semibold text-sv-dark">¿Por qué no lo contrataste?</p>
      <p className="mt-1 text-sm text-ink-500">Es opcional, y {nombre} no se entera de lo que respondas.</p>

      <div className="mt-4 space-y-2">
        {MOTIVOS_NO_CONTRATADO.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMotivo(motivo === m.value ? "" : m.value)}
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

      {error && <p className="mt-4 text-sm font-medium text-rose-600">{error}</p>}

      <button type="button" onClick={enviar} disabled={pending} className="btn-primary mt-5 w-full disabled:opacity-60">
        {pending ? "Enviando…" : "Enviar"}
      </button>
      <div className="mt-4 text-center">
        <Link href={`/resena/${token}`} className="text-sm text-ink-500 underline underline-offset-2">
          En realidad sí lo contraté
        </Link>
      </div>
    </div>
  );
}
