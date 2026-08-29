"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/Avatar";
import { actualizarAvatar, eliminarAvatar } from "@/app/perfil/actions";

const MAX_MB = 5;

export function AvatarUpload({
  userId,
  initials,
  avatarUrl,
  size = 64,
}: {
  userId: string;
  initials: string;
  avatarUrl: string | null;
  size?: number;
}) {
  const router = useRouter();
  const camaraRef = useRef<HTMLInputElement>(null);
  const galeriaRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!menuOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Elegí un archivo de imagen (JPG, PNG…).");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`La imagen no puede pesar más de ${MAX_MB} MB.`);
      return;
    }

    // Preview optimista con el archivo local mientras sube.
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    // Ruta fija por usuario (sin extensión) + upsert: siempre pisa la anterior,
    // no deja archivos huérfanos si cambia de jpg a png.
    const path = `${userId}/avatar`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setError(`No se pudo subir la foto: ${uploadError.message}`);
      setUploading(false);
      setPreview(avatarUrl);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    // Cache-busting: la ruta es siempre la misma, así que sin esto el navegador
    // podría seguir mostrando la foto vieja después de actualizarla.
    const urlConVersion = `${data.publicUrl}?v=${Date.now()}`;

    const r = await actualizarAvatar(urlConVersion);
    setUploading(false);

    if ("error" in r) {
      setError(r.error);
      setPreview(avatarUrl);
      return;
    }

    setPreview(urlConVersion);
    router.refresh();
  }

  async function handleQuitar() {
    setMenuOpen(false);
    setError("");
    setUploading(true);
    const prev = preview;
    setPreview(null);

    const r = await eliminarAvatar();
    setUploading(false);

    if ("error" in r) {
      setError(r.error);
      setPreview(prev);
      return;
    }
    router.refresh();
  }

  function abrir(ref: React.RefObject<HTMLInputElement | null>) {
    setMenuOpen(false);
    // El input está siempre montado (fuera del menú condicional) para que el
    // click funcione como respuesta directa al gesto del usuario, sin que el
    // cierre del menú por React pise el .click() en móvil.
    ref.current?.click();
  }

  const editBtnCls = "border-white bg-white text-ink-600 group-hover:bg-ink-50";

  return (
    <div className="relative inline-flex shrink-0">
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        disabled={uploading}
        aria-label="Cambiar foto de perfil"
        className="group relative inline-flex rounded-full transition disabled:opacity-60"
      >
        <Avatar
          url={preview}
          initials={initials}
          size={size}
          className={uploading ? "opacity-50" : ""}
          textClass="font-display"
        />

        {uploading && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          </span>
        )}

        <span
          className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs shadow-sm transition ${editBtnCls}`}
          aria-hidden
        >
          📷
        </span>
      </button>

      {/* Inputs ocultos: uno abre la cámara directo (capture), el otro la galería. */}
      <input
        ref={camaraRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={(e) => { handleFile(e.target.files); e.target.value = ""; }}
      />
      <input
        ref={galeriaRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { handleFile(e.target.files); e.target.value = ""; }}
      />

      {error && (
        <p className="absolute left-1/2 top-full z-10 mt-2 w-48 -translate-x-1/2 rounded-lg bg-rose-50 px-3 py-1.5 text-center text-[11px] font-medium text-rose-600 shadow-sm">
          {error}
        </p>
      )}

      {menuOpen && (
        <div
          className="animate-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="animate-modal w-full max-w-xs overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <p className="text-sm font-semibold text-sv-dark">Foto de perfil</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar"
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink-400 hover:bg-ink-50"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col p-2">
              <button
                type="button"
                onClick={() => abrir(camaraRef)}
                className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium text-sv-dark transition hover:bg-zap-100"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sv-primary/10 text-base">📷</span>
                Tomar foto
              </button>
              <button
                type="button"
                onClick={() => abrir(galeriaRef)}
                className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium text-sv-dark transition hover:bg-zap-100"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sv-primary/10 text-base">🖼️</span>
                Elegir de la galería
              </button>
              {preview && (
                <button
                  type="button"
                  onClick={handleQuitar}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-base">🗑️</span>
                  Quitar foto actual
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
