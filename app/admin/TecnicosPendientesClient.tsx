"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { verificarTecnico } from "./actions";
import { CATEGORIES } from "@/lib/data";

export type TecnicoPendiente = {
  user_id: string;
  nombre: string | null;
  telefono: string | null;
  rubro: string[] | null;
  zona: string[] | null;
  creado_at: string | null;
};

export function TecnicosPendientesClient({ tecnicos }: { tecnicos: TecnicoPendiente[] }) {
  const [ocultos, setOcultos] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const visibles = tecnicos.filter((t) => !ocultos.includes(t.user_id));

  if (visibles.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-ink-200 p-10 text-center text-sm text-ink-400">
        No hay técnicos esperando revisión.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {visibles.map((t) => {
        const tel = (t.telefono ?? "").replace(/\D/g, "");
        return (
          <div key={t.user_id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <Link
                  href={`/tecnico/${t.user_id}`}
                  className="font-display text-[15px] font-semibold text-sv-dark hover:text-sv-primary hover:underline"
                >
                  {t.nombre?.trim() || "Sin nombre"}
                </Link>

                <dl className="mt-2 space-y-1 text-[13.5px] text-ink-600">
                  <div className="flex gap-2">
                    <dt className="text-ink-400">Teléfono</dt>
                    <dd>
                      {tel ? (
                        // Link directo para llamarlo/escribirle: verificar es
                        // justamente hablar con él.
                        <a
                          href={`https://wa.me/${tel}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-sv-primary hover:underline"
                        >
                          {t.telefono}
                        </a>
                      ) : (
                        <span className="text-rose-600">falta</span>
                      )}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-ink-400">Rubros</dt>
                    <dd>{t.rubro?.length ? t.rubro.map((r) => CATEGORIES.find((c) => c.slug === r)?.name ?? r).join(", ") : <span className="text-rose-600">ninguno</span>}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-ink-400">Zonas</dt>
                    <dd>{t.zona?.length ? t.zona.join(", ") : <span className="text-rose-600">ninguna</span>}</dd>
                  </div>
                </dl>

                {t.creado_at && (
                  <p className="mt-2.5 text-[12px] text-ink-400">
                    Se registró el {new Date(t.creado_at).toLocaleDateString("es-AR")}
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    setError("");
                    const r = await verificarTecnico(t.user_id);
                    if ("error" in r) setError(r.error);
                    else setOcultos((o) => [...o, t.user_id]);
                  })
                }
                className="shrink-0 rounded-xl bg-sv-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sv-olive disabled:opacity-60"
              >
                Marcar verificado
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
