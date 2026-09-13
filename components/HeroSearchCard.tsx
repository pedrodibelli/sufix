"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, ZONES } from "@/lib/data";
import { IconMapPin, IconOficio, IconSearch } from "@/components/icons";
import { CustomSelect, type CustomSelectOption } from "@/components/CustomSelect";

// Buscador destacado del hero (rediseño 2026-08-28, landing nueva): oficio +
// zona, separado del buscador con autocompletado de texto libre que ya vive
// más abajo en la sección de técnicos (TecnicosSearchBar). Los dos navegan
// al mismo lugar (querystring tecQ/tecZona sobre "/"), así que comparten el
// mismo filtro real en app/page.tsx — este es solo una entrada más directa
// desde arriba de la página.
export function HeroSearchCard() {
  const router = useRouter();
  const [oficio, setOficio] = useState("");
  const [zona, setZona] = useState("");

  function buscar() {
    const sp = new URLSearchParams();
    if (oficio) sp.set("tecQ", oficio);
    if (zona) sp.set("tecZona", zona);
    const s = sp.toString();
    router.push(`/${s ? `?${s}` : ""}#tecnicos`);
  }

  // El valor guardado sigue siendo el NOMBRE del rubro (no el slug) — así lo
  // espera app/page.tsx del lado del filtro (tecQ), sin tocar esa parte.
  const catSeleccionada = CATEGORIES.find((c) => c.name === oficio);

  const opcionesOficio: CustomSelectOption[] = CATEGORIES.map((c) => ({
    value: c.name,
    label: c.name,
    icon: <IconOficio slug={c.slug} />,
  }));
  const opcionesZona: CustomSelectOption[] = [
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

      <button type="button" onClick={buscar} className="btn-primary mt-4 w-full text-center">
        Buscar técnicos
      </button>
    </div>
  );
}
