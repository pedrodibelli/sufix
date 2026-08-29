"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
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
            Tu casa anda mal, vos no tenés que perder la mañana.
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
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="field"
              />
            </Field>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-ink-400">
                <input type="checkbox" className="rounded border-ink-300 accent-sv-primary" />
                Recordarme
              </label>
              <a href="#" className="text-ink-400 underline underline-offset-2">
                Olvidé mi contraseña
              </a>
            </div>

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
