"use client";

import { useState, useTransition } from "react";
import { darDeBaja } from "./actions";

export function BajaBoton({ token }: { token: string }) {
  const [pending, startT] = useTransition();
  const [listo, setListo] = useState(false);
  const [error, setError] = useState("");

  if (listo) {
    return (
      <p className="mt-6 rounded-xl bg-sv-mint/60 px-4 py-3 text-sm font-medium text-sv-olive">
        Listo, te dimos de baja. No te vamos a escribir más.
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startT(async () => {
            const r = await darDeBaja(token);
            if ("error" in r) setError(r.error);
            else setListo(true);
          })
        }
        className="btn-primary mt-6 w-full disabled:opacity-60"
      >
        {pending ? "Un momento…" : "Sí, darme de baja"}
      </button>
      {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
    </>
  );
}
