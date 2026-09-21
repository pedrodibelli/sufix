"use client";

import { useMemo } from "react";
import { TecnicosSortBar } from "@/components/TecnicosSortBar";
import { TecnicosFiltroBar } from "@/components/TecnicosFiltroBar";
import { TecnicosGrid } from "@/components/TecnicosGrid";
import { type TecnicoPublico } from "@/components/TecnicoCard";
import { FILTRO_VACIO, filtrarTecnicos } from "@/lib/filtros";
import { ID_LISTADO, useDirectorio } from "@/components/DirectorioContext";
import { calificacionEfectiva, promedioGeneral, puntajeRecomendado } from "@/lib/reputacion";

type Resumen = { promedio: number; total: number };

// Junta filtro, orden y grilla para que todo viva en el navegador.
//
// El orden se movió acá en 2026-09-04 (antes cada cambio era un <Link> con
// ?tecSort=, o sea recarga y salto de scroll). El FILTRO se movió acá en
// 2026-09-20 por lo mismo y por el rediseño mobile: filtrar tiene que ser
// instantáneo y sin perder la posición, porque en el celular es la acción
// principal del directorio, no algo que se hace una vez al principio.
//
// Desde 2026-09-21 el estado no vive en este componente sino en
// DirectorioContext, un escalón más arriba: el buscador del hero es el otro
// control del mismo filtro y está en otra sección de la página. Ver el
// comentario largo de DirectorioContext.tsx.
//
// El servidor manda la lista COMPLETA (sin filtrar) más el filtro que venía
// en la URL, y renderiza el HTML aplicando ese mismo filtro con la misma
// función (lib/filtros.ts). Como el primer render del cliente arranca del
// mismo estado, el resultado coincide y no hay parpadeo ni error de
// hidratación. Tener los 620 en memoria es lo que permite que cambiar de
// oficio sea instantáneo, sin ida y vuelta al servidor.
export function TecnicosDirectorio({
  tecnicos,
  resumenMap,
}: {
  tecnicos: TecnicoPublico[];
  resumenMap: Record<string, Resumen>;
}) {
  const { filtro, orden, aplicarFiltro, cambiarOrden } = useDirectorio();

  const filtrados = useMemo(() => filtrarTecnicos(tecnicos, filtro), [tecnicos, filtro]);

  const ordenados = useMemo(() => {
    const global = promedioGeneral(
      filtrados.map((t) => calificacionEfectiva(t, resumenMap[t.user_id]))
    );
    return [...filtrados].sort((a, b) => {
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
  }, [filtrados, resumenMap, orden]);

  return (
    <>
      {/* scroll-mt: el ancla tiene que quedar por debajo del header sticky
          (56px) y de la propia barra de filtro (~52px), si no el salto al
          listado deja las primeras tarjetas tapadas. */}
      <div id={ID_LISTADO} className="scroll-mt-[116px] lg:scroll-mt-20" />

      {/* Acá había una fila de chips de oficio que se deslizaba en horizontal
          (`OficiosChips`, 2026-09-20). Se sacó al día siguiente: no se
          entendía que se podía deslizar — sólo se notaba porque el último
          chip quedaba cortado al medio — y hacía exactamente lo mismo que la
          pastilla "Oficio" de acá abajo. Dos controles para lo mismo, y el
          menos claro primero. El componente se borró; está en el historial de
          git si alguna vez se quiere volver con otra presentación. */}
      <TecnicosFiltroBar filtro={filtro} onFiltroChange={aplicarFiltro} total={ordenados.length} />

      <TecnicosSortBar total={ordenados.length} orden={orden} onOrdenChange={cambiarOrden} />

      {/* key: al cambiar el filtro la grilla se reinicia a la primera tanda.
          Sin esto, alguien que tocó "Ver más" hasta 60 y después filtra por
          un oficio con 8 técnicos se queda con el "mostrando 60" viejo. */}
      <TecnicosGrid
        key={`${filtro.q}|${filtro.zona}`}
        tecnicos={ordenados}
        resumenMap={resumenMap}
        hayFiltrosActivos={!!(filtro.q || filtro.zona)}
        onLimpiarFiltros={() => aplicarFiltro(FILTRO_VACIO)}
      />
    </>
  );
}
