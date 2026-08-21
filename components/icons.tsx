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
