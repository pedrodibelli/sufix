"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.5a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75V15a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v5.25a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75V9.75" />
  </svg>
);

const ListIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const GridIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6a2.25 2.25 0 012.25-2.25h1.5A2.25 2.25 0 019.75 6v1.5A2.25 2.25 0 017.5 9.75H6A2.25 2.25 0 013.75 7.5V6zM14.25 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v1.5A2.25 2.25 0 0118 9.75h-1.5a2.25 2.25 0 01-2.25-2.25V6zM3.75 16.5a2.25 2.25 0 012.25-2.25h1.5a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-1.5zM14.25 16.5a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-1.5A2.25 2.25 0 0114.25 18v-1.5z" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

// Barra de navegación de abajo, solo mobile.
//
// Hasta 2026-09-20 se mostraba ÚNICAMENTE a usuarios logueados (Header hacía
// `{user && <BottomNav/>}`). Como la web es un directorio público que se usa
// sin cuenta, eso dejaba sin navegación fija justo al 90-95% del tráfico —
// que además ya pagaba su costo: el <body> reserva el alto de esta barra en
// mobile pase lo que pase, así que al visitante le quedaba una franja vacía
// abajo de todo.
//
// Los ítems también eran del modelo viejo (Inicio / Contactos, pensados para
// el flujo de publicar un problema). Ahora el segundo ítem es Oficios, que es
// la forma real de moverse en un directorio de 620 técnicos.
export function BottomNav({ hasUser = false, novedades = 0 }: { dark?: boolean; hasUser?: boolean; novedades?: number }) {
  const pathname = usePathname();

  // Se oculta donde estorbaría o no aplica
  if (
    pathname.startsWith("/publicar") ||
    pathname === "/ingresar" ||
    pathname === "/registrar"
  ) {
    return null;
  }

  const items = [
    { href: "/", label: "Inicio", Icon: HomeIcon },
    { href: "/categorias", label: "Oficios", Icon: GridIcon },
    hasUser
      ? { href: "/mis-consultas", label: "Contactos", Icon: ListIcon }
      : { href: "/ingresar", label: "Ingresar", Icon: UserIcon },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-ink-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
      {items.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        const cls = active ? "text-sv-primary" : "text-ink-400";
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-3.5 text-[11.5px] font-medium ${cls}`}
          >
            <span className="relative">
              <Icon className="h-6 w-6" />
              {href === "/mis-consultas" && novedades > 0 && (
                <span className="absolute -right-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
