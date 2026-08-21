import Image from "next/image";

// Ratio de redondeo tipo "squircle" (cuadrado con esquinas curvas, no círculo
// perfecto) — inspirado en el mockup de Claude Design. Se calcula como % del
// tamaño en vez de una clase Tailwind fija (rounded-xl, etc.) para que se vea
// proporcional en cualquier size: 8px en un avatar de 28px, 24px en uno de 80px.
const SQUIRCLE_RATIO = 0.3;

// Avatar de perfil: muestra la foto si hay `url`, si no cae a las iniciales
// sobre un fondo (gradiente por defecto, o `fallbackClass` para un color
// plano como el que usa UserMenu). `size` es en px y controla ambas ramas
// para no depender de clases Tailwind arbitrarias por cada lugar donde se usa.
export function Avatar({
  url,
  initials,
  size,
  fallbackClass = "bg-gradient-to-br from-sv-dark to-sv-primary",
  fallbackColor,
  textClass = "",
  className = "",
}: {
  url?: string | null;
  initials: string;
  size: number;
  fallbackClass?: string;
  // Color plano (hex) para el fondo cuando no hay foto — pisa a fallbackClass.
  // Para la variedad de colores por técnico (ver lib/avatarColors.ts).
  fallbackColor?: string;
  textClass?: string;
  className?: string;
}) {
  const radius = Math.round(size * SQUIRCLE_RATIO);

  if (url) {
    return (
      <Image
        src={url}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 object-cover ${className}`}
        style={{ width: size, height: size, borderRadius: radius }}
      />
    );
  }
  return (
    <span
      className={`flex shrink-0 items-center justify-center font-bold text-white ${fallbackColor ? "" : fallbackClass} ${textClass} ${className}`}
      style={{ width: size, height: size, borderRadius: radius, background: fallbackColor }}
    >
      {initials}
    </span>
  );
}
