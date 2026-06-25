"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, ZONES } from "@/lib/data";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function RegistrarPage() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [esProfesional, setEsProfesional] = useState<boolean | null>(null);

  // Campos solo para profesionales
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [categoria, setCategoria] = useState("");
  const [zona, setZona] = useState("");

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
      if (!dni.trim()) { setError("El DNI es obligatorio para profesionales."); return; }
      if (!telefono.trim()) { setError("El teléfono es obligatorio para profesionales."); return; }
      if (!categoria) { setError("Seleccioná tu rubro."); return; }
      if (!zona) { setError("Seleccioná tu zona de trabajo."); return; }
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
      metadata.dni = dni.trim();
      metadata.telefono = telefono.trim();
      metadata.categoria = categoria;
      metadata.zona = zona;
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
    <main className="flex min-h-screen items-center justify-center bg-[#f5fdf9] p-8">
      <div className="w-full max-w-sm">
        <h1 className="display text-4xl leading-tight">Crear cuenta</h1>
        <p className="mt-2 text-sm text-ink-400">
          Gratis. Sin comisiones. Tu problema, resuelto.
        </p>

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

              <div className="grid grid-cols-2 gap-3">
                <Field label="DNI">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="12345678"
                    value={dni}
                    onChange={(e) => setDni(e.target.value.replace(/\D/g, ""))}
                    maxLength={9}
                    className="field"
                  />
                </Field>
                <Field label="Teléfono">
                  <input
                    type="tel"
                    placeholder="+54 9 11 ..."
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="field"
                  />
                </Field>
              </div>

              <Field label="Rubro">
                <select
                  title="Rubro"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="field"
                >
                  <option value="">Seleccioná tu rubro</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Zona de trabajo">
                <select
                  title="Zona de trabajo"
                  value={zona}
                  onChange={(e) => setZona(e.target.value)}
                  className="field"
                >
                  <option value="">Seleccioná tu zona</option>
                  {ZONES.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </Field>
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
