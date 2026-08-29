"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/data";
import { RubroChips } from "@/components/RubroChips";
import { ZonaChips } from "@/components/ZonaChips";
import { actualizarPerfil } from "./actions";

export function PerfilForm({
  perfil,
}: {
  perfil: {
    telefono: string | null;
    zona: string[] | null;
    rubro: string[] | null;
    titular: string | null;
    anos_experiencia: number | null;
  } | null;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [telefono, setTelefono] = useState(perfil?.telefono ?? "");
  const [zona, setZona] = useState<string[]>(perfil?.zona ?? []);
  const [rubro, setRubro] = useState<string[]>(perfil?.rubro ?? []);
  const [titular, setTitular] = useState(perfil?.titular ?? "");
  const [anosExperiencia, setAnosExperiencia] = useState(perfil?.anos_experiencia?.toString() ?? "");
  const [pending, startT] = useTransition();
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);

  function guardar() {
    setMsg(null);
    startT(async () => {
      const r = await actualizarPerfil({ telefono, zona, rubro, titular, anosExperiencia });
      if ("error" in r) {
        setMsg({ text: r.error });
        return;
      }
      setMsg({ ok: true, text: "Cambios guardados ✓" });
      setEditando(false);
      router.refresh();
    });
  }

  function cancelar() {
    setTelefono(perfil?.telefono ?? "");
    setZona(perfil?.zona ?? []);
    setRubro(perfil?.rubro ?? []);
    setTitular(perfil?.titular ?? "");
    setAnosExperiencia(perfil?.anos_experiencia?.toString() ?? "");
    setMsg(null);
    setEditando(false);
  }

  const cardCls = "card max-w-lg space-y-4 p-6";
  const labelCls = "label";
  const helpCls = "mt-1 text-xs text-ink-400";

  // Campos: bloqueados por defecto; iluminados al editar.
  const inputCls = editando
    ? "field"
    : "w-full cursor-not-allowed rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-base text-ink-400";

  return (
    <div className={cardCls}>
      {/* Encabezado con lápiz */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-600">
          {editando ? "Editando tus datos" : "Datos del perfil"}
        </span>
        {!editando && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 transition hover:bg-ink-50"
          >
            ✏️ Editar
          </button>
        )}
      </div>

      <div>
        <label className={labelCls}>Frase corta para tu tarjeta</label>
        <input
          className={inputCls}
          disabled={!editando}
          value={titular}
          onChange={(e) => setTitular(e.target.value)}
          placeholder="Ej: Electricista matriculado, gasista matriculado"
          maxLength={80}
        />
        <p className={helpCls}>
          Se muestra debajo de tu nombre en el directorio. Si la dejás vacía, mostramos tus rubros.
        </p>
      </div>

      <div>
        <label className={labelCls}>Años de experiencia</label>
        <input
          type="number"
          min={0}
          max={80}
          className={inputCls}
          disabled={!editando}
          value={anosExperiencia}
          onChange={(e) => setAnosExperiencia(e.target.value)}
          placeholder="Ej: 12"
        />
        <p className={helpCls}>Se muestra en tu perfil público. Opcional.</p>
      </div>

      <div>
        <label className={labelCls}>Teléfono (WhatsApp)</label>
        <input
          className={inputCls}
          disabled={!editando}
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="+54 9 11 1234 5678"
        />
        <p className={helpCls}>
          Es el contacto que se le desbloquea al cliente cuando paga. Mantenelo al día.
        </p>
      </div>

      <div>
        <label className={labelCls}>Zona(s) — podés elegir más de una</label>
        {editando ? (
          <ZonaChips selected={zona} onChange={setZona} />
        ) : (
          <div className={inputCls}>{zona.length > 0 ? zona.join(", ") : "—"}</div>
        )}
      </div>

      <div>
        <label className={labelCls}>Rubro(s) — podés elegir más de uno</label>
        {editando ? (
          <RubroChips selected={rubro} onChange={setRubro} />
        ) : (
          <div className={inputCls}>
            {rubro.length > 0
              ? rubro
                  .map((slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug)
                  .join(", ")
              : "—"}
          </div>
        )}
      </div>

      {msg && (
        <p className={`text-sm font-medium ${msg.ok ? "text-emerald-600" : "text-rose-600"}`}>
          {msg.text}
        </p>
      )}

      {editando && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={cancelar}
            disabled={pending}
            className="rounded-full border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={guardar}
            className="btn-primary disabled:opacity-50"
          >
            {pending ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      )}
    </div>
  );
}
