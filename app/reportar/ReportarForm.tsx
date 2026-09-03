"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { IconBandera } from "@/components/icons";
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

// El encabezado se renderiza acá y no en page.tsx porque la pantalla de
// "gracias" tiene que reemplazarlo: si quedara arriba, el usuario leería
// "¿Tuviste un problema? Contanos qué pasó" justo después de haber
// contado qué pasó.
function Intro() {
  return (
    <>
      <div className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 p-2.5 text-rose-500">
          <IconBandera />
        </span>
        <p className="text-[13px] font-bold uppercase tracking-wider text-sv-primary">
          Reportar
        </p>
      </div>
      <h1 className="display mt-3 text-3xl leading-tight text-sv-dark sm:text-4xl">
        ¿Tuviste un problema?
      </h1>
      <p className="mt-3.5 text-base leading-relaxed text-ink-500">
        Contanos qué pasó. Lo lee una persona de nuestro equipo, y así mantenemos el
        directorio limpio y el sitio funcionando bien.
      </p>
    </>
  );
}

export function ReportarForm({ logueado }: { logueado: boolean }) {
  const [tipo, setTipo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // Enviado: la pantalla queda SOLO con el agradecimiento, centrado y en
  // grande. Sin encabezado, sin tarjeta, sin repetir la bajada de arriba
  // (pedido explícito 2026-09-03 tras probarlo).
  if (enviado) {
    return (
      <div className="flex min-h-[52vh] flex-col items-center justify-center text-center">
        <h1 className="display text-3xl leading-tight text-sv-dark sm:text-4xl">
          ¡Gracias por tu reporte!
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-500">
          Lo vamos a leer y, si hace falta, te escribimos al email de tu cuenta.
        </p>
        <Link href="/" className="btn-primary mt-8 inline-block px-8">
          Volver al inicio
        </Link>
      </div>
    );
  }

  // Sin cuenta no se puede enviar: este flujo es una conversación, no una
  // alerta anónima — necesitamos poder responder (pedido 2026-09-03).
  if (!logueado) {
    return (
      <>
        <Intro />
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
      </>
    );
  }

  return (
    <>
      <Intro />
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
    </>
  );
}
