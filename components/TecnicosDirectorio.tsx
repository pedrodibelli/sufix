"use client";

import { useMemo, useRef, useState } from "react";
import { TecnicosSortBar, type OrdenTecnicos } from "@/components/TecnicosSortBar";
import { TecnicosFiltroBar } from "@/components/TecnicosFiltroBar";
import { TecnicosGrid } from "@/components/TecnicosGrid";
import { type TecnicoPublico } from "@/components/TecnicoCard";
import { filtrarTecnicos, FILTRO_VACIO, type FiltroTecnicos } from "@/lib/filtros";
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
// El servidor manda la lista COMPLETA (sin filtrar) más el filtro que venía
// en la URL, y renderiza el HTML aplicando ese mismo filtro con la misma
// función (lib/filtros.ts). Como el primer render del cliente arranca del
// mismo estado, el resultado coincide y no hay parpadeo ni error de
// hidratación. Tener los 620 en memoria es lo que permite que cambiar de
// oficio sea instantáneo, sin ida y vuelta al servidor.
export function TecnicosDirectorio({
  tecnicos,
  resumenMap,
  filtroInicial = FILTRO_VACIO,
  ordenInicial = "recomendados",
}: {
  tecnicos: TecnicoPublico[];
  resumenMap: Record<string, Resumen>;
  filtroInicial?: FiltroTecnicos;
  ordenInicial?: OrdenTecnicos;
}) {
  const [orden, setOrden] = useState<OrdenTecnicos>(ordenInicial);
  const [filtro, setFiltro] = useState<FiltroTecnicos>(filtroInicial);
  const tope = useRef<HTMLDivElement>(null);

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

  // La URL se mantiene al día para que el link siga siendo compartible, pero
  // con replaceState en vez de router.push: cambia la barra de direcciones
  // sin pedirle nada al servidor ni tocar el historial.
  function sincronizarUrl(f: FiltroTecnicos, o: OrdenTecnicos) {
    const url = new URL(window.location.href);
    for (const [clave, valor] of [["tecQ", f.q], ["tecZona", f.zona], ["tecSort", o === "recomendados" ? "" : o]] as const) {
      if (valor) url.searchParams.set(clave, valor);
      else url.searchParams.delete(clave);
    }
    window.history.replaceState(null, "", url.toString());
  }

  function cambiarOrden(nuevo: OrdenTecnicos) {
    setOrden(nuevo);
    sincronizarUrl(filtro, nuevo);
  }

  function cambiarFiltro(nuevo: FiltroTecnicos) {
    setFiltro(nuevo);
    sincronizarUrl(nuevo, orden);

    // Sin esto, filtrar desde el medio de la lista te deja flotando: estabas
    // en la tarjeta 40 y el resultado nuevo tiene 6 — quedabas mirando el
    // final de la página, o directamente la sección de abajo, creyendo que
    // no hubo resultados. Solo sube si ya estabas más abajo del listado;
    // si estabas arriba no se mueve nada.
    requestAnimationFrame(() => {
      const y = tope.current?.getBoundingClientRect().top ?? 0;
      if (y < 0) tope.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }

  return (
    <>
      {/* scroll-mt: el ancla de arriba tiene que quedar por debajo del header
          sticky (56px) y de la propia barra de filtro (~52px), si no el
          scrollIntoView deja las primeras tarjetas tapadas. */}
      <div ref={tope} className="scroll-mt-[116px] lg:scroll-mt-20" />

      {/* Acá había una fila de chips de oficio que se deslizaba en horizontal
          (`OficiosChips`, 2026-09-20). Se sacó al día siguiente: no se
          entendía que se podía deslizar — sólo se notaba porque el último
          chip quedaba cortado al medio — y hacía exactamente lo mismo que la
          pastilla "Oficio" de acá abajo. Dos controles para lo mismo, y el
          menos claro primero. El componente se borró; está en el historial de
          git si alguna vez se quiere volver con otra presentación. */}
      <TecnicosFiltroBar filtro={filtro} onFiltroChange={cambiarFiltro} total={ordenados.length} />

      <TecnicosSortBar total={ordenados.length} orden={orden} onOrdenChange={cambiarOrden} />

      {/* key: al cambiar el filtro la grilla se reinicia a la primera tanda.
          Sin esto, alguien que tocó "Ver más" hasta 60 y después filtra por
          un oficio con 8 técnicos se queda con el "mostrando 60" viejo. */}
      <TecnicosGrid
        key={`${filtro.q}|${filtro.zona}`}
        tecnicos={ordenados}
        resumenMap={resumenMap}
        hayFiltrosActivos={!!(filtro.q || filtro.zona)}
        onLimpiarFiltros={() => cambiarFiltro(FILTRO_VACIO)}
      />
    </>
  );
}
