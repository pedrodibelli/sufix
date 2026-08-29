"use client";

import { useState, useTransition } from "react";
import { cambiarPassword } from "./actions";

// Cambio de contraseña, disponible para cualquier cuenta (técnico o
// demandante). Pensado sobre todo para el caso de cuentas creadas a mano por
// el equipo con una contraseña temporal (mandada por WhatsApp) — el dueño
// puede entrar y ponerse una propia.
export function CambiarPasswordForm() {
  const [editando, setEditando] = useState(false);
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [pending, startT] = useTransition();
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);

  function limpiar() {
    setActual("");
    setNueva("");
    setConfirmar("");
  }

  function cancelar() {
    limpiar();
    setMsg(null);
    setEditando(false);
  }

  function guardar() {
    setMsg(null);
    if (nueva.length < 8) {
      setMsg({ text: "La contraseña nueva debe tener al menos 8 caracteres." });
      return;
    }
    if (nueva !== confirmar) {
      setMsg({ text: "Las contraseñas nuevas no coinciden." });
      return;
    }
    startT(async () => {
      const r = await cambiarPassword({ passwordActual: actual, passwordNueva: nueva });
      if ("error" in r) {
        setMsg({ text: r.error });
        return;
      }
      limpiar();
      setMsg({ ok: true, text: "Contraseña actualizada ✓" });
      setEditando(false);
    });
  }

  const cardCls = "card space-y-4 p-6";
  const titleCls = "text-sm font-medium text-ink-600";
  const labelCls = "label";
  const editBtnCls = "inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 transition hover:bg-ink-50";
  const cancelBtnCls = "rounded-full border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-50 disabled:opacity-50";
  const msgCls = (ok?: boolean) => `text-sm font-medium ${ok ? "text-emerald-600" : "text-rose-600"}`;

  if (!editando) {
    return (
      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <span className={titleCls}>Contraseña</span>
          <button type="button" onClick={() => setEditando(true)} className={editBtnCls}>
            🔒 Cambiar
          </button>
        </div>
        {msg && <p className={msgCls(msg.ok)}>{msg.text}</p>}
      </div>
    );
  }

  return (
    <div className={cardCls}>
      <span className={titleCls}>Cambiar contraseña</span>

      <div>
        <label className={labelCls}>Contraseña actual</label>
        <input
          type="password"
          className="field"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>
      <div>
        <label className={labelCls}>Contraseña nueva</label>
        <input
          type="password"
          className="field"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className={labelCls}>Confirmar contraseña nueva</label>
        <input
          type="password"
          className="field"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          placeholder="Repetí la contraseña nueva"
          autoComplete="new-password"
        />
      </div>

      {msg && <p className={msgCls(msg.ok)}>{msg.text}</p>}

      <div className="flex gap-2">
        <button type="button" onClick={cancelar} disabled={pending} className={cancelBtnCls}>
          Cancelar
        </button>
        <button type="button" onClick={guardar} disabled={pending} className="btn-primary disabled:opacity-50">
          {pending ? "Guardando…" : "Guardar contraseña"}
        </button>
      </div>
    </div>
  );
}
