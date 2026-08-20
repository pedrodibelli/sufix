"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/Avatar";
import { actualizarAvatar } from "@/app/perfil/actions";

const MAX_MB = 5;

export function AvatarUpload({
  userId,
  initials,
  avatarUrl,
  size = 64,
  dark = false,
}: {
  userId: string;
  initials: string;
  avatarUrl: string | null;
  size?: number;
  dark?: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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

  const editBtnCls = dark
    ? "border-white/20 bg-[#0e1a17] text-zap-100 hover:bg-white/10"
    : "border-white bg-white text-ink-600 hover:bg-ink-50";

  return (
    <div className="relative inline-flex shrink-0">
      <Avatar
        url={preview}
        initials={initials}
        size={size}
        className={uploading ? "opacity-50" : ""}
        textClass="font-display"
      />

      {uploading && (
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        </span>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        aria-label="Cambiar foto de perfil"
        className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs shadow-sm transition disabled:opacity-50 ${editBtnCls}`}
      >
        📷
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />

      {error && (
        <p className="absolute left-1/2 top-full mt-2 w-48 -translate-x-1/2 rounded-lg bg-rose-50 px-3 py-1.5 text-center text-[11px] font-medium text-rose-600 shadow-sm">
          {error}
        </p>
      )}
    </div>
  );
}
