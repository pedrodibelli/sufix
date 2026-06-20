"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { aprobarPago, rechazarPago } from "./actions";

export type PagoEnRevision = {
  id: string;
  precio: number;
  titulo: string | null;
  demandante: string | null;
  nombre_profesional: string | null;
  zona: string | null;
  categoria: string | null;
  pago_revision_at: string | null;
};

function PagoRow({ pago }: { pago: PagoEnRevision }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handle(accion: "aprobar" | "rechazar") {
    setError(null);
    startTransition(async () => {
      const result =
        accion === "aprobar"
          ? await aprobarPago(pago.id)
          : await rechazarPago(pago.id);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-[0_1px_2px_rgba(40,63,59,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="display text-[17px] leading-snug text-sv-dark">
            {pago.titulo ?? "Consulta"}
          </h3>
          <p className="mt-1 text-[12.5px] text-ink-400">
            {pago.zona ?? "—"}
            {pago.pago_revision_at
              ? ` · declarado ${new Date(pago.pago_revision_at).toLocaleString("es-AR")}`
              : ""}
          </p>
          <div className="mt-2 text-[12.5px] text-ink-500">
            Demandante:{" "}
            <span className="font-medium text-sv-dark">{pago.demandante ?? "—"}</span>
            <span className="mx-1.5">·</span>
            Profesional:{" "}
            <span className="font-medium text-sv-dark">{pago.nombre_profesional ?? "—"}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-xl font-semibold text-sv-dark">
            ${Number(pago.precio).toLocaleString("es-AR")}
          </div>
          <div className="text-[11px] text-ink-400">consulta</div>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handle("rechazar")}
          className="flex-1 rounded-xl border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-500 transition hover:bg-ink-50 disabled:opacity-50"
        >
          Rechazar
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handle("aprobar")}
          className="btn-primary flex-1 text-sm disabled:opacity-50"
        >
          {isPending ? "Procesando…" : "Aprobar pago"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-center text-xs font-medium text-rose-600">{error}</p>
      )}
    </div>
  );
}

export function AdminClient({ pagos }: { pagos: PagoEnRevision[] }) {
  if (pagos.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-ink-200 p-12 text-center">
        <div className="text-3xl opacity-60">✅</div>
        <h4 className="display mt-2.5 text-base">No hay pagos pendientes</h4>
        <p className="mt-1 text-sm text-ink-400">
          Cuando un demandante declare un pago, va a aparecer acá.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {pagos.map((p) => (
        <PagoRow key={p.id} pago={p} />
      ))}
    </div>
  );
}
