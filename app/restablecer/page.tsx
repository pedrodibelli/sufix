"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PasswordInput } from "@/components/PasswordInput";

// Pantalla que faltaba (2026-09-07). El mail de "olvidé mi contraseña" volvía
// a /ingresar, que solo sabe iniciar sesión: el usuario tenía una sesión de
// recuperación abierta pero ningún lugar donde escribir la contraseña nueva,
// y al probar una le decía "contraseña incorrecta". El link te dejaba
// exactamente donde estabas.
//
// Ahora vuelve acá vía /auth/callback (que canjea el `code` de PKCE por una
// sesión real) y esta página solo se ocupa de cambiarla.
export default function RestablecerPage() {
  const [cargando, setCargando] = useState(true);
  const [haySesion, setHaySesion] = useState(false);
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [error, setError] = useState("");
  const [listo, setListo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    // Si el canje del código funcionó, acá ya hay sesión. Si alguien entra de
    // prende a /restablecer sin venir del mail, no la hay y se lo dice.
    supabase.auth.getSession().then(({ data }) => {
      setHaySesion(!!data.session);
      setCargando(false);
    });
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (nueva.length < 8) { setError("La contraseña tiene que tener al menos 8 caracteres."); return; }
    if (nueva !== repetir) { setError("Las dos contraseñas no coinciden."); return; }

    setGuardando(true);
    const { error: err } = await supabase.auth.updateUser({ password: nueva });
    setGuardando(false);
    if (err) { setError(err.message); return; }
    setListo(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FBF8EF] p-8">
      <div className="w-full max-w-sm">
        {cargando ? (
          <p className="text-sm text-ink-400">Verificando el enlace…</p>
        ) : listo ? (
          <>
            <h1 className="display text-3xl leading-tight">Contraseña cambiada</h1>
            <p className="mt-2 text-sm text-ink-500">
              Ya podés entrar a Sufix con tu contraseña nueva.
            </p>
            <Link href="/" className="btn-primary mt-6 inline-block px-8">Ir al inicio</Link>
          </>
        ) : !haySesion ? (
          <>
            <h1 className="display text-3xl leading-tight">El enlace no sirve</h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              Puede que ya lo hayas usado, que haya vencido, o que lo hayas abierto en otro
              navegador distinto al que pidió el cambio. Pedí uno nuevo y probá otra vez.
            </p>
            <Link href="/ingresar" className="btn-primary mt-6 inline-block px-8">Volver a ingresar</Link>
          </>
        ) : (
          <>
            <h1 className="display text-3xl leading-tight">Nueva contraseña</h1>
            <p className="mt-2 text-sm text-ink-500">Elegí una que no uses en otro lado.</p>

            <form onSubmit={guardar} className="mt-6 space-y-4">
              <div>
                <label htmlFor="nueva" className="label">Contraseña nueva</label>
                <PasswordInput
                  id="nueva"
                  value={nueva}
                  onChange={setNueva}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label htmlFor="repetir" className="label">Repetir contraseña</label>
                <PasswordInput
                  id="repetir"
                  value={repetir}
                  onChange={setRepetir}
                  placeholder="Escribila de nuevo"
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
              )}

              <button type="submit" disabled={guardando} className="btn-primary w-full disabled:opacity-60">
                {guardando ? "Guardando…" : "Guardar contraseña"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
