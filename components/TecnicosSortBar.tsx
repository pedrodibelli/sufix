import Link from "next/link";

function buildQuery(p: { tecQ?: string; tecZona?: string; tecCat?: string; tecSort?: string }) {
  const sp = new URLSearchParams();
  if (p.tecQ) sp.set("tecQ", p.tecQ);
  if (p.tecZona) sp.set("tecZona", p.tecZona);
  if (p.tecCat) sp.set("tecCat", p.tecCat);
  if (p.tecSort && p.tecSort !== "recomendados") sp.set("tecSort", p.tecSort);
  const s = sp.toString();
  return `/${s ? `?${s}` : ""}#tecnicos`;
}

const OPCIONES = [
  { value: "recomendados", label: "Recomendados" },
  { value: "rating", label: "Mejor calificados" },
  { value: "nuevos", label: "Más nuevos" },
];

export function TecnicosSortBar({
  total,
  tecQ,
  tecZona,
  tecCat,
  tecSort,
}: {
  total: number;
  tecQ: string;
  tecZona: string;
  tecCat: string;
  tecSort: string;
}) {
  const sortActivo = tecSort || "recomendados";
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-ink-400">
        {total} {total === 1 ? "técnico encontrado" : "técnicos encontrados"}
      </p>
      <div className="flex items-center gap-1 text-sm">
        {OPCIONES.map((o) => (
          <Link
            key={o.value}
            href={buildQuery({ tecQ, tecZona, tecCat, tecSort: o.value })}
            className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
              sortActivo === o.value ? "bg-zap-100 text-sv-dark" : "text-ink-400 hover:text-sv-dark"
            }`}
          >
            {o.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
