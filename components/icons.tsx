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

export function IconCheckBadge({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 1.5l1.98 1.14 2.28-.3 1.14 1.98 1.98 1.14-.3 2.28 1.14 1.98-1.98 1.14-.3 2.28-2.28-.3L10 14.32l-1.98 1.14-2.28-.3-1.14-1.98-1.98-1.14.3-2.28-1.14-1.98 1.98-1.14.3-2.28 2.28.3L10 1.5z"
      />
      <path d="M7.3 10.2l1.7 1.7 3.3-3.7" stroke="white" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
