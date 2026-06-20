"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, URGENCIES, ZONES } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import { crearPublicacion } from "./actions";

const STEPS = [
  "Zona y urgencia",
  "Rubro",
  "Detalle y fotos",
  "Revisión",
] as const;

const ZONES_WITH_OTHER = [...ZONES, "Otro"];

const CATEGORY_INFO: Record<string, { examples: string[]; tip: string }> = {
  no_se: {
    examples: ["No sé exactamente qué falló", "Puede ser más de un rubro", "Necesito que alguien lo diagnostique"],
    tip: "Describí el problema con tus palabras en el paso siguiente. Vamos a asignarlo al técnico correcto.",
  },
  plomeria: {
    examples: ["Pérdida bajo la pileta", "Canilla que gotea", "Destape de baño"],
    tip: "Mencioná si el agua está cortada o si hay daño visible en paredes.",
  },
  electricidad: {
    examples: ["Corte de luz parcial", "Enchufe quemado", "Instalación de lámparas"],
    tip: "Indicá si el tablero tiene térmicos saltados o si hay chispas.",
  },
  gas: {
    examples: ["Olor a gas en la cocina", "Calefón que no enciende", "Prueba de estanqueidad"],
    tip: "Si sentís olor a gas, abrí ventanas y ventilá el ambiente antes de publicar.",
  },
  aire: {
    examples: ["Split que no enfría", "Instalación de equipo nuevo", "Limpieza de filtros"],
    tip: "Indicá la marca, modelo y si hace algún ruido raro.",
  },
  cerrajeria: {
    examples: ["Me quedé encerrado/a", "Cerradura rota", "Cambio de cerradura"],
    tip: "Para urgencias seleccioná 'Hoy mismo' — ya lo elegiste en el paso anterior.",
  },
  pintura: {
    examples: ["Repintar dormitorio", "Humedad en paredes", "Frente exterior"],
    tip: "Mencioná la cantidad de ambientes o metros aproximados.",
  },
  carpinteria: {
    examples: ["Puerta que no cierra bien", "Placard a medida", "Restaurar mueble"],
    tip: "Medidas aproximadas y fotos ayudan mucho en este rubro.",
  },
  albanileria: {
    examples: ["Revoque caído", "Contrapiso nuevo", "Reforma de baño"],
    tip: "Describí el área afectada en m² si podés estimar.",
  },
  electrodomesticos: {
    examples: ["Heladera que no enfría", "Lavarropas que no centrifuga", "Horno sin calor"],
    tip: "Indicá la marca y el modelo del equipo si lo tenés a mano.",
  },
  vidrieria: {
    examples: ["Vidrio roto", "Mampara de baño", "Espejo nuevo"],
    tip: "Si podés, medí el vidrio en cm antes — aproximado está bien.",
  },
};

export function PublicarForm() {
  return (
    <Suspense fallback={<div className="container-pad py-20 text-ink-500">Cargando…</div>}>
      <PublicarInner />
    </Suspense>
  );
}

function PublicarInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initialCat = params.get("cat") ?? "";

  const [step, setStep] = useState(0);
  const [cat, setCat] = useState(initialCat);
  const [title, setTitle] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [zone, setZone] = useState("");
  const [urgency, setUrgency] = useState("hoy");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }
  function back() {
    if (step > 0) setStep(step - 1);
  }

  async function submit() {
    setSubmitError("");
    setSubmitting(true);

    try {
      const result = await crearPublicacion({
        title,
        category_slug: cat,
        zone,
        urgency,
        photos,
      });

      if (result.error) {
        setSubmitError(result.error);
        setSubmitting(false);
        return;
      }

      router.push("/publicar/exito");
    } catch {
      // Nunca dejar el botón colgado en "Publicando…": mostramos el error y reseteamos.
      setSubmitError("No pudimos publicar. Revisá tu conexión e intentá de nuevo.");
      setSubmitting(false);
    }
  }

  const canContinue = (() => {
    if (step === 0) return !!zone && !!urgency && zone !== "Otro";
    if (step === 1) return !!cat;
    if (step === 2) return title.trim().length > 8;
    return true;
  })();

  const selectedCat = CATEGORIES.find((c) => c.slug === cat);

  return (
    <main>
      <div className="container-pad py-10">
        <div className="mb-8 flex flex-wrap items-center gap-2 text-xs text-ink-500">
          <Link href="/" className="hover:text-ink-900">SolvIT</Link>
          <span>/</span>
          <span>Publicar problema</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[260px,1fr]">
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
            <ol className="space-y-2">
              {STEPS.map((s, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <li
                    key={s}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${
                      active
                        ? "border-sv-dark bg-sv-dark text-white"
                        : done
                          ? "border-zap-200 bg-white text-sv-dark"
                          : "border-dashed border-zap-200 bg-transparent text-ink-400"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-semibold ${
                        active
                          ? "bg-sv-primary text-white"
                          : done
                            ? "bg-zap-200 text-sv-dark"
                            : "bg-ink-100 text-ink-500"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    {s}
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 card border-zap-200 bg-zap-50 p-4 text-xs text-sv-dark">
              <div className="font-semibold">¿Por qué pedimos esto?</div>
              <p className="mt-1 text-ink-400">
                Cuanto mejor describas el problema, más rápido te llegan ofertas precisas.
              </p>
            </div>
          </aside>

          <div>
            {/* Barra de progreso compacta — solo mobile (en desktop está la barra lateral) */}
            <div className="mb-4 flex gap-1.5 lg:hidden">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-sv-primary" : "bg-ink-100"}`}
                />
              ))}
            </div>
            <div className="text-xs uppercase tracking-wider text-ink-400">
              Paso {step + 1} de {STEPS.length}
            </div>
            <h1 className="display mt-1 text-3xl md:text-4xl">
              {STEPS[step] === "Zona y urgencia" && "¿Dónde y cuándo?"}
              {STEPS[step] === "Rubro" && "¿Qué necesitás resolver?"}
              {STEPS[step] === "Detalle y fotos" && "Contanos el problema"}
              {STEPS[step] === "Revisión" && "Revisemos antes de publicar"}
            </h1>

            <div className="mt-8">
              {step === 0 && (
                <StepZona zone={zone} urgency={urgency} onZone={setZone} onUrgency={setUrgency} />
              )}
              {step === 1 && <StepRubro value={cat} onChange={setCat} />}
              {step === 2 && (
                <StepDetalleYFotos
                  title={title}
                  onTitle={setTitle}
                  photos={photos}
                  setPhotos={setPhotos}
                  uploading={uploadingPhotos}
                  setUploading={setUploadingPhotos}
                />
              )}
              {step === 3 && (
                <StepReview
                  title={title}
                  cat={selectedCat?.name}
                  zone={zone}
                  urgency={urgency}
                  photos={photos}
                />
              )}
            </div>

            {submitError && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
                {submitError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-zap-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={back} disabled={step === 0 || submitting} className="btn-ghost w-full sm:w-auto disabled:opacity-40">
                ← Volver
              </button>
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={next} disabled={!canContinue || uploadingPhotos} className="btn-primary w-full sm:w-auto disabled:opacity-50">
                  Continuar
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={submitting} className="btn-zap w-full sm:w-auto disabled:opacity-50">
                  {submitting ? "Publicando…" : "Publicar problema"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* --- STEPS --- */

function StepZona({
  zone, urgency, onZone, onUrgency,
}: {
  zone: string; urgency: string; onZone: (v: string) => void; onUrgency: (v: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <label className="label">Zona</label>
        <div className="flex flex-wrap gap-1.5">
          {ZONES_WITH_OTHER.map((z) => (
            <button
              type="button"
              key={z}
              onClick={() => onZone(z)}
              className={`pill border ${
                zone === z
                  ? z === "Otro"
                    ? "border-amber-500 bg-amber-500 text-white"
                    : "border-sv-dark bg-sv-dark text-white"
                  : "border-zap-200 bg-white text-sv-dark hover:border-sv-primary"
              }`}
            >
              📍 {z}
            </button>
          ))}
        </div>

        {zone === "Otro" && (
          <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <span className="mt-0.5 shrink-0 text-xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Todavía no llegamos a tu zona
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Por ahora SolvIT opera en zonas seleccionadas de CABA y GBA Norte. Si publicás en &quot;Otro&quot;, no vas a recibir propuestas porque ningún técnico de la plataforma opera ahí todavía.
              </p>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="label">Urgencia</label>
        <div className="grid gap-2 sm:grid-cols-3">
          {URGENCIES.map((u) => (
            <button
              type="button"
              key={u.value}
              onClick={() => onUrgency(u.value)}
              className={`rounded-2xl border p-4 text-left ${
                urgency === u.value
                  ? "border-sv-dark bg-sv-dark text-white"
                  : "border-zap-100 bg-white hover:border-sv-primary"
              }`}
            >
              <div className="text-sm font-semibold">{u.label}</div>
              <div className={`text-xs ${urgency === u.value ? "text-zap-200" : "text-ink-400"}`}>{u.note}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepRubro({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="text-ink-400">
        Elegí el rubro principal. Si tu problema toca varios, después podemos sumar.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {CATEGORIES.map((c) => {
          const active = value === c.slug;
          return (
            <button
              type="button"
              key={c.slug}
              onClick={() => onChange(c.slug)}
              className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-sv-dark bg-sv-dark text-white"
                  : "border-zap-100 bg-white hover:border-sv-primary"
              }`}
            >
              <div
                className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${c.accent} opacity-${active ? "30" : "80"}`}
              />
              <div className="relative">
                <div className="text-2xl">{c.icon}</div>
                <div className={`mt-2 text-sm font-semibold ${active ? "text-white" : "text-sv-dark"}`}>
                  {c.name}
                </div>
                <div className={`text-xs ${active ? "text-zap-200" : "text-ink-400"}`}>
                  {c.blurb}
                </div>
              </div>
            </button>
          );
        })}

        {/* No lo sé */}
        <button
          type="button"
          onClick={() => onChange("no_se")}
          className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition ${
            value === "no_se"
              ? "border-sv-dark bg-sv-dark text-white"
              : "border-dashed border-zap-200 bg-white hover:border-sv-primary"
          }`}
        >
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br from-ink-100 to-ink-50 opacity-80" />
          <div className="relative">
            <div className="text-2xl">🤔</div>
            <div className={`mt-2 text-sm font-semibold ${value === "no_se" ? "text-white" : "text-sv-dark"}`}>
              No lo sé
            </div>
            <div className={`text-xs ${value === "no_se" ? "text-zap-200" : "text-ink-400"}`}>
              Describilo y te ayudamos
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

function StepDetalleYFotos({
  title,
  onTitle,
  photos,
  setPhotos,
  uploading,
  setUploading,
}: {
  title: string;
  onTitle: (v: string) => void;
  photos: string[];
  setPhotos: (p: string[]) => void;
  uploading: boolean;
  setUploading: (v: boolean) => void;
}) {
  const [uploadError, setUploadError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = 5 - photos.length;
    if (remaining <= 0) return;

    setUploadError("");
    setUploading(true);

    const toUpload = Array.from(files).slice(0, remaining);
    const newUrls: string[] = [];

    for (const file of toUpload) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("fotos-publicaciones")
        .upload(path, file, { upsert: false });

      if (error) {
        setUploadError(`Error al subir ${file.name}: ${error.message}`);
        break;
      }

      const { data } = supabase.storage
        .from("fotos-publicaciones")
        .getPublicUrl(path);

      newUrls.push(data.publicUrl);
    }

    setPhotos([...photos, ...newUrls]);
    setUploading(false);
  }

  function remove(idx: number) {
    setPhotos(photos.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-8">
      {/* Resumen */}
      <div>
        <label className="label">Resumen del problema</label>
        <input
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          placeholder="Ej: Pérdida abajo de la pileta de cocina"
          className="field"
        />
        <div className="mt-1 text-xs text-ink-400">
          Una frase corta. Como si se lo contaras a un amigo.
        </div>
      </div>

      {/* Fotos */}
      <div>
        <label className="label">
          Fotos{" "}
          <span className="font-normal text-ink-400">(opcional)</span>
        </label>
        <p className="mb-4 text-sm text-ink-400">
          2–3 buenas fotos aceleran todo.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((src, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-ink-100">
              <Image src={src} alt="" fill sizes="200px" className="object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute right-2 top-2 rounded-full bg-sv-dark px-2 py-0.5 text-[11px] text-white opacity-0 transition group-hover:opacity-100"
              >
                Quitar
              </button>
            </div>
          ))}

          {uploading && (
            <div className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-sv-primary bg-zap-50">
              <div className="text-center">
                <div className="text-2xl animate-spin">⏳</div>
                <div className="mt-2 text-xs text-ink-400">Subiendo…</div>
              </div>
            </div>
          )}

          {!uploading && photos.length < 5 && (
            <label className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-zap-200 text-center transition hover:border-sv-primary hover:bg-zap-50">
              <div>
                <div className="text-3xl">📷</div>
                <div className="mt-2 text-xs text-ink-400">Agregar foto</div>
                <div className="text-[10px] text-ink-300">desde tu dispositivo</div>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          )}
        </div>

        {uploadError && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{uploadError}</p>
        )}

        <p className="mt-4 text-xs text-ink-400">
          Máximo 5 fotos · JPG, PNG, WEBP · hasta 10 MB por foto
        </p>
      </div>
    </div>
  );
}

function StepReview({
  title, cat, zone, urgency, photos,
}: {
  title: string; cat?: string; zone: string; urgency: string; photos: string[];
}) {
  const urgencyLabel = URGENCIES.find((u) => u.value === urgency)?.label ?? urgency;
  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="pill bg-zap-100 text-sv-olive">Lista para publicar</span>
        <span className="pill bg-zap-50 text-sv-dark">{cat}</span>
        <span className="pill bg-zap-50 text-sv-dark">📍 {zone}</span>
        <span className="pill bg-zap-50 text-sv-dark">⏱ {urgencyLabel}</span>
      </div>
      <h2 className="display mt-4 text-2xl">{title || "Sin título"}</h2>
      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {photos.map((src, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-xl bg-ink-100">
              <Image src={src} alt="" fill sizes="120px" className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
