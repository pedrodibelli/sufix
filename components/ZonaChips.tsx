"use client";

import { ZONES, ZONAS_CABA } from "@/lib/data";

// Selector de varias zonas a la vez (mismo patrón que RubroChips) — la
// mayoría de los técnicos cubren bastante más que un solo barrio para tener
// trabajo suficiente. Se usa en /registrar y /perfil.
// El prop "dark" queda en la firma solo para no romper call sites viejos —
// desde el rediseño 2026-08-28 es un solo tema claro, no cambia nada visualmente.
export function ZonaChips({
  selected,
  onChange,
  disabled = false,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  dark?: boolean;
}) {
  function toggle(zona: string) {
    if (disabled) return;
    onChange(
      selected.includes(zona)
        ? selected.filter((z) => z !== zona)
        : [...selected, zona]
    );
  }

  // "Toda CABA" no es una zona nueva — es un atajo que tilda las 9 de CABA
  // de una (ver ZONAS_CABA en lib/data.ts). Sirve tanto para el técnico que
  // realmente cubre toda la Capital como para el que es de un barrio que
  // todavía no está en la lista (ej. Devoto): en vez de no poder anotar
  // nada, marca este botón. Activo cuando las 9 ya están seleccionadas.
  const todaCabaActiva = ZONAS_CABA.every((z) => selected.includes(z));
  function toggleTodaCaba() {
    if (disabled) return;
    onChange(
      todaCabaActiva
        ? selected.filter((z) => !ZONAS_CABA.includes(z))
        : [...new Set([...selected, ...ZONAS_CABA])]
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={toggleTodaCaba}
        aria-pressed={todaCabaActiva}
        className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed ${
          todaCabaActiva
            ? "border-sv-olive bg-sv-olive text-white"
            : "border-dashed border-ink-300 bg-white text-ink-600 hover:border-sv-primary hover:text-sv-dark"
        } ${disabled && !todaCabaActiva ? "opacity-50" : ""}`}
      >
        🏙️ CABA
      </button>
      {ZONES.map((z) => {
        const active = selected.includes(z);
        return (
          <button
            key={z}
            type="button"
            disabled={disabled}
            onClick={() => toggle(z)}
            aria-pressed={active}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed ${
              active
                ? "border-sv-primary bg-sv-primary text-white"
                : "border-ink-200 bg-white text-ink-500 hover:border-sv-primary hover:text-sv-dark"
            } ${disabled && !active ? "opacity-50" : ""}`}
          >
            {z}
          </button>
        );
      })}
    </div>
  );
}
