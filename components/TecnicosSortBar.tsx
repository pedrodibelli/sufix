import Link from "next/link";

function buildQuery(p: { tecQ?: string; tecZona?: string; tecSort?: string }) {
  const sp = new URLSearchParams();
  if (p.tecQ) sp.set("tecQ", p.tecQ);
  if (p.tecZona) sp.set("tecZona", p.tecZona);
  if (p.tecSort && p.tecSort !== "recomendados") sp.set("tecSort", p.tecSort);
  const s = sp.toString();
  return `/${s ? `?${s}` : ""}#tecnicos`;
}

const OPCIONES = [
  { value: "recomendados", label: "Recomendados" },
  { value: "resenas", label: "Más reseñas" },
];

// Fila entre el subtítulo y la grilla: cantidad de resultados a la
// izquierda, orden a la derecha. Reemplaza al viejo TecnicosSortBar (tema
// oscuro, con "Mejor calificados"/"Más nuevos" — ver git history), que
// había quedado sin usar desde que el orden pasó a ser fijo. Vuelve a ser
// elegible entre las dos opciones que pidió el usuario (2026-08-29).
export function TecnicosSortBar({
  total,
  tecQ,
  tecZona,
  tecSort,
}: {
  total: number;
  tecQ: string;
  tecZona: string;
  tecSort: string;
}) {
  const sortActivo = tecSort || "recomendados";
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-medium text-ink-500">
        {total} {total === 1 ? "profesional encontrado" : "profesionales encontrados"}
      </p>
      <div className="flex items-center gap-1 rounded-full border border-ink-200 bg-white p-1 text-sm">
        {OPCIONES.map((o) => (
          <Link
            key={o.value}
            href={buildQuery({ tecQ, tecZona, tecSort: o.value })}
            className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
              sortActivo === o.value ? "bg-sv-primary text-white" : "text-ink-500 hover:text-sv-dark"
            }`}
          >
            {o.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
