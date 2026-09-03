"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { enviarReporteGeneral } from "./actions";

const TIPOS = [
  {
    value: "tecnico",
    titulo: "Tuve un problema con un técnico",
    detalle: "El trabajo, el trato, o algo que no salió como esperabas.",
  },
  {
    value: "web",
    titulo: "Algo no funciona en el sitio",
    detalle: "Un error, algo que no carga, o información equivocada.",
  },
  {
    value: "sugerencia",
    titulo: "Tengo una sugerencia",
    detalle: "Una idea para mejorar Sufix. Las leemos todas.",
  },
];

export function ReportarForm({ logueado }: { logueado: boolean }) {
  const [tipo, setTipo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Sin cuenta no se puede enviar: este flujo es una conversación, no una
  // alerta anónima — necesitamos poder responder (pedido 2026-09-03).
  if (!logueado) {
    return (
      <div className="card mt-8 p-8 text-center">
        <h2 className="display text-xl text-sv-dark">Necesitás una cuenta</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
          Pedimos que inicies sesión para poder responderte y hacer seguimiento de lo que nos
          cuentes. Es gratis y toma menos de un minuto.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Link href="/ingresar" className="btn-primary sm:px-8">Ingresar</Link>
          <Link href="/registrar" className="btn-ghost sm:px-8">Crear cuenta</Link>
        </div>
        <p className="mt-6 text-[13px] text-ink-400">
          ¿Solo querés avisar que un perfil tiene datos falsos? Eso lo podés hacer sin cuenta, desde
          el perfil del técnico.
        </p>
      </div>
    );
  }

  if (enviado) {
    return (
      <div className="card mt-8 p-10 text-center">
        <h2 className="display text-xl text-sv-dark">Recibido, gracias</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
          Lo vamos a leer y, si hace falta, te escribimos al email de tu cuenta.
        </p>
        <Link href="/" className="btn-primary mt-6 inline-block px-8">Volver al inicio</Link>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <p className="label">¿De qué se trata?</p>
      <div className="mt-2 space-y-2.5">
        {TIPOS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTipo(t.value)}
            aria-pressed={tipo === t.value}
            className={`w-full rounded-2xl border p-4 text-left transition ${
              tipo === t.value
                ? "border-sv-primary bg-sv-primary/10"
                : "border-ink-200 bg-white hover:border-sv-primary/60"
            }`}
          >
            <span className="block text-[15px] font-semibold text-sv-dark">{t.titulo}</span>
            <span className="mt-0.5 block text-[13px] text-ink-500">{t.detalle}</span>
          </button>
        ))}
      </div>

      <label htmlFor="detalle" className="label mt-6 block">Contanos qué pasó</label>
      <textarea
        id="detalle"
        value={detalle}
        onChange={(e) => setDetalle(e.target.value)}
        rows={6}
        maxLength={1500}
        placeholder="Mientras más detalle nos des, mejor podemos ayudarte. Si es sobre un técnico, contanos cuál."
        className="field resize-none"
      />
      <p className="mt-1 text-right text-[12px] text-ink-400">{detalle.length}/1500</p>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          setError("");
          startTransition(async () => {
            const r = await enviarReporteGeneral(tipo, detalle);
            if ("error" in r) setError(r.error);
            else setEnviado(true);
          });
        }}
        className="btn-primary mt-5 w-full disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {isPending ? "Enviando…" : "Enviar"}
      </button>
    </div>
  );
}
