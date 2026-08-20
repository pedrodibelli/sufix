import Link from "next/link";
import Image from "next/image";
import { createSupabaseServer } from "@/lib/supabase-server";
import { UserMenu } from "@/components/UserMenu";
import { MobileMenu } from "@/components/MobileMenu";
import { BottomNav } from "@/components/BottomNav";
import { RealtimeRefresh } from "@/components/RealtimeRefresh";
import { isAdminEmail } from "@/lib/admin";

export async function Header() {
  const supabase = await createSupabaseServer();
  // getSession() lee la cookie local (sin llamada de red), a diferencia de
  // getUser() que valida contra el servidor de Supabase en cada navegación.
  // Acá solo lo usamos para MOSTRAR datos; las verificaciones de seguridad
  // (proxy de /publicar, panel admin, RLS) siguen validando de verdad.
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const nombre = user?.user_metadata?.nombre as string | undefined;
  const apellido = user?.user_metadata?.apellido as string | undefined;
  const esProfesional = user?.user_metadata?.es_profesional === true;
  const isAdmin = isAdminEmail(user?.email);
  const dk = esProfesional;

  // Punto rojo de novedades en "Mis consultas":
  //  - Demandante: propuestas/presupuestos nuevos (flujo viejo) + técnicos
  //    interesados nuevos (flujo de contacto directo gratis) sin responder,
  //    en sus publicaciones abiertas.
  //  - Oferente: propuestas suyas ya aceptadas (tiene que coordinar/cerrar).
  let novedades = 0;
  if (user) {
    if (esProfesional) {
      const { count } = await supabase
        .from("propuestas")
        .select("id", { count: "exact", head: true })
        .eq("profesional_id", user.id)
        .eq("estado", "aceptada");
      novedades = count ?? 0;
    } else {
      const { data: pubs } = await supabase
        .from("publicaciones")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "abierto");
      const ids = (pubs ?? []).map((p) => String(p.id));
      if (ids.length > 0) {
        const { count } = await supabase
          .from("propuestas")
          .select("id", { count: "exact", head: true })
          .in("publicacion_id", ids)
          .or("estado.is.null,estado.eq.pendiente,estado.eq.interesado");
        novedades = count ?? 0;
      }
    }
  }

  const initials = nombre && apellido
    ? `${nombre[0]}${apellido[0]}`.toUpperCase()
    : nombre
    ? nombre.slice(0, 2).toUpperCase()
    : "U";

  const displayName = nombre
    ? `${nombre}${apellido ? ` ${apellido.charAt(0)}.` : ""}`
    : user?.email?.split("@")[0] ?? "";

  const navLink = dk
    ? "rounded-lg px-3.5 py-2 text-sm font-medium text-zap-100/70 transition-colors hover:bg-white/10 hover:text-white"
    : "rounded-lg px-3.5 py-2 text-sm font-medium text-ink-500 transition-colors hover:bg-zap-100 hover:text-sv-dark";

  return (
    <>
    <header className={`relative sticky top-0 z-40 border-b backdrop-blur-lg ${
      dk ? "border-white/10 bg-[#0e1a17]/95" : "border-ink-100/80 bg-white/90"
    }`}>
      <div className="flex h-14 w-full items-center gap-4 px-5 sm:px-8 lg:px-12">

        {/* Logo */}
        <div className="flex flex-1 items-center">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image src="/logo.png" alt="Sufix" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className={`font-display text-[17px] font-semibold tracking-tight ${dk ? "text-white" : "text-sv-dark"}`}>
              Su<span className={dk ? "text-zap-300" : "text-sv-primary"}>Fix</span>
            </span>
          </Link>
        </div>

        {/* Nav central */}
        <nav className="hidden items-center gap-0.5 sm:flex">
          <Link href="/" className={navLink}>Marketplace</Link>
          <Link href="/como-funciona" className={navLink}>Cómo funciona</Link>
          {user && (
            <Link href="/mis-consultas" className={`relative ${navLink}`}>
              Mis consultas
              {novedades > 0 && (
                <span className="absolute right-1.5 top-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </Link>
          )}
        </nav>

        {/* Acciones */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {user ? (
            <UserMenu
              displayName={displayName}
              email={user.email ?? ""}
              initials={initials}
              esProfesional={esProfesional}
              isAdmin={isAdmin}
              dark={dk}
            />
          ) : (
            <>
              <Link href="/ingresar" className={navLink + " hidden sm:inline-flex"}>
                Ingresar
              </Link>
              <Link href="/registrar" className="rounded-lg bg-sv-primary px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-sv-olive">
                Crear cuenta
              </Link>
            </>
          )}
          {/* Hamburguesa solo para visitantes; logueado alcanza con el menú del perfil */}
          {!user && <MobileMenu hasUser={false} dark={dk} />}
        </div>

      </div>
    </header>
    {user && <BottomNav dark={dk} novedades={novedades} />}
    {user && <RealtimeRefresh />}
    </>
  );
}
