"use client";

import { useMemo, useState } from "react";
import { TecnicosSortBar, type OrdenTecnicos } from "@/components/TecnicosSortBar";
import { TecnicosGrid } from "@/components/TecnicosGrid";
import { type TecnicoPublico } from "@/components/TecnicoCard";
import { calificacionEfectiva, promedioGeneral, puntajeRecomendado } from "@/lib/reputacion";

type Resumen = { promedio: number; total: number };

// Junta la barra de orden con la grilla para que el orden viva en el
// navegador (2026-09-04). Antes cambiar de "Recomendados" a "Más reseñas"
// era un <Link> con ?tecSort=: navegación real, recarga del servidor y
// salto de scroll. Ahora se reordena en el cliente y no se mueve nada.
//
// El servidor sigue mandando la lista YA ordenada (por SEO y para que el
// primer render no dependa de JS); el useMemo de acá aplica exactamente el
// mismo criterio, así que al hidratar el orden coincide y no hay parpadeo.
export function TecnicosDirectorio({
  tecnicos,
  resumenMap,
  hayFiltrosActivos = false,
  ordenInicial = "recomendados",
}: {
  tecnicos: TecnicoPublico[];
  resumenMap: Record<string, Resumen>;
  hayFiltrosActivos?: boolean;
  ordenInicial?: OrdenTecnicos;
}) {
  const [orden, setOrden] = useState<OrdenTecnicos>(ordenInicial);

  const ordenados = useMemo(() => {
    const global = promedioGeneral(
      tecnicos.map((t) => calificacionEfectiva(t, resumenMap[t.user_id]))
    );
    return [...tecnicos].sort((a, b) => {
      const ca = calificacionEfectiva(a, resumenMap[a.user_id]);
      const cb = calificacionEfectiva(b, resumenMap[b.user_id]);
      if (orden === "resenas") {
        if (cb.total !== ca.total) return cb.total - ca.total;
      } else {
        const pa = puntajeRecomendado(ca.promedio, ca.total, global);
        const pb = puntajeRecomendado(cb.promedio, cb.total, global);
        if (pb !== pa) return pb - pa;
      }
      return new Date(b.creado_at ?? 0).getTime() - new Date(a.creado_at ?? 0).getTime();
    });
  }, [tecnicos, resumenMap, orden]);

  // La URL se mantiene al día para que el link siga siendo compartible, pero
  // con replaceState en vez de router.push: cambia la barra de direcciones
  // sin pedirle nada al servidor ni tocar el historial.
  function cambiarOrden(nuevo: OrdenTecnicos) {
    setOrden(nuevo);
    const url = new URL(window.location.href);
    if (nuevo === "recomendados") url.searchParams.delete("tecSort");
    else url.searchParams.set("tecSort", nuevo);
    window.history.replaceState(null, "", url.toString());
  }

  return (
    <>
      <TecnicosSortBar total={ordenados.length} orden={orden} onOrdenChange={cambiarOrden} />
      <TecnicosGrid
        tecnicos={ordenados}
        resumenMap={resumenMap}
        hayFiltrosActivos={hayFiltrosActivos}
      />
    </>
  );
}
