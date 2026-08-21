import { ZONES } from "@/lib/data";
import { IconSearch, IconMapPin } from "@/components/icons";

// Buscador del directorio: texto libre + zona, en un form GET plano (sin JS,
// funciona server-rendered). Preserva rubro/orden activos vía inputs ocultos
// para no perderlos al buscar. Inspirado en el buscador de solvitapp.com.ar.
export function TecnicosSearchBar({
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
    <form action="/#tecnicos" className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      {tecCat && <input type="hidden" name="tecCat" value={tecCat} />}
      {tecSort && tecSort !== "recomendados" && <input type="hidden" name="tecSort" value={tecSort} />}

      <div className="relative flex-1">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
        <input
          type="text"
          name="tecQ"
          defaultValue={tecQ}
          placeholder="Buscar por nombre u oficio…"
          className="field w-full pl-10"
        />
      </div>

      <div className="relative sm:w-56">
        <IconMapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
        <select name="tecZona" defaultValue={tecZona} className="field w-full appearance-none pl-10">
          <option value="">Todas las zonas</option>
          {ZONES.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn-primary shrink-0 sm:px-8">
        Buscar
      </button>
    </form>
  );
}
