// Paleta de colores de avatar (inspirada en el mockup de Claude Design) para
// que las tarjetas de técnicos no se vean todas con el mismo degradado verde.
// Se elige de forma determinística según el user_id, así el color de cada
// técnico es siempre el mismo (no cambia en cada render/recarga).
const PALETTE = [
  "#2e9e5b", // verde
  "#3a7bd5", // azul
  "#e8833a", // naranja
  "#8a5cd6", // violeta
  "#d64f7a", // rosa
  "#1f9c99", // turquesa
  "#c8842b", // ámbar
  "#5a6fd6", // índigo
];

export function avatarColorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}
