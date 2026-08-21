import Link from "next/link";
import { TecnicoCard, type TecnicoPublico } from "@/components/TecnicoCard";

type Resumen = { promedio: number; total: number };

export function TecnicosGrid({
  tecnicos,
  resumenMap,
  hayFiltrosActivos = false,
}: {
  tecnicos: TecnicoPublico[];
  resumenMap: Record<string, Resumen>;
  hayFiltrosActivos?: boolean;
}) {
  if (tecnicos.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="text-2xl">{hayFiltrosActivos ? "🔍" : "🔧"}</div>
        <h3 className="display mt-2 text-xl text-sv-dark">
          {hayFiltrosActivos ? "Sin resultados para esa búsqueda" : "Todavía no hay técnicos cargados"}
        </h3>
        <p className="mt-2 text-sm text-ink-400">
          {hayFiltrosActivos
            ? "Probá con otro rubro, otra zona o sin texto de búsqueda."
            : "Estamos sumando profesionales verificados a tu zona. Volvé pronto."}
        </p>
        {hayFiltrosActivos && (
          <Link href="/#tecnicos" className="mt-4 inline-block text-sm font-medium text-sv-primary underline underline-offset-4">
            Limpiar filtros
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tecnicos.map((t) => (
        <TecnicoCard key={t.user_id} tecnico={t} resumen={resumenMap[t.user_id]} />
      ))}
    </div>
  );
}
