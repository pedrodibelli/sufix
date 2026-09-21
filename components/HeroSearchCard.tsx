"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, ZONES } from "@/lib/data";
import { IconMapPin, IconOficio, IconSearch } from "@/components/icons";
import { CustomSelect, type CustomSelectOption } from "@/components/CustomSelect";
import { useDirectorio } from "@/components/DirectorioContext";

// Buscador destacado del hero (rediseño 2026-08-28, landing nueva): oficio +
// zona. Solo se ve en desktop — en mobile el filtro es la barra sticky que
// viaja pegada al listado (TecnicosFiltroBar), ver app/page.tsx.
//
// Arreglo 2026-09-21: antes hacía router.push("/?tecQ=…#tecnicos"). Desde que
// el filtro vive en el navegador eso dejó de filtrar nada — cambiaba la URL y
// el listado seguía mostrando los 620. Ahora escribe el mismo estado que lee
// la grilla (DirectorioContext), que además mantiene la URL al día con
// replaceState, así que el link sigue siendo igual de compartible. El detalle
// de por qué el push fallaba está en DirectorioContext.tsx.
export function HeroSearchCard() {
  const { filtro, aplicarFiltro } = useDirectorio();

  // Borrador: acá los selectores no filtran solos, porque el listado está
  // lejos (más abajo en la página) y no se vería moverse nada. Se aplica al
  // apretar el botón, que es además lo que dispara el salto a las tarjetas.
  const [oficio, setOficio] = useState(filtro.q);
  const [zona, setZona] = useState(filtro.zona);

  // Si el filtro cambia desde otro lado (ej. "Sacar los filtros" en el estado
  // vacío de la grilla), el borrador tiene que reflejarlo: si no, el hero
  // sigue mostrando un oficio que ya no está aplicado.
  useEffect(() => {
    setOficio(filtro.q);
    setZona(filtro.zona);
  }, [filtro]);

  // El valor guardado sigue siendo el NOMBRE del rubro (no el slug) — así lo
  // espera el filtro de texto libre, que matchea contra el nombre
  // (ver lib/filtros.ts).
  const catSeleccionada = CATEGORIES.find((c) => c.name === oficio);

  const opcionesOficio: CustomSelectOption[] = [
    { value: "", label: "Cualquier oficio" },
    ...CATEGORIES.map((c) => ({
      value: c.name,
      label: c.name,
      icon: <IconOficio slug={c.slug} />,
    })),
  ];
  const opcionesZona: CustomSelectOption[] = [
    { value: "", label: "Cualquier zona" },
    { value: "CABA", label: "Toda CABA" },
    ...ZONES.map((z) => ({ value: z, label: z })),
  ];

  return (
    <div className="relative z-10 rounded-[28px] border border-sv-dark/10 bg-[#FBF8EF] p-6 shadow-[0_26px_60px_-30px_rgba(29,46,32,0.3)]">
      <h3 className="display text-lg text-sv-dark">Contanos qué necesitás</h3>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">Oficio</label>
        {/* Menú propio en vez de <select> nativo (2026-09-13): el nativo lo
            dibuja el sistema operativo — tipografía y celeste de "elegido"
            genéricos, sin nuestro estilo. CustomSelect abre con la misma
            caja/colores de acá, y de paso muestra el ícono de cada oficio
            en el menú, algo que un <option> nunca pudo hacer. */}
        <CustomSelect
          value={oficio}
          onChange={setOficio}
          options={opcionesOficio}
          placeholder="Cualquier oficio"
          triggerIcon={catSeleccionada ? <IconOficio slug={catSeleccionada.slug} /> : <IconSearch className="h-full w-full" />}
        />
      </div>

      <div className="mt-3.5">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">Zona</label>
        <CustomSelect
          value={zona}
          onChange={setZona}
          options={opcionesZona}
          placeholder="Cualquier zona"
          triggerIcon={<IconMapPin className="h-4 w-4 text-sv-dark" />}
        />
      </div>

      <button
        type="button"
        onClick={() => aplicarFiltro({ q: oficio, zona }, { irAlListado: true })}
        className="btn-primary mt-4 w-full text-center"
      >
        Buscar técnicos
      </button>
    </div>
  );
}
