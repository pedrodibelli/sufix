"use client";

// Fila entre el subtítulo y la grilla: cantidad de resultados a la
// izquierda, orden a la derecha.
//
// Antes eran dos <Link> con ?tecSort=: cambiar de orden navegaba de verdad,
// o sea recarga del servidor y salto de scroll (volvías al ancla #tecnicos).
// Ahora son dos botones y el que ordena es TecnicosDirectorio en el
// navegador — el cambio es instantáneo y la página no se mueve.
//
// La pastilla verde es un solo elemento absoluto que se desliza entre las
// dos opciones. Por eso la grilla es de dos columnas IGUALES: con anchos
// distintos ("Recomendados" vs "Más reseñas") habría que medir con refs;
// así alcanza con un translateX del 100% de su propio ancho.

const OPCIONES = [
  { value: "recomendados", label: "Recomendados" },
  { value: "resenas", label: "Más reseñas" },
] as const;

export type OrdenTecnicos = (typeof OPCIONES)[number]["value"];

export function TecnicosSortBar({
  total,
  orden,
  onOrdenChange,
}: {
  total: number;
  orden: OrdenTecnicos;
  onOrdenChange: (o: OrdenTecnicos) => void;
}) {
  const indice = OPCIONES.findIndex((o) => o.value === orden);
  const activo = indice === -1 ? 0 : indice;

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm font-medium text-ink-500">
        {total} {total === 1 ? "profesional encontrado" : "profesionales encontrados"}
      </p>

      <div
        role="group"
        aria-label="Ordenar técnicos"
        className="relative grid grid-cols-2 rounded-full border border-ink-200 bg-white p-1 text-sm"
      >
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-sv-primary transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
          style={{ transform: `translateX(${activo * 100}%)` }}
        />
        {OPCIONES.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onOrdenChange(o.value)}
            aria-pressed={orden === o.value}
            className={`relative z-10 whitespace-nowrap rounded-full px-3.5 py-1.5 font-medium transition-colors ${
              orden === o.value ? "text-white" : "text-ink-500 hover:text-sv-dark"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
