"use client";

import { useState } from "react";
import Link from "next/link";
import { TecnicoCard, type TecnicoPublico } from "@/components/TecnicoCard";
import { IconSearch, IconPeople } from "@/components/icons";

type Resumen = { promedio: number; total: number };

const TANDA = 100;

export function TecnicosGrid({
  tecnicos,
  resumenMap,
  hayFiltrosActivos = false,
  rubroContexto = null,
}: {
  tecnicos: TecnicoPublico[];
  resumenMap: Record<string, Resumen>;
  hayFiltrosActivos?: boolean;
  // Oficio desde el que se está mirando la grilla, si lo hay. Ver TecnicoCard.
  rubroContexto?: string | null;
}) {
  // Mostrar todos los técnicos de entrada (web pensada para ser bien
  // scrolleable): el corte por tandas de TANDA es solo para cuando el
  // directorio crezca mucho (a partir de ~100 técnicos), no una paginación
  // temprana artificial. "Ver más" sigue siendo real (no decorativo): ya
  // tenemos todos los técnicos cargados de una (la query no pagina), así
  // que mostrar más es solo revelar del array que ya está — sin ida y
  // vuelta al servidor. La línea divisoria (cuando no queda nada más por
  // mostrar) le sigue dando a la sección un cierre visual antes del cartel
  // de reclutamiento, para que no quede todo muy pegado (pedido 2026-08-21).
  const [visibles, setVisibles] = useState(TANDA);

  if (tecnicos.length === 0) {
    return (
      <div className="card p-10 text-center">
        {/* Íconos de línea, no emojis (2026-09-04): este estado vacío solo
            aparece en rubros sin técnicos o con filtros sin resultados, así
            que se había escapado de la limpieza de emojis anterior. */}
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-sv-mint p-2.5 text-sv-primary">
          {hayFiltrosActivos ? <IconSearch className="h-full w-full" /> : <IconPeople />}
        </div>
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
      {/* Tope de 3 columnas (no 4) — así lo tiene el mockup; con 4 las
          tarjetas quedaban más angostas/apretadas que la referencia. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mostrados.map((t) => (
          <TecnicoCard key={t.user_id} tecnico={t} resumen={resumenMap[t.user_id]} rubroContexto={rubroContexto} />
        ))}
      </div>

      {/* Corte visual + paginado real: separa la grilla de la sección
          siguiente y, si hay más técnicos que los mostrados, los revela sin
          recargar nada (ya están todos en memoria). mt-10 fijo (posición
          de siempre, pegada a la grilla) — el ajuste de espacio total con
          la sección siguiente se hace recortando el padding de la sección
          en app/page.tsx, no moviendo esta línea. */}
      <div className="mt-10 flex justify-center">
        {quedan > 0 ? (
          <button
            type="button"
            onClick={() => setVisibles((v) => v + TANDA)}
            className="btn-outline"
          >
            Ver más técnicos ({quedan}) ↓
          </button>
        ) : (
          // Estaba en /15 y prácticamente no se veía sobre el crema: el corte no
          // se leía y quedaba como un hueco vacío hasta la sección Seguridad.
          <div className="h-px w-28 rounded-full bg-sv-dark/35" aria-hidden />
        )}
      </div>
    </>
  );
}
