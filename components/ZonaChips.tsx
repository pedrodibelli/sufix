"use client";

import { ZONES } from "@/lib/data";

// Selector de varias zonas a la vez (mismo patrón que RubroChips) — la
// mayoría de los técnicos cubren bastante más que un solo barrio para tener
// trabajo suficiente. Se usa en /registrar y /perfil.
export function ZonaChips({
  selected,
  onChange,
  disabled = false,
  dark = false,
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

  return (
    <div className="flex flex-wrap gap-2">
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
                : dark
                ? "border-white/15 bg-white/5 text-zap-300 hover:border-sv-primary/60 hover:text-white"
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
