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

export function BottomNav({ dark = false, novedades = 0 }: { dark?: boolean; novedades?: number }) {
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
    { href: "/mis-consultas", label: "Contactos", Icon: ListIcon },
  ];

  const barCls = dark ? "border-white/10 bg-[#0e1a17]/95" : "border-ink-100 bg-white/95";

  return (
    <nav className={`fixed inset-x-0 bottom-0 z-40 flex border-t pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden ${barCls}`}>
      {items.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        const cls = dark
          ? active
            ? "text-zap-300"
            : "text-zap-500"
          : active
          ? "text-sv-primary"
          : "text-ink-400";
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-3.5 text-[11.5px] font-medium ${cls}`}
          >
            <span className="relative">
              <Icon className="h-6 w-6" />
              {href === "/mis-consultas" && novedades > 0 && (
                <span className={`absolute -right-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ${dark ? "ring-[#0e1a17]" : "ring-white"}`} />
              )}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
