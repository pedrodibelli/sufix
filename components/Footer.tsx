import Image from "next/image";

// Antes era un stub vacío (return null) — el rediseño 2026-08-28 sumó un pie
// de página real, mismo espíritu que la landing nueva: liviano, una línea.
export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-[#FBF8EF] py-8">
      <div className="container-pad flex flex-wrap items-center justify-between gap-3.5">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Sufix" width={24} height={24} className="h-6 w-6 object-contain" />
          <span className="font-display text-base font-semibold text-sv-dark">Sufix</span>
        </div>
        <p className="text-[13px] text-ink-500">Hecho en Buenos Aires · sufixapp.com</p>
      </div>
    </footer>
  );
}
