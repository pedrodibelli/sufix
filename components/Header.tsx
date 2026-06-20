import Link from "next/link";
import Image from "next/image";
import { createSupabaseServer } from "@/lib/supabase-server";
import { UserMenu } from "@/components/UserMenu";
import { MobileMenu } from "@/components/MobileMenu";
import { BottomNav } from "@/components/BottomNav";
import { isAdminEmail } from "@/lib/admin";

export async function Header() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const nombre = user?.user_metadata?.nombre as string | undefined;
  const apellido = user?.user_metadata?.apellido as string | undefined;
  const esProfesional = user?.user_metadata?.es_profesional === true;
  const isAdmin = isAdminEmail(user?.email);
  const dk = esProfesional;

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
            <Image src="/logo.png" alt="SolvIT" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className={`font-display text-[17px] font-semibold tracking-tight ${dk ? "text-white" : "text-sv-dark"}`}>
              Solv<span className={dk ? "text-zap-300" : "text-sv-primary"}>IT</span>
            </span>
          </Link>
        </div>

        {/* Nav central */}
        <nav className="hidden items-center gap-0.5 sm:flex">
          <Link href="/" className={navLink}>Marketplace</Link>
          <Link href="/como-funciona" className={navLink}>Cómo funciona</Link>
          {user && <Link href="/mis-consultas" className={navLink}>Mis consultas</Link>}
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
          <MobileMenu hasUser={!!user} dark={dk} />
        </div>

      </div>
    </header>
    {user && <BottomNav dark={dk} />}
    </>
  );
}
