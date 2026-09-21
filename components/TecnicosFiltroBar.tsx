"use client";

import { CATEGORIES, ZONES } from "@/lib/data";
import { IconMapPin, IconOficio, IconSearch, IconClose } from "@/components/icons";
import { CustomSelect, type CustomSelectOption } from "@/components/CustomSelect";
import type { FiltroTecnicos } from "@/lib/filtros";

// Barra de filtro del directorio, pegada bajo el header — SOLO mobile
// (2026-09-20).
//
// El problema que resuelve: hasta ahora el único filtro de la home era el
// buscador del hero. Con 620 técnicos en una sola columna, para cuando
// estabas en la tarjeta 40 el buscador quedaba 20 pantallas más arriba: la
// única forma de cambiar de oficio era scrollear todo para atrás. Ahora el
// filtro viaja con vos.
//
// En desktop no se muestra: ahí la grilla es de 3 columnas y con la tanda
// inicial no hace falta scrollear para volver al buscador del hero, así que
// no hay nada que arreglar y no se toca lo que ya funciona.
//
// Va sticky bajo el header (top-14 = su alto), no arriba de todo, para que
// los dos convivan sin taparse.
export function TecnicosFiltroBar({
  filtro,
  onFiltroChange,
  total,
}: {
  filtro: FiltroTecnicos;
  onFiltroChange: (f: FiltroTecnicos) => void;
  // Resultados que quedan con el filtro puesto. Se muestra solo cuando hay
  // algo filtrando: sin filtro el número ya lo dice la barra de orden.
  total: number;
}) {
  // El valor guardado es el NOMBRE del rubro, no el slug — así lo espera el
  // filtro de texto libre (ver lib/filtros.ts), que matchea contra el nombre.
  const catSeleccionada = CATEGORIES.find((c) => c.name === filtro.q);

  const opcionesOficio: CustomSelectOption[] = [
    { value: "", label: "Todos los oficios" },
    ...CATEGORIES.map((c) => ({
      value: c.name,
      label: c.name,
      icon: <IconOficio slug={c.slug} />,
    })),
  ];
  const opcionesZona: CustomSelectOption[] = [
    { value: "", label: "Todas las zonas" },
    { value: "CABA", label: "Toda CABA" },
    ...ZONES.map((z) => ({ value: z, label: z })),
  ];

  const hayFiltro = !!(filtro.q || filtro.zona);

  return (
    // -mx-5 + px-5 para que el fondo llegue a los bordes de la pantalla
    // aunque el contenedor (container-home) tenga padding lateral.
    <div className="sticky top-14 z-30 -mx-5 mb-4 border-b border-ink-100 bg-[#FBF8EF]/95 px-5 py-2.5 backdrop-blur lg:hidden">
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <CustomSelect
            variant="pill"
            value={filtro.q}
            onChange={(q) => onFiltroChange({ ...filtro, q })}
            options={opcionesOficio}
            placeholder="Oficio"
            triggerIcon={
              catSeleccionada ? (
                <IconOficio slug={catSeleccionada.slug} />
              ) : (
                <IconSearch className="h-full w-full" />
              )
            }
          />
        </div>
        <div className="min-w-0 flex-1">
          <CustomSelect
            variant="pill"
            menuAlign="right"
            value={filtro.zona}
            onChange={(zona) => onFiltroChange({ ...filtro, zona })}
            options={opcionesZona}
            placeholder="Zona"
            triggerIcon={<IconMapPin className="h-full w-full" />}
          />
        </div>
      </div>

      {/* El conteo va acá y no en la barra de orden porque esta es la que
          queda pegada: es lo único que te dice cuántos resultados hay cuando
          ya scrolleaste y la barra de orden quedó arriba. TecnicosSortBar
          esconde su propio conteo en mobile justamente para no repetirlo. */}
      <div className="mt-1.5 flex items-center justify-between gap-3 text-[12px]">
        <span className="font-medium text-ink-500">
          {total} {total === 1 ? "técnico" : "técnicos"}
        </span>
        {hayFiltro && (
          <button
            type="button"
            onClick={() => onFiltroChange({ q: "", zona: "" })}
            className="inline-flex items-center gap-1 font-semibold text-sv-primary"
          >
            <IconClose className="h-3 w-3" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
