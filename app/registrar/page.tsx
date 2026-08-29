"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { LoadingScreen } from "@/components/LoadingScreen";
import { RubroChips } from "@/components/RubroChips";
import { ZonaChips } from "@/components/ZonaChips";
// import { GoogleButton } from "@/components/GoogleButton"; // pausado, ver CLAUDE.md

export default function RegistrarPage() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [esProfesional, setEsProfesional] = useState<boolean | null>(null);

  // Campos solo para profesionales
  const [telefono, setTelefono] = useState("");
  const [categorias, setCategorias] = useState<string[]>([]);
  const [zonas, setZonas] = useState<string[]>([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");

    if (esProfesional === null) {
      setError("Indicá si sos profesional o no.");
      return;
    }
    if (esProfesional) {
      if (!telefono.trim()) { setError("El teléfono es obligatorio para profesionales."); return; }
      if (categorias.length === 0) { setError("Seleccioná al menos un rubro."); return; }
      if (zonas.length === 0) { setError("Seleccioná al menos una zona de trabajo."); return; }
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);

    const metadata: Record<string, unknown> = {
      nombre,
      apellido,
      es_profesional: esProfesional,
    };

    if (esProfesional) {
      metadata.telefono = telefono.trim();
      metadata.categorias = categorias;
      metadata.zonas = zonas;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        // Redirige la confirmación al deploy actual (no a la Site URL global de
        // Supabase, que es compartida con el deploy original en solvit.homes).
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setRedirecting(true);
    // Navegación DURA (recarga real), no soft (router.push). En la PWA standalone
    // del celular la transición client-side de Next se cuelga esperando el render
    // del Server Component de "/", y el spinner queda infinito. Una recarga completa
    // hace que el servidor lea la cookie de sesión recién creada y "/" cargue limpio.
    setTimeout(() => window.location.assign("/"), 400);
  }

  if (redirecting) {
    const msg = esProfesional
      ? "¡Bienvenido! Configurando tu perfil…"
      : "¡Cuenta creada! Redirigiendo…";
    return <LoadingScreen message={msg} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FBF8EF] p-8">
      <div className="w-full max-w-sm">
        <h1 className="display text-4xl leading-tight">Crear cuenta</h1>
        <p className="mt-2 text-sm text-ink-400">
          Gratis. Sin comisiones. Tu problema, resuelto.
        </p>

        {/* Login con Google: PAUSADO a propósito (ver CLAUDE.md) — abría
            demasiadas variables de configuración por ahora. El código
            (GoogleButton.tsx, app/auth/callback/route.ts) queda listo para
            reactivar más adelante, solo hay que volver a poner esto:
        <div className="mt-6">
          <GoogleButton next="/" />
          <p className="mt-2 text-center text-xs text-ink-400">
            ¿Sos técnico? Registrate con el formulario de abajo — necesitamos tu teléfono, rubro y zona.
          </p>
        </div>
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-ink-100" />
          <span className="text-xs text-ink-400">o con mail</span>
          <div className="h-px flex-1 bg-ink-100" />
        </div>
        */}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre">
              <input
                type="text"
                placeholder="Juan"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="field"
              />
            </Field>
            <Field label="Apellido">
              <input
                type="text"
                placeholder="Pérez"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="field"
              />
            </Field>
          </div>

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
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="field"
            />
          </Field>

          <Field label="Confirmar contraseña">
            <input
              type="password"
              placeholder="Repetí la contraseña"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="field"
            />
          </Field>

          {/* Tipo de cuenta */}
          <div>
            <span className="label">¿Sos profesional? (plomero, electricista, etc.)</span>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEsProfesional(true)}
                className={`rounded-xl border-2 py-3 text-sm font-medium transition-colors ${
                  esProfesional === true
                    ? "border-sv-primary bg-sv-primary text-white"
                    : "border-ink-200 bg-white text-ink-400 hover:border-sv-primary hover:text-sv-dark"
                }`}
              >
                Sí, soy profesional
              </button>
              <button
                type="button"
                onClick={() => setEsProfesional(false)}
                className={`rounded-xl border-2 py-3 text-sm font-medium transition-colors ${
                  esProfesional === false
                    ? "border-sv-primary bg-sv-primary text-white"
                    : "border-ink-200 bg-white text-ink-400 hover:border-sv-primary hover:text-sv-dark"
                }`}
              >
                No, busco servicio
              </button>
            </div>
          </div>

          {/* Campos extra para profesionales */}
          {esProfesional === true && (
            <div className="space-y-4 rounded-2xl border border-sv-primary/20 bg-sv-primary/5 p-4">
              <p className="text-[11.5px] font-semibold uppercase tracking-wide text-sv-olive">
                Datos del profesional
              </p>

              <Field label="Teléfono">
                <input
                  type="tel"
                  placeholder="+54 9 11 ..."
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="field"
                />
              </Field>

              <div>
                <span className="label">Rubro(s) — podés elegir más de uno</span>
                <div className="mt-2">
                  <RubroChips selected={categorias} onChange={setCategorias} />
                </div>
              </div>

              <div>
                <span className="label">Zona(s) de trabajo — podés elegir más de una</span>
                <div className="mt-2">
                  <ZonaChips selected={zonas} onChange={setZonas} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-ink-400">
          ¿Ya tenés cuenta?{" "}
          <Link href="/ingresar" className="font-medium text-sv-dark underline underline-offset-4">
            Ingresar
          </Link>
        </p>

        <Link href="/" className="mt-4 block text-center text-xs text-ink-400 hover:text-sv-dark">
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
