"use client";

export function LoadingScreen({ message = "Cargando…" }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f5fdf9] animate-in fade-in duration-200">
      {/* Wordmark */}
      <div className="mb-10">
        <span className="font-display text-[32px] font-semibold tracking-tight text-sv-dark">Sufix</span>
      </div>

      {/* Spinner de anillo */}
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-[3px] border-sv-primary/15" />
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-sv-primary" />
      </div>

      {/* Mensaje */}
      <p className="mt-5 text-sm font-medium text-ink-400">{message}</p>

      {/* Puntos animados */}
      <div className="mt-3 flex gap-1.5">
        <span className="block h-1.5 w-1.5 animate-bounce rounded-full bg-sv-primary/40 delay-0" />
        <span className="block h-1.5 w-1.5 animate-bounce rounded-full bg-sv-primary/40 delay-150" />
        <span className="block h-1.5 w-1.5 animate-bounce rounded-full bg-sv-primary/40 delay-300" />
      </div>
    </div>
  );
}
