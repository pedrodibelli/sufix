import { CATEGORIES, ZONAS_CABA } from "@/lib/data";
import type { TecnicoPublico } from "@/components/TecnicoCard";

export type FiltroTecnicos = {
  // Texto libre: matchea nombre, titular y el NOMBRE del rubro (no el slug),
  // así "plomero" encuentra a quien tiene el rubro `plomeria`.
  q: string;
  // Barrio exacto, o "CABA" como atajo de los 9 barrios de Capital.
  zona: string;
};

export const FILTRO_VACIO: FiltroTecnicos = { q: "", zona: "" };

// Una sola implementación del filtro, usada por el servidor (app/page.tsx,
// /categoria/[slug]) y por el cliente (TecnicosDirectorio).
//
// Que sea LA MISMA función es lo que permite filtrar en el navegador sin
// parpadeo: el servidor renderiza el HTML ya filtrado con el estado que viene
// de la URL, y el primer render del cliente arranca de ese mismo estado. Si
// cada lado tuviera su propia copia del criterio, cualquier diferencia se
// vería como un error de hidratación.
export function filtrarTecnicos(
  tecnicos: TecnicoPublico[],
  filtro: FiltroTecnicos
): TecnicoPublico[] {
  const q = filtro.q.toLowerCase().trim();
  const zona = filtro.zona;

  return tecnicos.filter((t) => {
    // "CABA" no es un barrio real, es el atajo que ofrecen los selectores
    // de zona: matchea si el técnico cubre cualquiera de los 9 barrios de
    // Capital, no un string literal "CABA".
    if (zona === "CABA") {
      if (!(t.zona ?? []).some((z) => ZONAS_CABA.includes(z))) return false;
    } else if (zona && !(t.zona ?? []).includes(zona)) return false;

    if (q) {
      const rubrosNombres = (t.rubro ?? []).map(
        (slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug
      );
      const hay = `${t.nombre ?? ""} ${t.titular ?? ""} ${rubrosNombres.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });
}
