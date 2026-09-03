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

// ── Orden "Recomendados" ────────────────────────────────────────────────
//
// Antes ordenaba por promedio pelado, y eso hacía que un 5.00 con UNA sola
// reseña le ganara a un 4.90 con 570: la nota más alta no es la mejor si no
// hay con qué respaldarla.
//
// Se usa un promedio ponderado por confianza (el mismo truco que IMDb):
// la nota del técnico se mezcla con el promedio general del directorio, y
// cuanto más reseñas tiene, más pesa la suya y menos la del promedio.
//
//   puntaje = (v · R + m · C) / (v + m)
//     R = promedio del técnico     v = cantidad de reseñas
//     C = promedio general          m = reseñas para "confiar" en R
//
// Con m = 5 y C ≈ 4.5: un 5.00 con 1 reseña da 4.58; un 4.90 con 570 da
// 4.90. El de 570 queda arriba, y el nuevo no queda castigado — queda en el
// medio, que es donde corresponde mientras no sepamos.
//
// Ojo con el caso inverso: un 3.50 con 50 reseñas da 3.59 y queda ABAJO del
// 5.00 con 1. Es a propósito — de ese sabemos con bastante certeza que es
// mediocre, del otro no sabemos nada. Con 4.60 y 50 reseñas daría 4.59 y sí
// le ganaría al 5.00 con una sola.
const RESENAS_PARA_CONFIAR = 5;

// Promedio general del directorio, contando solo a quienes tienen reseñas.
// Si todavía no hay ninguna (o hay muy pocas), se cae a 4.5 — un valor
// neutro, ni premio ni castigo, para no amplificar el ruido de dos o tres.
export function promedioGeneral(calificaciones: { promedio: number; total: number }[]): number {
  const conResenas = calificaciones.filter((c) => c.promedio >= 0 && c.total > 0);
  if (conResenas.length < 3) return 4.5;
  return conResenas.reduce((s, c) => s + c.promedio, 0) / conResenas.length;
}

// Devuelve -1 para quien no tiene ninguna reseña, igual que
// calificacionEfectiva, así siguen ordenándose al final como hasta ahora.
export function puntajeRecomendado(
  promedio: number,
  total: number,
  global: number,
  m: number = RESENAS_PARA_CONFIAR
): number {
  if (promedio < 0 || total <= 0) return -1;
  return (total * promedio + m * global) / (total + m);
}
