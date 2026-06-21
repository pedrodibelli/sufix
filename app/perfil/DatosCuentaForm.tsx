"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { actualizarDatosCuenta } from "./actions";

export function DatosCuentaForm({
  nombre: nombreInicial,
  apellido: apellidoInicial,
}: {
  nombre: string;
  apellido: string;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(nombreInicial);
  const [apellido, setApellido] = useState(apellidoInicial);
  const [pending, startT] = useTransition();
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);

  function guardar() {
    setMsg(null);
    startT(async () => {
      const r = await actualizarDatosCuenta({ nombre, apellido });
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
    setNombre(nombreInicial);
    setApellido(apellidoInicial);
    setMsg(null);
    setEditando(false);
  }

  const inputCls = editando
    ? "field"
    : "w-full cursor-not-allowed rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-base text-ink-400";

  return (
    <div className="card space-y-4 p-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink-600">
          {editando ? "Editando tus datos" : "Datos de la cuenta"}
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Nombre</label>
          <input className={inputCls} disabled={!editando} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div>
          <label className="label">Apellido</label>
          <input className={inputCls} disabled={!editando} value={apellido} onChange={(e) => setApellido(e.target.value)} />
        </div>
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
          <button type="button" onClick={guardar} disabled={pending} className="btn-primary disabled:opacity-50">
            {pending ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      )}
    </div>
  );
}
