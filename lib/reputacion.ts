// Calificación "efectiva" de un técnico: si tiene reputación de Google
// Maps cargada (ver migración 20260903), esa es la que se muestra y la que
// cuenta para ordenar/filtrar — es reputación real y verificable, tiene
// más peso que arrancar de cero en Sufix. Si no, se usa el resumen nativo
// de reseñas de Sufix (resenas_resumen). Un solo lugar para esta regla,
// para no repetirla en la tarjeta, la home y /categoria/[slug].
export type ConGoogle = {
  google_rating?: number | null;
  google_reviews_count?: number | null;
};

export type Resumen = { promedio: number; total: number };

export function calificacionEfectiva(
  tecnico: ConGoogle,
  resumen?: Resumen
): { promedio: number; total: number; esGoogle: boolean } {
  if (tecnico.google_rating != null && tecnico.google_reviews_count != null) {
    return { promedio: tecnico.google_rating, total: tecnico.google_reviews_count, esGoogle: true };
  }
  if (resumen && resumen.total > 0) {
    return { promedio: resumen.promedio, total: resumen.total, esGoogle: false };
  }
  return { promedio: -1, total: 0, esGoogle: false };
}
