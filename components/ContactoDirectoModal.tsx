"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import type { PostedJob } from "@/lib/data";
import { CATEGORIES } from "@/lib/data";
import { CategoryArt } from "./CategoryArt";
import { crearContactoDirecto } from "@/app/mis-consultas/actions";

interface Props {
  job: PostedJob;
  onClose: () => void;
}

// Reemplaza (por ahora) a ContactarModal en el marketplace: el oferente ya no
// cotiza una consulta, solo avisa que quiere hacer el trabajo. Si el cliente lo
// elige, va a recibir un WhatsApp directo de él — ver lib/config.ts para
// reactivar el flujo viejo con precio.
export function ContactoDirectoModal({ job, onClose }: Props) {
  const [loading, startTransition] = useTransition();
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [fotoIdx, setFotoIdx] = useState(0);

  const cat = CATEGORIES.find((c) => c.slug === job.categorySlug);
  const hue = cat?.hue ?? 180;
  const allPhotos = job.photos?.length ? job.photos : (job.photo ? [job.photo] : []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleEnviar() {
    setError("");
    startTransition(async () => {
      const result = await crearContactoDirecto(job.id, {
        titulo: job.title,
        descripcion: job.description,
        zona: job.zone,
        categoria: job.categorySlug,
        foto: job.photo ?? null,
        demandante: job.postedBy,
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setEnviado(true);
    });
  }

  return (
    <div
      className="animate-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
      onClick={enviado ? onClose : undefined}
    >
      <div
        className="animate-modal relative w-full max-w-lg overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {enviado ? (
          /* ── Pantalla de confirmación ── */
          <div className="flex flex-col items-center px-8 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
              ✅
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-ink-400">
              Listo
            </p>
            <div className="mt-5 w-full rounded-2xl bg-green-50 border border-green-200 px-6 py-5">
              <div className="text-3xl">💬</div>
              <p className="mt-3 text-lg font-bold leading-snug text-sv-dark">
                Le avisamos al cliente que querés hacer este trabajo
              </p>
              <p className="mt-2 text-sm text-ink-500 leading-relaxed">
                Si te elige, te va a escribir directo por WhatsApp. Podés seguir el estado en &ldquo;Mis propuestas&rdquo;.
              </p>
            </div>
            <button type="button" onClick={onClose} className="btn-primary mt-8 w-full">
              Entendido
            </button>
          </div>
        ) : (
          /* ── Confirmación de interés ── */
          <>
            <div className="relative h-52 w-full overflow-hidden bg-ink-100">
              {allPhotos.length > 0 ? (
                <>
                  <Image
                    src={allPhotos[fotoIdx]}
                    alt={job.title}
                    fill
                    sizes="560px"
                    className="object-cover"
                  />
                  {allPhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => setFotoIdx((i) => (i - 1 + allPhotos.length) % allPhotos.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() => setFotoIdx((i) => (i + 1) % allPhotos.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50"
                      >
                        ›
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {allPhotos.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            aria-label={`Foto ${i + 1}`}
                            onClick={() => setFotoIdx(i)}
                            className={`h-1.5 rounded-full transition-all ${i === fotoIdx ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <CategoryArt icon={cat?.icon ?? "🔧"} hue={hue} className="h-full w-full" />
              )}
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/40 bg-white/30 px-3 py-1 text-xs font-medium text-sv-dark backdrop-blur-md">
                {cat?.icon} {cat?.name ?? job.categorySlug}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm hover:bg-black/40"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 text-xs text-ink-400">
                <span className="font-medium text-sv-dark">{job.postedBy}</span>
                <span>·</span>
                <span>{job.zone}</span>
                <span>·</span>
                <span>{job.postedAgo}</span>
              </div>

              <h2 className="display mt-2 text-xl leading-snug">{job.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{job.description}</p>

              <div className="my-5 border-t border-ink-100" />

              <div className="rounded-xl border border-sv-primary/30 bg-sv-primary/5 p-4">
                <p className="text-sm font-medium text-sv-dark">
                  🎉 Por ahora, avisarle al cliente que querés este trabajo es <strong>gratis</strong>.
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
                  Si te elige entre los interesados, te contacta directo por WhatsApp. No hace falta que cotices nada.
                </p>
              </div>

              {error && (
                <p className="mt-4 rounded-xl bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600">
                  {error}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={onClose} className="btn-ghost flex-1">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEnviar}
                  disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? "Enviando…" : "Quiero hacer este trabajo"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
