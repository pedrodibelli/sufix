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

// Íconos de oficio para la sección "Oficios" de la home (rediseño
// 2026-08-31, pedido puntual del usuario para reemplazar los emojis por
// algo propio y consistente — set hecho con Claude Design: grilla 24×24,
// trazo 1.75 redondeado, un solo color vía currentColor). Los emojis de
// rubro en el resto de la app (chips de técnico, etc.) NO se tocan, siguen
// siendo datos con significado propio — ver comentario arriba del archivo.
// "Gas matriculado" y "Carpintería" del set original quedaron rehechas acá
// (rellenas/inconsistentes con el resto, no legibles a tamaño chico); el
// resto de los 8 se usan tal cual los bajó el usuario.
const OFICIO_PATHS: Record<string, string> = {
  plomeria: "M7 3.4v7.6a6 6 0 0 0 6 6h7.6 M11 3.4v7.6a2 2 0 0 0 2 2h7.6 M5.2 3.4h7.6 M20.6 11.2v7.6",
  electricidad: "M13.5 2.5 6 13h5l-1 8.5L18 10h-5.2z",
  // Llama de línea simple — reemplaza la versión rellena original (rompía
  // el estilo "solo trazo" del resto del set).
  gas: "M12 2.8c.6 3-1.2 4.6-2.7 6.2-1.7 1.8-3.1 3.6-3.1 6 0 3.3 2.6 5.9 5.8 5.9s5.8-2.6 5.8-5.9c0-2-1.1-3.5-2.1-4.9-.9 1-1.6 1.6-2.5 2.1.6-2.4 1-4.9-1.2-9.4Z",
  aire: "M6.6 7h10.8 M5 14c1.4 0 2 1.2 3.5 1.2S12 14 13.5 14s2 1.2 3.5 1.2S20 14 20 14 M5 18.6c1.4 0 2 1.2 3.5 1.2s2.1-1.2 3.5-1.2 2 1.2 3.5 1.2 2-1.2 2-1.2",
  pintura: "M16 6.2h3.5a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H13a1.2 1.2 0 0 0-1.2 1.2v1.3",
  // Clavo con cabeza redonda ancha + hombros + vástago afinado a punta —
  // pedido puntual del usuario con referencia visual (2026-08-31), el
  // primer intento (cabeza plana + vástago recto) se leía como una "T"
  // en vez de un clavo.
  carpinteria: "M7 6c0-2 2.2-3.5 5-3.5s5 1.5 5 3.5 M7 6 10 8 M17 6 14 8 M10 8 10.3 16 M14 8 13.7 16 M10.3 16 12 20.5 M13.7 16 12 20.5",
  albanileria: "M2.8 9.7h18.4M2.8 14.3h18.4 M9 5v4.7M15.5 5v4.7M6 9.7v4.6M12 9.7v4.6M18 9.7v4.6M9 14.3V19M15.5 14.3V19",
  electrodomesticos: "M4 8.2h16",
  vidrieria: "M7 17 17 7 M12.5 18.5 18.5 12.5",
  // Llave sin el "ojo de cerradura" interno (pedido puntual: sacarle el
  // círculo chico de adentro al círculo grande).
  cerrajeria: "M11.6 11.6l9 9 M15.6 15.6l2.4-2.4 M18.2 18.2l2.4-2.4",
};

// Formas que necesitan un elemento extra además del/los <path> de arriba
// (rectángulos, círculos) — mismo criterio 1.75/round que el resto.
export function IconOficio({ slug, className = "h-full w-full" }: IconProps & { slug: string }) {
  const d = OFICIO_PATHS[slug];
  if (!d) return null;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {slug === "aire" && <rect x="3.2" y="3.2" width="17.6" height="6.4" rx="2" />}
      {slug === "pintura" && <rect x="3" y="3.5" width="13" height="5.5" rx="1.6" />}
      {slug === "pintura" && <rect x="10.3" y="14.5" width="3.4" height="6.5" rx="1.7" />}
      {slug === "albanileria" && <rect x="2.8" y="5" width="18.4" height="14" rx="1.8" />}
      {slug === "electrodomesticos" && <rect x="4" y="3" width="16" height="18" rx="2.6" />}
      {slug === "electrodomesticos" && <circle cx="12" cy="14.6" r="4" />}
      {slug === "electrodomesticos" && <circle cx="16.6" cy="5.6" r=".95" fill="currentColor" stroke="none" />}
      {slug === "vidrieria" && <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="2.4" />}
      {slug === "cerrajeria" && <circle cx="8.2" cy="8.2" r="4.8" />}
      <path d={d} />
    </svg>
  );
}

// Íconos de los pasos en /como-funciona (2026-08-31) — mismo criterio que
// IconOficio (línea 24×24, trazo 1.75 redondeado), reemplazan los emojis
// (🔍💬🤝📋👀) que tenía cada tarjeta de paso.
const PASO_PATHS: Record<string, string> = {
  explorar: "M14.5 14.5 20 20", // + círculo (lupa)
  elegir: "M9 16 8 20l4-4", // + rect redondeado (globo de chat)
  coordinar: "M4 10h16 M8 3v4M16 3v4 M9 14.5l2 2 4-4", // + rect (calendario con check)
  registro: "M5.5 17c.5-2.3 2-3.5 3.5-3.5s3 1.2 3.5 3.5 M14.5 10h4M14.5 13h4", // + rect + círculo (perfil)
  aparecer: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z", // + círculo (ojo)
};

export function IconPaso({ slug, className = "h-full w-full" }: IconProps & { slug: string }) {
  if (slug === "whatsapp") return <IconWhatsApp className={className} />;
  const d = PASO_PATHS[slug];
  if (!d) return null;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {slug === "explorar" && <circle cx="10" cy="10" r="6" />}
      {slug === "elegir" && <rect x="4" y="5" width="16" height="11" rx="2.5" />}
      {slug === "coordinar" && <rect x="4" y="5" width="16" height="15" rx="2" />}
      {slug === "registro" && <rect x="3" y="5" width="18" height="14" rx="2" />}
      {slug === "registro" && <circle cx="9" cy="11" r="2.2" />}
      {slug === "aparecer" && <circle cx="12" cy="12" r="3" />}
      <path d={d} />
    </svg>
  );
}

// Check de línea simple (tarjetas de precios) y chevron (acordeón de FAQ) —
// reemplazan el "✓"/"▾" de texto plano en /como-funciona.
export function IconCheck({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function IconChevronDown({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// Íconos de la sección "Seguridad" de la home (2026-09-03) — mismo criterio
// que IconOficio/IconPaso, reemplazan los emojis (🔍⭐📱🚩) de las 4 tarjetas.
const SEGURIDAD_PATHS: Record<string, string> = {
  revision: "M14.5 14.5 20 20", // + círculo (lupa)
  reputacion: "M12 2.5l2.87 5.83 6.43.93-4.65 4.54 1.1 6.4L12 17.2l-5.75 3 1.1-6.4-4.65-4.54 6.43-.93z", // estrella
  contacto: "M11 18.3h2", // + rect redondeado (celular)
  reportar: "M6 21V4 M6 4.5h10.5l-2.7 3.5 2.7 3.5H6", // bandera
};

export function IconSeguridad({ slug, className = "h-full w-full" }: IconProps & { slug: string }) {
  const d = SEGURIDAD_PATHS[slug];
  if (!d) return null;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {slug === "revision" && <circle cx="10" cy="10" r="6" />}
      {slug === "contacto" && <rect x="7" y="2.5" width="10" height="19" rx="2.2" />}
      <path d={d} />
    </svg>
  );
}

// Estrella sola (mismo trazo que la de IconSeguridad "reputacion") — se
// reusa en la versión corta de "Cómo funciona" de la home, junto con
// IconPaso "explorar"/"elegir" (2026-09-03, mismo pedido: sacar emojis).
export function IconStar({ className = "h-full w-full" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 2.5l2.87 5.83 6.43.93-4.65 4.54 1.1 6.4L12 17.2l-5.75 3 1.1-6.4-4.65-4.54 6.43-.93z" />
    </svg>
  );
}

// Bandera (sección "Reportar un problema", 2026-09-03) — mismo trazo que
// la de IconSeguridad "reportar", exportada aparte para poder usarla en el
// menú y en el encabezado de /reportar.
export function IconBandera({ className = "h-full w-full" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6 21V4" />
      <path d="M6 4.5h10.5l-2.7 3.5 2.7 3.5H6" />
    </svg>
  );
}

// Instagram (footer) — glifo de línea, mismo criterio 24×24/trazo 1.75
// que el resto del set (2026-09-03).
export function IconInstagram({ className = "h-[18px] w-[18px]" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Dos personas — "elegís con quién hablar, sin intermediarios" en la
// sección "Todo por WhatsApp" de la home (2026-09-03, mismo pedido: sacar
// emojis). Junto con IconPaso "elegir" (chat) y "coordinar" (calendario)
// completa el trío de esa lista de beneficios.
export function IconPeople({ className = "h-full w-full" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="6" cy="7" r="2.6" />
      <path d="M2.5 18c.5-3 1.7-4.5 3.5-4.5s3 1.5 3.5 4.5" />
      <circle cx="18" cy="7" r="2.6" />
      <path d="M14.5 18c.5-3 1.7-4.5 3.5-4.5s3 1.5 3.5 4.5" />
    </svg>
  );
}
