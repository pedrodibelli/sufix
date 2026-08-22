"use client";

import { useState } from "react";
import Link from "next/link";
import { TecnicoCard, type TecnicoPublico } from "@/components/TecnicoCard";

type Resumen = { promedio: number; total: number };

const TANDA = 8;

export function TecnicosGrid({
  tecnicos,
  resumenMap,
  hayFiltrosActivos = false,
}: {
  tecnicos: TecnicoPublico[];
  resumenMap: Record<string, Resumen>;
  hayFiltrosActivos?: boolean;
}) {
  // "Ver más" real (no decorativo): ya tenemos todos los técnicos cargados
  // de una (la query no pagina), así que mostrar más es solo revelar del
  // array que ya está — sin ida y vuelta al servidor. Además de la función,
  // le da a la sección un cierre visual antes del cartel de reclutamiento,
  // que si no queda todo muy pegado (pedido 2026-08-21).
  const [visibles, setVisibles] = useState(TANDA);

  if (tecnicos.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="text-2xl">{hayFiltrosActivos ? "🔍" : "🔧"}</div>
        <h3 className="display mt-2 text-xl text-sv-dark">
          {hayFiltrosActivos ? "Sin resultados para esa búsqueda" : "Todavía no hay técnicos cargados"}
        </h3>
        <p className="mt-2 text-sm text-ink-400">
          {hayFiltrosActivos
            ? "Probá con otro rubro, otra zona o sin texto de búsqueda."
            : "Estamos sumando profesionales verificados a tu zona. Volvé pronto."}
        </p>
        {hayFiltrosActivos && (
          <Link href="/#tecnicos" className="mt-4 inline-block text-sm font-medium text-sv-primary underline underline-offset-4">
            Limpiar filtros
          </Link>
        )}
      </div>
    );
  }

  const mostrados = tecnicos.slice(0, visibles);
  const quedan = tecnicos.length - mostrados.length;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mostrados.map((t) => (
          <TecnicoCard key={t.user_id} tecnico={t} resumen={resumenMap[t.user_id]} />
        ))}
      </div>

      {/* Corte visual + paginado real: separa la grilla de lo que sigue
          (cartel de reclutamiento) y, si hay más técnicos que los mostrados,
          los revela sin recargar nada (ya están todos en memoria). */}
      <div className="mt-10 flex justify-center">
        {quedan > 0 ? (
          <button
            type="button"
            onClick={() => setVisibles((v) => v + TANDA)}
            className="btn-outline border-white/25 bg-white/5 text-white hover:bg-white/10"
          >
            Ver más técnicos ({quedan}) ↓
          </button>
        ) : (
          <div className="h-px w-24 rounded-full bg-white/15" aria-hidden />
        )}
      </div>
    </>
  );
}
