import Image from "next/image";

// Círculo de perfil: muestra la foto si hay `url`, si no cae a las iniciales
// sobre un fondo (gradiente por defecto, o `fallbackClass` para un color
// plano como el que usa UserMenu). `size` es en px y controla ambas ramas
// para no depender de clases Tailwind arbitrarias por cada lugar donde se usa.
export function Avatar({
  url,
  initials,
  size,
  fallbackClass = "bg-gradient-to-br from-sv-dark to-sv-primary",
  textClass = "",
  className = "",
}: {
  url?: string | null;
  initials: string;
  size: number;
  fallbackClass?: string;
  textClass?: string;
  className?: string;
}) {
  if (url) {
    return (
      <Image
        src={url}
        alt=""
        width={size}
        height={size}
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${fallbackClass} ${textClass} ${className}`}
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  );
}
