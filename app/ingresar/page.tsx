"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { PasswordInput } from "@/components/PasswordInput";
import { LoadingScreen } from "@/components/LoadingScreen";
// import { GoogleButton } from "@/components/GoogleButton"; // pausado, ver CLAUDE.md

export default function IngresarPage() {
  return (
    <Suspense fallback={<div className="container-pad py-20 text-ink-400">Cargando…</div>}>
      <IngresarInner />
    </Suspense>
  );
}

function IngresarInner() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  // "Olvidé mi contraseña" era un href="#" — un link que no hacía nada
  // (2026-09-07). Ahora pide el mail de recuperación a Supabase, que lo manda
  // por el SMTP configurado. Sin SMTP no llega nada, así que el texto de éxito
  // no promete que ya está en la bandeja, solo que lo pedimos.
  const [reseteando, setReseteando] = useState(false);
  // Cuando un link de recuperacion falla, Supabase devuelve al sitio con el
  // motivo en la query Y en el hash (#error=...). El hash no llega al
  // servidor, asi que hay que leerlo en el navegador. Sin esto el usuario
  // aterrizaba en el login sin ninguna explicacion de por que no funciono.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const h = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const code = q.get("error_code") ?? h.get("error_code");
    const err = q.get("error") ?? h.get("error");
    if (!code && !err) return;
    setAvisoReset(
      code === "otp_expired"
        ? "Ese enlace ya venció o se usó. Escribí tu email acá abajo y pedí uno nuevo."
        : "No pudimos validar el enlace. Escribí tu email acá abajo y pedí uno nuevo."
    );
    // Se limpia la URL para que al recargar no vuelva a aparecer el error.
    window.history.replaceState(null, "", window.location.pathname);
  }, []);
  const [avisoReset, setAvisoReset] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      if (signInError.message.toLowerCase().includes("email not confirmed")) {
        setError("Necesitás confirmar tu email antes de ingresar. Revisá tu bandeja de entrada.");
      } else {
        setError("Email o contraseña incorrectos.");
      }
      setLoading(false);
      return;
    }

    setRedirecting(true);
    // Navegación DURA (recarga real), no soft (router.push/refresh): en la PWA del
    // celular la transición client-side se cuelga y el spinner queda infinito.
    const dest = next.startsWith("/") ? next : "/";
    setTimeout(() => window.location.assign(dest), 400);
  }

  if (redirecting) return <LoadingScreen message="Iniciando sesión…" />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FBF8EF] p-8">
      <div className="w-full max-w-sm">
          <h1 className="display text-4xl leading-tight">Ingresá a Sufix</h1>
          <p className="mt-2 text-sm text-ink-400">
            Tus contactos y tus reseñas, donde los dejaste.
          </p>

          {/* Login con Google: PAUSADO a propósito (ver CLAUDE.md). Para
              reactivar, descomentar esto y el import de arriba:
          <div className="mt-6">
            <GoogleButton next={next} />
          </div>
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-ink-100" />
            <span className="text-xs text-ink-400">o con mail</span>
            <div className="h-px flex-1 bg-ink-100" />
          </div>
          */}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Field label="Email">
              <input
                type="email"
                placeholder="vos@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="field"
              />
            </Field>
            <Field label="Contraseña">
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </Field>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-ink-400">
                <input type="checkbox" className="rounded border-ink-300 accent-sv-primary" />
                Recordarme
              </label>
              <button
                type="button"
                disabled={reseteando}
                onClick={async () => {
                  setAvisoReset("");
                  if (!email.trim()) {
                    setAvisoReset("Escribí tu email arriba y volvé a tocar acá.");
                    return;
                  }
                  setReseteando(true);
                  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                    redirectTo: `${window.location.origin}/auth/callback?next=/restablecer`,
                  });
                  setReseteando(false);
                  // Se responde igual exista o no la cuenta: decir "ese mail no
                  // está registrado" le confirmaría a cualquiera qué direcciones
                  // tienen cuenta en Sufix.
                  setAvisoReset(
                    error
                      ? "No pudimos enviarlo ahora. Probá de nuevo en un rato."
                      : "Si esa dirección tiene una cuenta, te llega un mail para cambiarla."
                  );
                }}
                className="text-ink-400 underline underline-offset-2 disabled:opacity-60"
              >
                {reseteando ? "Enviando…" : "Olvidé mi contraseña"}
              </button>
            </div>

            {avisoReset && (
              <p className="rounded-xl bg-zap-100 px-4 py-2 text-sm text-sv-olive">{avisoReset}</p>
            )}

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-ink-400">
            ¿Primera vez?{" "}
            <Link href="/registrar" className="font-medium text-sv-dark underline underline-offset-4">
              Crear cuenta
            </Link>
          </p>

          <Link href="/" className="mt-6 block text-center text-xs text-ink-400 hover:text-sv-dark">
            ← Volver al inicio
          </Link>
        </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
