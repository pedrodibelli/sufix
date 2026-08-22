"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ZONES, CATEGORIES } from "@/lib/data";
import { IconSearch, IconMapPin } from "@/components/icons";

type Sugerencia = { tipo: "oficio" | "tecnico"; label: string };

// Buscador del directorio con autocompletado: mientras escribís, sugiere
// oficios y nombres de técnicos que empiecen o contengan lo tecleado. Es el
// único filtro del directorio ahora (2026-08-21: se sacaron los chips de
// rubro y el toggle de orden — el resultado siempre sale ordenado por mejor
// calificación, filtrado por lo que se busque acá).
export function TecnicosSearchBar({
  tecQ,
  tecZona,
  tecnicos,
}: {
  tecQ: string;
  tecZona: string;
  tecnicos: { user_id: string; nombre: string | null }[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState(tecQ);
  const [zona, setZona] = useState(tecZona);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sugerencias: Sugerencia[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const oficios: Sugerencia[] = CATEGORIES
      .filter((c) => c.name.toLowerCase().startsWith(q))
      .map((c) => ({ tipo: "oficio", label: c.name }));
    const nombres: Sugerencia[] = tecnicos
      .filter((t) => t.nombre && t.nombre.toLowerCase().includes(q))
      .slice(0, 5)
      .map((t) => ({ tipo: "tecnico", label: t.nombre as string }));
    return [...oficios, ...nombres].slice(0, 8);
  }, [query, tecnicos]);

  function buscar(q: string, z: string) {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("tecQ", q.trim());
    if (z) sp.set("tecZona", z);
    const s = sp.toString();
    router.push(`/${s ? `?${s}` : ""}#tecnicos`);
    setOpen(false);
    inputRef.current?.blur();
  }

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => { if (e.key === "Enter") buscar(query, zona); }}
          placeholder="Buscar por nombre u oficio…"
          className="field w-full pl-10"
        />
        {open && sugerencias.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-ink-100 bg-white text-left shadow-lg">
            {sugerencias.map((s) => (
              <button
                key={`${s.tipo}-${s.label}`}
                type="button"
                onMouseDown={() => { setQuery(s.label); buscar(s.label, zona); }}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm text-sv-dark transition hover:bg-zap-50"
              >
                {s.label}
                <span className="text-[11px] font-medium uppercase tracking-wide text-ink-300">
                  {s.tipo === "oficio" ? "Oficio" : "Técnico"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative sm:w-56">
        <IconMapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
        <select
          value={zona}
          onChange={(e) => { setZona(e.target.value); buscar(query, e.target.value); }}
          className="field w-full appearance-none pl-10"
        >
          <option value="">Todas las zonas</option>
          {ZONES.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
      </div>

      <button type="button" onClick={() => buscar(query, zona)} className="btn-primary shrink-0 sm:px-8">
        Buscar
      </button>
    </div>
  );
}
