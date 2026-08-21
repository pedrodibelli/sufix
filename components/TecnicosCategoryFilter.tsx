import Link from "next/link";
import { CATEGORIES } from "@/lib/data";

function buildQuery(p: { tecQ?: string; tecZona?: string; tecCat?: string; tecSort?: string }) {
  const sp = new URLSearchParams();
  if (p.tecQ) sp.set("tecQ", p.tecQ);
  if (p.tecZona) sp.set("tecZona", p.tecZona);
  if (p.tecCat) sp.set("tecCat", p.tecCat);
  if (p.tecSort && p.tecSort !== "recomendados") sp.set("tecSort", p.tecSort);
  const s = sp.toString();
  return `/${s ? `?${s}` : ""}#tecnicos`;
}

// Chips de rubro con ícono para filtrar el directorio con un toque — mismo
// espíritu que la grilla de "Servicios Populares" de solvitapp.com.ar, pero
// como acceso directo de filtro en vez de una sección aparte.
export function TecnicosCategoryFilter({
  tecQ,
  tecZona,
  tecCat,
  tecSort,
}: {
  tecQ: string;
  tecZona: string;
  tecCat: string;
  tecSort: string;
}) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar">
      <Link
        href={buildQuery({ tecQ, tecZona, tecSort })}
        className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
          !tecCat ? "border-sv-dark bg-sv-dark text-white" : "border-ink-200 text-ink-600 hover:bg-zap-50"
        }`}
      >
        Todos
      </Link>
      {CATEGORIES.map((c) => (
        <Link
          key={c.slug}
          href={buildQuery({ tecQ, tecZona, tecSort, tecCat: tecCat === c.slug ? "" : c.slug })}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
            tecCat === c.slug ? "border-sv-dark bg-sv-dark text-white" : "border-ink-200 text-ink-600 hover:bg-zap-50"
          }`}
        >
          {c.icon} {c.name}
        </Link>
      ))}
    </div>
  );
}
