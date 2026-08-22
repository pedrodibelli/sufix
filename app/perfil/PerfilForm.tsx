"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/data";
import { RubroChips } from "@/components/RubroChips";
import { ZonaChips } from "@/components/ZonaChips";
import { actualizarPerfil } from "./actions";

export function PerfilForm({
  perfil,
  dark = false,
}: {
  perfil: {
    telefono: string | null;
    zona: string[] | null;
    rubro: string[] | null;
    titular: string | null;
    anos_experiencia: number | null;
  } | null;
  dark?: boolean;
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

  const cardCls = dark
    ? "max-w-lg space-y-4 rounded-2xl border border-white/10 bg-[#162420] p-6"
    : "card max-w-lg space-y-4 p-6";
  const labelCls = dark ? "mb-1.5 block text-sm font-medium text-zap-300" : "label";
  const helpCls = dark ? "mt-1 text-xs text-zap-500" : "mt-1 text-xs text-ink-400";

  // Campos: bloqueados (oscuros) por defecto; iluminados al editar.
  const inputCls = editando
    ? "field"
    : dark
    ? "w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-zap-400"
    : "w-full cursor-not-allowed rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-base text-ink-400";

  return (
    <div className={cardCls}>
      {/* Encabezado con lápiz */}
      <div className="flex items-center justify-between">
        <span className={dark ? "text-sm font-medium text-zap-200" : "text-sm font-medium text-ink-600"}>
          {editando ? "Editando tus datos" : "Datos del perfil"}
        </span>
        {!editando && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              dark
                ? "border-white/15 text-zap-200 hover:bg-white/10"
                : "border-ink-200 text-ink-600 hover:bg-ink-50"
            }`}
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
          <ZonaChips selected={zona} onChange={setZona} dark={dark} />
        ) : (
          <div className={inputCls}>{zona.length > 0 ? zona.join(", ") : "—"}</div>
        )}
      </div>

      <div>
        <label className={labelCls}>Rubro(s) — podés elegir más de uno</label>
        {editando ? (
          <RubroChips selected={rubro} onChange={setRubro} dark={dark} />
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
        <p
          className={`text-sm font-medium ${
            msg.ok
              ? dark ? "text-emerald-400" : "text-emerald-600"
              : dark ? "text-rose-400" : "text-rose-600"
          }`}
        >
          {msg.text}
        </p>
      )}

      {editando && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={cancelar}
            disabled={pending}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
              dark ? "border-white/15 text-zap-200 hover:bg-white/10" : "border-ink-200 text-ink-600 hover:bg-ink-50"
            }`}
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
