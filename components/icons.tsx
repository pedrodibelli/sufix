// Set chico de íconos SVG (estilo outline, trazo fino) para reemplazar los
// emojis de interfaz (buscador, ubicación, verificado) por algo más prolijo
// y consistente entre sistemas operativos — un emoji se ve distinto en cada
// dispositivo, un SVG siempre igual. Los emojis de rubro (🔧 Plomería, etc.)
// se mantienen por ahora: son datos con significado propio, no decoración.
type IconProps = { className?: string };

export function IconSearch({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <circle cx="9" cy="9" r="6.25" />
      <path d="M17 17l-3.8-3.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconMapPin({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <path d="M10 18s6-5.05 6-9.5A6 6 0 104 8.5C4 12.95 10 18 10 18z" strokeLinejoin="round" />
      <circle cx="10" cy="8.5" r="2.1" />
    </svg>
  );
}

// Logo de WhatsApp (el glifo oficial, monocromo vía currentColor) — para el
// botón "Contactar por WhatsApp", en blanco sobre el verde de marca de WhatsApp.
export function IconWhatsApp({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.47 14.38c-.29-.15-1.73-.85-2-.95-.27-.1-.46-.15-.66.15-.2.29-.76.94-.93 1.14-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.49.1-.19.05-.36-.02-.51-.07-.15-.66-1.59-.9-2.18-.24-.57-.48-.5-.66-.5-.17-.01-.36-.01-.56-.01s-.51.07-.78.36c-.27.29-1.02 1-1.02 2.43s1.05 2.82 1.19 3.01c.15.19 2.06 3.14 5 4.4.7.3 1.24.48 1.67.62.7.22 1.34.19 1.84.12.56-.08 1.73-.71 1.97-1.39.24-.68.24-1.27.17-1.39-.07-.12-.26-.19-.55-.34z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.02 2C6.5 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l5.06-1.33A9.96 9.96 0 0012.02 22C17.5 22 22 17.52 22 12S17.5 2 12.02 2zm0 18.13c-1.66 0-3.2-.46-4.53-1.25l-.32-.19-3 .79.8-2.93-.21-.3A8.09 8.09 0 013.9 12c0-4.48 3.65-8.13 8.12-8.13S20.1 7.52 20.1 12s-3.6 8.13-8.08 8.13z"
      />
    </svg>
  );
}

// Estrellita de "nuevo" — para el badge "Nuevo en Sufix", sin usar el emoji ✨.
export function IconSparkle({ className = "h-3 w-3" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M10 2l1.4 4.6L16 8l-4.6 1.4L10 14l-1.4-4.6L4 8l4.6-1.4L10 2z" />
      <path d="M16.5 13l.6 2 2 .6-2 .6-.6 2-.6-2-2-.6 2-.6.6-2z" />
    </svg>
  );
}

// Sello tipo estampilla postal (28 dientes, generados por trigonometría —
// no a mano — para que salga perfectamente simétrico) para el sello "Nuevo"
// de TecnicoCard. El intento anterior (reusar la silueta festoneada de
// IconCheckBadge a este tamaño) se veía como una mancha irregular; esta
// forma está pensada para leerse bien de chica, como un sello de verdad.
const SELLO_PATH = "M 50 3 Q 50 3 52.24 6.63 Q 54.48 10.25 57.47 7.21 Q 60.46 4.18 61.84 8.21 Q 63.21 12.24 66.8 9.95 Q 70.39 7.65 70.84 11.89 Q 71.28 16.13 75.29 14.69 Q 79.3 13.25 78.79 17.48 Q 78.28 21.72 82.52 21.21 Q 86.75 20.7 85.31 24.71 Q 83.87 28.72 88.11 29.16 Q 92.35 29.61 90.06 33.2 Q 87.76 36.79 91.79 38.16 Q 95.82 39.54 92.78 42.53 Q 89.75 45.52 93.38 47.76 Q 97 50 93.38 52.24 Q 89.75 54.48 92.78 57.47 Q 95.82 60.46 91.79 61.84 Q 87.76 63.21 90.06 66.8 Q 92.35 70.39 88.11 70.84 Q 83.87 71.28 85.31 75.29 Q 86.75 79.3 82.52 78.79 Q 78.28 78.28 78.79 82.52 Q 79.3 86.75 75.29 85.31 Q 71.28 83.87 70.84 88.11 Q 70.39 92.35 66.8 90.06 Q 63.21 87.76 61.84 91.79 Q 60.46 95.82 57.47 92.78 Q 54.48 89.75 52.24 93.38 Q 50 97 47.76 93.38 Q 45.52 89.75 42.53 92.78 Q 39.54 95.82 38.16 91.79 Q 36.79 87.76 33.2 90.06 Q 29.61 92.35 29.16 88.11 Q 28.72 83.87 24.71 85.31 Q 20.7 86.75 21.21 82.52 Q 21.72 78.28 17.48 78.79 Q 13.25 79.3 14.69 75.29 Q 16.13 71.28 11.89 70.84 Q 7.65 70.39 9.95 66.8 Q 12.24 63.21 8.21 61.84 Q 4.18 60.46 7.21 57.47 Q 10.25 54.48 6.63 52.24 Q 3 50 6.63 47.76 Q 10.25 45.52 7.21 42.53 Q 4.18 39.54 8.21 38.16 Q 12.24 36.79 9.95 33.2 Q 7.65 29.61 11.89 29.16 Q 16.13 28.72 14.69 24.71 Q 13.25 20.7 17.48 21.21 Q 21.72 21.72 21.21 17.48 Q 20.7 13.25 24.71 14.69 Q 28.72 16.13 29.16 11.89 Q 29.61 7.65 33.2 9.95 Q 36.79 12.24 38.16 8.21 Q 39.54 4.18 42.53 7.21 Q 45.52 10.25 47.76 6.63 Z";

export function IconStampBadge({ className = "h-full w-full" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden>
      <path d={SELLO_PATH} />
    </svg>
  );
}

// Badge de "Verificado": mismo contorno de estampilla (simétrico de verdad,
// no la mancha irregular del viejo IconCheckBadge) con un check adentro.
export function IconVerifiedBadge({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden>
      <path d={SELLO_PATH} />
      <path d="M 36.5 51 L 45 59.5 L 61.5 41" stroke="white" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
