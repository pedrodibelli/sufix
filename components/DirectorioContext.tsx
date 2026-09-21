"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { FILTRO_VACIO, type FiltroTecnicos } from "@/lib/filtros";
import type { OrdenTecnicos } from "@/components/TecnicosSortBar";

// Estado compartido del directorio de la home: el filtro (oficio + zona) y el
// orden. Vive acá arriba, y no dentro de TecnicosDirectorio, porque hay DOS
// controles que lo manejan y están en secciones distintas de la página:
// el buscador del hero (HeroSearchCard, solo desktop) y la barra sticky
// (TecnicosFiltroBar, solo mobile).
//
// Por qué se creó (2026-09-21, arreglo del buscador del hero):
// cuando el filtro se movió al navegador (rediseño mobile del 2026-09-20), el
// botón "Buscar técnicos" del hero quedó como estaba: hacía router.push a
// "/?tecQ=…". Eso funcionaba cuando el servidor filtraba, pero al pasar el
// filtro a useState dejó de funcionar — navegar a la misma ruta con otro
// querystring re-renderiza el componente de servidor, y React, al reconciliar,
// CONSERVA el estado del componente cliente que ya estaba montado. O sea:
// la URL cambiaba, el listado no. Medido en producción: 620 técnicos antes de
// buscar, 620 después. (Entrar directo a esa URL sí filtraba, porque ahí el
// servidor renderiza de cero — por eso el bug pasó desapercibido.)
//
// Con el estado compartido el hero ya no navega: escribe el mismo estado que
// lee la grilla, así que filtra al instante, sin ida y vuelta al servidor y
// sin perder el scroll — igual que las pastillas de mobile.

// El ancla a la que se salta al filtrar. Es un div vacío justo arriba de la
// barra de filtro, con scroll-margin para no quedar tapado por el header.
export const ID_LISTADO = "tecnicos-listado";

type Directorio = {
  filtro: FiltroTecnicos;
  orden: OrdenTecnicos;
  /**
   * `irAlListado` fuerza el salto a las tarjetas aunque ya estuvieras arriba
   * de ellas. Lo usa el buscador del hero, que está lejos del listado: sin
   * eso, apretar "Buscar técnicos" filtraba sin que se viera nada moverse.
   * Los controles que ya están pegados al listado (las pastillas de mobile)
   * no lo pasan: ahí sólo hace falta corregir la posición si quedaste debajo.
   */
  aplicarFiltro: (f: FiltroTecnicos, opciones?: { irAlListado?: boolean }) => void;
  cambiarOrden: (o: OrdenTecnicos) => void;
};

const DirectorioCtx = createContext<Directorio | null>(null);

export function useDirectorio(): Directorio {
  const ctx = useContext(DirectorioCtx);
  if (!ctx) throw new Error("useDirectorio() necesita un <DirectorioProvider> más arriba");
  return ctx;
}

// La URL se mantiene al día para que el link siga siendo compartible, pero con
// replaceState en vez de router.push: cambia la barra de direcciones sin
// pedirle nada al servidor ni ensuciar el historial con un paso por filtro.
function sincronizarUrl(f: FiltroTecnicos, o: OrdenTecnicos) {
  const url = new URL(window.location.href);
  for (const [clave, valor] of [
    ["tecQ", f.q],
    ["tecZona", f.zona],
    ["tecSort", o === "recomendados" ? "" : o],
  ] as const) {
    if (valor) url.searchParams.set(clave, valor);
    else url.searchParams.delete(clave);
  }
  window.history.replaceState(null, "", url.toString());
}

function irAlListado(siempre: boolean) {
  // requestAnimationFrame: primero que React pinte la lista nueva, después
  // medimos dónde quedó el listado.
  requestAnimationFrame(() => {
    const el = document.getElementById(ID_LISTADO);
    if (!el) return;
    // Sin esto, filtrar desde el medio de la lista te deja flotando: estabas
    // en la tarjeta 40 y el resultado nuevo tiene 6 — quedabas mirando el pie
    // de página, creyendo que no hubo resultados.
    if (!siempre && el.getBoundingClientRect().top >= 0) return;
    el.scrollIntoView({ block: "start", behavior: "smooth" });
  });
}

export function DirectorioProvider({
  filtroInicial = FILTRO_VACIO,
  ordenInicial = "recomendados",
  children,
}: {
  filtroInicial?: FiltroTecnicos;
  ordenInicial?: OrdenTecnicos;
  children: ReactNode;
}) {
  const [filtro, setFiltro] = useState<FiltroTecnicos>(filtroInicial);
  const [orden, setOrden] = useState<OrdenTecnicos>(ordenInicial);

  const valor = useMemo<Directorio>(
    () => ({
      filtro,
      orden,
      aplicarFiltro(nuevo, opciones) {
        setFiltro(nuevo);
        sincronizarUrl(nuevo, orden);
        irAlListado(opciones?.irAlListado === true);
      },
      cambiarOrden(nuevo) {
        setOrden(nuevo);
        sincronizarUrl(filtro, nuevo);
      },
    }),
    [filtro, orden]
  );

  return <DirectorioCtx.Provider value={valor}>{children}</DirectorioCtx.Provider>;
}
