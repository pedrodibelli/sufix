import Link from "next/link";
import type { Category } from "@/lib/data";
import { IconOficio } from "@/components/icons";

// Arreglado 2026-09-03: mostraba emojis y el campo `count` hardcodeado de
// lib/data.ts ("100 profesionales"), que era del mock viejo pre-pivot y no
// tenía nada que ver con los técnicos reales de la base — al entrar a la
// categoría aparecían 12, no 100. Ahora usa los íconos de línea propios
// (mismos que la sección Oficios de la home) y las cantidades reales que
// le pasa la página desde Supabase.
export function CategoryGrid({
  categories,
  counts,
}: {
  categories: Category[];
  counts: Record<string, number>;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((c) => {
        const n = counts[c.slug] ?? 0;
        return (
          <Link
            key={c.slug}
            href={`/categoria/${c.slug}`}
            className="rounded-2xl border border-ink-100 bg-white p-5 text-center transition-colors duration-200 hover:border-sv-primary/40 hover:shadow-[0_18px_34px_-22px_rgba(29,46,32,0.3)]"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sv-mint p-3 text-sv-primary">
              <IconOficio slug={c.slug} />
            </div>
            <h4 className="font-display text-[14.5px] font-semibold text-sv-dark">{c.name}</h4>
            <p className="mt-1 text-[12.5px] text-ink-500">
              {n === 0 ? "Sumando técnicos" : `${n} ${n === 1 ? "técnico" : "técnicos"}`}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
