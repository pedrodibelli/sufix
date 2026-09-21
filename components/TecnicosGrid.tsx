"use client";

import { useState } from "react";
import { TecnicoCard, type TecnicoPublico } from "@/components/TecnicoCard";
import { IconSearch, IconPeople } from "@/components/icons";

type Resumen = { promedio: number; total: number };

// Cuántas tarjetas se muestran de entrada, y cuántas suma cada "Ver más".
//
// Estaba en 100 (2026-08, cuando había ~25 técnicos y "mostrar todo" era
// razonable). Con 620 cargados eso pasó a ser, en un celular, un muro de 100
// tarjetas en una sola columna: 44 pantallas de scroll solo de grilla, con el
// resto de la home enterrado abajo. Nadie recorre 620 perfiles de arriba a
// abajo — se filtra y se eligen los primeros.
//
// 12 anda bien en los dos lados: en mobile son ~3 pantallas, en desktop
// (3 columnas) son 4 filas completas, que llenan la vista sin dejarla corta.
const TANDA = 12;

export function TecnicosGrid({
  tecnicos,
  resumenMap,
  hayFiltrosActivos = false,
  rubroContexto = null,
  onLimpiarFiltros,
}: {
  tecnicos: TecnicoPublico[];
  resumenMap: Record<string, Resumen>;
  hayFiltrosActivos?: boolean;
  // Oficio desde el que se está mirando la grilla, si lo hay. Ver TecnicoCard.
  rubroContexto?: string | null;
  // Cómo limpiar el filtro desde el estado vacío. Lo pasa quien tenga el
  // filtro en estado (la home); /categoria/[slug] no lo pasa porque ahí el
  // "filtro" es la ruta misma, no algo que esta grilla pueda limpiar.
  onLimpiarFiltros?: () => void;
}) {
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
            ? "Probá con otro oficio, otra zona, o sacá los filtros."
            : "Estamos sumando profesionales verificados a tu zona. Volvé pronto."}
        </p>
        {hayFiltrosActivos && onLimpiarFiltros && (
          <button
            type="button"
            onClick={onLimpiarFiltros}
            className="mt-4 text-sm font-medium text-sv-primary underline underline-offset-4"
          >
            Ver todos los técnicos
          </button>
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {mostrados.map((t) => (
          <TecnicoCard key={t.user_id} tecnico={t} resumen={resumenMap[t.user_id]} rubroContexto={rubroContexto} />
        ))}
      </div>

      {/* Corte visual + paginado real: separa la grilla de la sección
          siguiente y, si hay más técnicos que los mostrados, los revela sin
          recargar nada (ya están todos en memoria). */}
      <div className="mt-8 flex flex-col items-center gap-3">
        {quedan > 0 ? (
          <>
            {/* Saber en qué parte de la lista estás: sin esto, "Ver más" en
                un listado de 620 no da ninguna idea de cuánto falta. */}
            <p className="text-[13px] font-medium text-ink-400">
              Mostrando {mostrados.length} de {tecnicos.length}
            </p>
            <button
              type="button"
              onClick={() => setVisibles((v) => v + TANDA)}
              className="btn-outline w-full sm:w-auto"
            >
              Ver más técnicos ({quedan}) ↓
            </button>
          </>
        ) : (
          // Estaba en /15 y prácticamente no se veía sobre el crema: el corte no
          // se leía y quedaba como un hueco vacío hasta la sección Seguridad.
          <div className="mt-2 h-px w-28 rounded-full bg-sv-dark/35" aria-hidden />
        )}
      </div>
    </>
  );
}
