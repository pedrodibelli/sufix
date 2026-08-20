import { TecnicoCard, type TecnicoPublico } from "@/components/TecnicoCard";

type Resumen = { promedio: number; total: number };

export function TecnicosGrid({
  tecnicos,
  resumenMap,
}: {
  tecnicos: TecnicoPublico[];
  resumenMap: Record<string, Resumen>;
}) {
  if (tecnicos.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="text-2xl">🔧</div>
        <h3 className="display mt-2 text-xl text-sv-dark">Todavía no hay técnicos cargados</h3>
        <p className="mt-2 text-sm text-ink-400">
          Estamos sumando profesionales verificados a tu zona. Volvé pronto.
        </p>
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
