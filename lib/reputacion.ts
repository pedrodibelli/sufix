// Calificación "efectiva" de un técnico: si tiene reputación externa
// cargada (Google Maps, PorAca, o cualquier otra fuente — ver migración
// 20260903b), esa es la que se muestra y la que cuenta para
// ordenar/filtrar — es reputación real y verificable, tiene más peso que
// arrancar de cero en Sufix. Si no, se usa el resumen nativo de reseñas de
// Sufix (resenas_resumen). Un solo lugar para esta regla, para no
// repetirla en la tarjeta, la home y /categoria/[slug].
export type ConReputacionExterna = {
  reputacion_fuente?: string | null;
  reputacion_rating?: number | null;
  reputacion_total?: number | null;
};

export type Resumen = { promedio: number; total: number };

export function calificacionEfectiva(
  tecnico: ConReputacionExterna,
  resumen?: Resumen
): { promedio: number; total: number; fuenteExterna: string | null } {
  if (tecnico.reputacion_fuente && tecnico.reputacion_rating != null && tecnico.reputacion_total != null) {
    return { promedio: tecnico.reputacion_rating, total: tecnico.reputacion_total, fuenteExterna: tecnico.reputacion_fuente };
  }
  if (resumen && resumen.total > 0) {
    return { promedio: resumen.promedio, total: resumen.total, fuenteExterna: null };
  }
  return { promedio: -1, total: 0, fuenteExterna: null };
}
