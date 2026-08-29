"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, ZONES } from "@/lib/data";
import { IconMapPin } from "@/components/icons";

// Buscador destacado del hero (rediseño 2026-08-28, landing nueva): oficio +
// zona, separado del buscador con autocompletado de texto libre que ya vive
// más abajo en la sección de técnicos (TecnicosSearchBar). Los dos navegan
// al mismo lugar (querystring tecQ/tecZona sobre "/"), así que comparten el
// mismo filtro real en app/page.tsx — este es solo una entrada más directa
// desde arriba de la página.
export function HeroSearchCard() {
  const router = useRouter();
  const [oficio, setOficio] = useState("");
  const [zona, setZona] = useState("");

  function buscar() {
    const sp = new URLSearchParams();
    if (oficio) sp.set("tecQ", oficio);
    if (zona) sp.set("tecZona", zona);
    const s = sp.toString();
    router.push(`/${s ? `?${s}` : ""}#tecnicos`);
  }

  return (
    <div className="relative z-10 rounded-[28px] border border-sv-dark/10 bg-[#FBF8EF] p-6 shadow-[0_26px_60px_-30px_rgba(29,46,32,0.3)]">
      <h3 className="display text-lg text-sv-dark">Contanos qué necesitás</h3>

      <div className="mt-4">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">Oficio</label>
        <div className="flex items-center gap-2.5 rounded-2xl border border-sv-dark/10 bg-white px-3.5 py-1">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sv-mint text-base">🔧</span>
          <select
            value={oficio}
            onChange={(e) => setOficio(e.target.value)}
            className="w-full appearance-none bg-transparent py-2.5 pr-2 text-[14.5px] font-medium text-sv-dark focus:outline-none"
          >
            <option value="">Cualquier oficio</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.name}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3.5">
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">Zona</label>
        <div className="flex items-center gap-2.5 rounded-2xl border border-sv-dark/10 bg-white px-3.5 py-1">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sv-mint">
            <IconMapPin className="h-4 w-4 text-sv-dark" />
          </span>
          <select
            value={zona}
            onChange={(e) => setZona(e.target.value)}
            className="w-full appearance-none bg-transparent py-2.5 pr-2 text-[14.5px] font-medium text-sv-dark focus:outline-none"
          >
            <option value="">Cualquier zona</option>
            <option value="CABA">Toda CABA</option>
            {ZONES.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </div>
      </div>

      <button type="button" onClick={buscar} className="btn-primary mt-4 w-full text-center">
        Buscar técnicos
      </button>
    </div>
  );
}
