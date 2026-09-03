"use client";

import { CATEGORIES } from "@/lib/data";
import { IconOficio } from "@/components/icons";

// Selector de varios rubros a la vez (chips que se prenden/apagan). Un
// técnico puede hacer más de un tipo de trabajo — antes solo se podía elegir
// uno. Se usa en /registrar y /perfil. El prop "dark" queda en la firma
// solo para no romper call sites viejos — desde el rediseño 2026-08-28 es
// un solo tema claro, así que no cambia nada visualmente.
export function RubroChips({
  selected,
  onChange,
  disabled = false,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  dark?: boolean;
}) {
  function toggle(slug: string) {
    if (disabled) return;
    onChange(
      selected.includes(slug)
        ? selected.filter((s) => s !== slug)
        : [...selected, slug]
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((c) => {
        const active = selected.includes(c.slug);
        return (
          <button
            key={c.slug}
            type="button"
            disabled={disabled}
            onClick={() => toggle(c.slug)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed ${
              active
                ? "border-sv-primary bg-sv-primary text-white"
                : "border-ink-200 bg-white text-ink-500 hover:border-sv-primary hover:text-sv-dark"
            } ${disabled && !active ? "opacity-50" : ""}`}
          >
            {/* El ícono hereda currentColor a propósito: el chip activo es
                verde con texto blanco, así que un color fijo desaparecería. */}
            <IconOficio slug={c.slug} className="h-4 w-4 shrink-0" />
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
