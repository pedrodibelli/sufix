"use client";

import { CATEGORIES } from "@/lib/data";
import { IconOficio } from "@/components/icons";

// Fila de oficios que se desliza en horizontal, arriba del directorio —
// SOLO mobile (2026-09-20).
//
// Es el camino corto de 620 técnicos a ~60: en un celular nadie recorre el
// listado entero, elige un oficio y mira los de ahí. Hasta ahora la única
// grilla de oficios de la home (OficiosGrid) estaba DESPUÉS del listado
// completo — en mobile eso caía cerca de la pantalla 48, o sea que no la
// veía nadie. Esta fila pone lo mismo antes de la primera tarjeta.
//
// A diferencia de OficiosGrid, estos chips NO navegan a /categoria/[slug]:
// escriben el filtro del directorio que ya está en pantalla, así que el
// resultado es instantáneo y no se pierde el scroll. OficiosGrid se queda
// como está, más abajo, porque sus links a /categoria sí le sirven a Google
// para llegar a esas páginas.
export function OficiosChips({
  oficioActivo,
  onElegir,
}: {
  // Nombre del rubro elegido ("Plomería"), o "" si no hay ninguno.
  oficioActivo: string;
  onElegir: (nombre: string) => void;
}) {
  return (
    // -mx-5/px-5 para que la fila se pueda deslizar de borde a borde de la
    // pantalla, sin cortarse contra el padding del contenedor.
    // [scrollbar-width:none] + ::-webkit-scrollbar: en mobile la barra no
    // hace falta (se desliza con el dedo) y ocupa alto.
    <div className="-mx-5 mb-3 overflow-x-auto px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2">
        {CATEGORIES.map((c) => {
          const activo = oficioActivo === c.name;
          return (
            <button
              key={c.slug}
              type="button"
              aria-pressed={activo}
              // Tocar el que ya está activo lo apaga: es la forma más
              // rápida de volver a "todos" sin ir a buscar "Limpiar".
              onClick={() => onElegir(activo ? "" : c.name)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                activo
                  ? "border-sv-primary bg-sv-primary text-white"
                  : "border-sv-dark/12 bg-white text-sv-dark"
              }`}
            >
              <IconOficio slug={c.slug} className={`h-3.5 w-3.5 shrink-0 ${activo ? "text-white" : "text-sv-primary"}`} />
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
