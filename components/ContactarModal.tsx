"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { CATEGORIES, type PostedJob } from "@/lib/data";
import { CategoryArt } from "./CategoryArt";

interface Props {
  job: PostedJob;
  onClose: () => void;
}

export function ContactarModal({ job, onClose }: Props) {
  const [precio, setPrecio] = useState("");
  const [descuenta, setDescuenta] = useState(false);
  const [loading, setLoading] = useState(false);
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

  async function handleEnviar() {
    if (!precio) return;
    setError("");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setError("Necesitás iniciar sesión para enviar una propuesta.");
      return;
    }
    const meta = user.user_metadata;
    const nombrePro = [meta?.nombre, meta?.apellido].filter(Boolean).join(" ") || null;

    const { error: insertError } = await supabase.from("propuestas").insert({
      publicacion_id: job.id,
      precio: Number(precio),
      descuenta_de_presupuesto: descuenta,
      profesional_id: user.id,
      nombre_profesional: nombrePro,
      titulo: job.title,
      descripcion: job.description,
      zona: job.zone,
      categoria: job.categorySlug,
      foto: job.photo,
      demandante: job.postedBy,
    });

    setLoading(false);
    if (insertError) {
      setError(`No pudimos enviar la propuesta: ${insertError.message}`);
      return;
    }
    setEnviado(true);
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
              Propuesta enviada
            </p>

            <div className="mt-5 w-full rounded-2xl bg-green-50 border border-green-200 px-6 py-5">
              <div className="text-3xl">💬</div>
              <p className="mt-3 text-lg font-bold leading-snug text-sv-dark">
                Si el cliente acepta y paga, se desbloquea tu contacto
              </p>
              <p className="mt-2 text-sm text-ink-500 leading-relaxed">
                Te va a escribir directamente para coordinar la primera visita. Podés seguir el estado en "Mis propuestas".
              </p>
            </div>

            <div className="mt-6 w-full rounded-2xl border border-zap-200 bg-zap-50 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Tu propuesta</p>
              <p className="mt-2 text-sm font-medium text-sv-dark">{job.title}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-ink-500">
                <span className="font-semibold text-sv-dark text-base">${Number(precio).toLocaleString("es-AR")}</span>
                <span>·</span>
                <span>{descuenta ? "Descontado del presupuesto final" : "Sin descuento al presupuesto"}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-primary mt-8 w-full"
            >
              Entendido
            </button>
          </div>
        ) : (
          /* ── Formulario ── */
          <>
            {/* Header: carousel de fotos o arte generativo */}
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
                  {/* Flechas del carousel */}
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
                      {/* Dots */}
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

              <div>
                <label className="label">¿Cuánto cobrás por la primera consulta para validar el problema?</label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-ink-400">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="15000"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="field pl-7"
                  />
                </div>
                <p className="mt-1 text-xs text-ink-400">
                  El demandante ve este precio antes de aceptar. SolvIT te lo paga cuando se concreta el trabajo.
                </p>
              </div>

              <label
                className={`mt-4 flex w-full cursor-pointer items-center justify-between rounded-xl border p-4 transition ${
                  descuenta ? "border-blue-300 bg-blue-50" : "border-ink-200 bg-white hover:border-ink-300"
                }`}
              >
                <div className="pr-4">
                  <p className={`text-sm font-medium ${descuenta ? "text-blue-700" : "text-ink-700"}`}>
                    Descontar del presupuesto final
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">
                    Si aceptan, este valor de la consulta se resta del presupuesto total del trabajo.
                  </p>
                </div>
                <span className="switch">
                  <input
                    type="checkbox"
                    aria-label="Descontar del presupuesto final"
                    checked={descuenta}
                    onChange={(e) => setDescuenta(e.target.checked)}
                  />
                  <span className="slider" />
                </span>
              </label>

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
                  disabled={!precio || loading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {loading ? "Enviando…" : "Enviar propuesta"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
