"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { marcarReporteRevisado } from "./actions";

export type Reporte = {
  id: string;
  tipo: string;
  motivo: string;
  detalle: string | null;
  estado: string;
  creado_at: string;
  tecnico_id: string | null;
  tecnico_nombre: string | null;
  reportado_por_email: string | null;
};

const TIPO_LABEL: Record<string, string> = {
  perfil: "Perfil de técnico",
  tecnico: "Problema con un técnico",
  web: "Problema con el sitio",
  sugerencia: "Sugerencia",
};

const MOTIVO_LABEL: Record<string, string> = {
  datos_incorrectos: "Datos incorrectos",
  no_es_el_tecnico: "No corresponde a esta persona",
  no_trabaja: "Ya no trabaja",
  trato: "Problema de trato o trabajo",
  otro: "Otro",
};

export function ReportesClient({ reportes }: { reportes: Reporte[] }) {
  const [ocultos, setOcultos] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const visibles = reportes.filter((r) => !ocultos.includes(r.id));

  if (visibles.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-dashed border-ink-200 p-10 text-center text-sm text-ink-400">
        No hay reportes pendientes.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {visibles.map((r) => (
        <div key={r.id} className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-600">
                  {TIPO_LABEL[r.tipo] ?? r.tipo}
                </span>
                {r.tipo === "perfil" && (
                  <span className="text-[12px] text-ink-500">
                    {MOTIVO_LABEL[r.motivo] ?? r.motivo}
                  </span>
                )}
              </div>

              {r.tecnico_id && (
                <p className="mt-2 text-sm font-semibold text-sv-dark">
                  Sobre:{" "}
                  <Link href={`/tecnico/${r.tecnico_id}`} className="text-sv-primary hover:underline">
                    {r.tecnico_nombre ?? "Ver perfil"}
                  </Link>
                </p>
              )}

              {r.detalle && (
                <p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
                  {r.detalle}
                </p>
              )}

              <p className="mt-2.5 text-[12px] text-ink-400">
                {new Date(r.creado_at).toLocaleString("es-AR")} ·{" "}
                {r.reportado_por_email ?? "Sin cuenta (anónimo)"}
              </p>
            </div>

            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const res = await marcarReporteRevisado(r.id);
                  if (!("error" in res)) setOcultos((o) => [...o, r.id]);
                })
              }
              className="btn-outline shrink-0 text-sm disabled:opacity-60"
            >
              Marcar revisado
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
