"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ZONES, CATEGORIES } from "@/lib/data";
import { actualizarPerfil } from "./actions";

export function PerfilForm({
  perfil,
}: {
  perfil: { telefono: string | null; zona: string | null; rubro: string | null } | null;
}) {
  const router = useRouter();
  const [telefono, setTelefono] = useState(perfil?.telefono ?? "");
  const [zona, setZona] = useState(perfil?.zona ?? "");
  const [rubro, setRubro] = useState(perfil?.rubro ?? "");
  const [pending, startT] = useTransition();
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);

  function guardar() {
    setMsg(null);
    startT(async () => {
      const r = await actualizarPerfil({ telefono, zona, rubro });
      if ("error" in r) {
        setMsg({ text: r.error });
        return;
      }
      setMsg({ ok: true, text: "Cambios guardados ✓" });
      router.refresh();
    });
  }

  return (
    <div className="card max-w-lg space-y-4 p-6">
      <div>
        <label className="label">Teléfono (WhatsApp)</label>
        <input
          className="field"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="+54 9 11 1234 5678"
        />
        <p className="mt-1 text-xs text-ink-400">
          Es el contacto que se le desbloquea al cliente cuando paga. Mantenelo al día.
        </p>
      </div>

      <div>
        <label className="label">Zona</label>
        <select className="field" value={zona} onChange={(e) => setZona(e.target.value)}>
          <option value="">Elegí una zona</option>
          {ZONES.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Rubro</label>
        <select className="field" value={rubro} onChange={(e) => setRubro(e.target.value)}>
          <option value="">Elegí un rubro</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {msg && (
        <p className={`text-sm font-medium ${msg.ok ? "text-emerald-600" : "text-rose-600"}`}>
          {msg.text}
        </p>
      )}

      <button
        type="button"
        disabled={pending}
        onClick={guardar}
        className="btn-primary disabled:opacity-50"
      >
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </div>
  );
}
