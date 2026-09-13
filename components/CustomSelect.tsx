"use client";

import { useEffect, useRef, useState } from "react";
import { IconCheck, IconChevronDown } from "@/components/icons";

export type CustomSelectOption = {
  value: string;
  label: string;
  // Ícono opcional por opción (los de Oficio lo usan; Zona no).
  icon?: React.ReactNode;
};

// Reemplazo del <select> nativo (2026-09-13): el menú que abre un <select> lo
// dibuja el sistema operativo — no hay forma de tocarle la tipografía, el
// radio de los bordes ni el celeste de "seleccionado" con CSS. Se ve
// genérico, distinto al resto del sitio.
//
// Este componente arma esa lista a mano con nuestros propios estilos, así
// abre con la misma caja, tipografía y verde de acento que usa todo Sufix.
// De paso permite algo que un <option> nativo no puede: mostrar el ícono de
// línea de cada oficio dentro del menú, no solo en el botón cerrado.
//
// Accesibilidad: rol combobox/listbox, flechas para moverse, Enter/Espacio
// para elegir, Escape para cerrar, y cierra solo al tocar afuera.
export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  triggerIcon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: CustomSelectOption[];
  placeholder: string;
  // El cuadrito de ícono a la izquierda del botón (ya lo maneja el padre:
  // en Oficio cambia según la selección, en Zona es siempre el pin fijo).
  triggerIcon: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [activo, setActivo] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const seleccionada = options.find((o) => o.value === value);
  const indiceActual = Math.max(0, options.findIndex((o) => o.value === value));

  useEffect(() => {
    if (open) setActivo(indiceActual);
  }, [open, indiceActual]);

  useEffect(() => {
    if (!open) return;
    const fuera = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [open]);

  // Mantiene la opción resaltada visible al navegar con flechas.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-idx="${activo}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activo, open]);

  function elegir(v: string) {
    onChange(v);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setActivo((i) => Math.min(i + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActivo((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); elegir(options[activo].value); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
  }

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className="flex w-full items-center gap-2.5 rounded-2xl border border-sv-dark/10 bg-white px-3.5 py-1 text-left"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sv-mint p-2 text-sv-primary">
          {triggerIcon}
        </span>
        <span className="min-w-0 flex-1 truncate py-2.5 text-[14.5px] font-medium text-sv-dark">
          {seleccionada ? seleccionada.label : placeholder}
        </span>
        <IconChevronDown
          className={`h-4 w-4 shrink-0 text-ink-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          className="animate-dropdown absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-72 overflow-y-auto rounded-2xl border border-sv-dark/10 bg-white p-1.5 shadow-[0_20px_45px_-20px_rgba(29,46,32,0.35)]"
        >
          {options.map((o, i) => {
            const esElegida = o.value === value;
            const esActiva = i === activo;
            return (
              <button
                key={o.value || "_todos"}
                type="button"
                data-idx={i}
                role="option"
                aria-selected={esElegida}
                onMouseEnter={() => setActivo(i)}
                onClick={() => elegir(o.value)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[14px] transition-colors ${
                  esElegida
                    ? "bg-sv-mint font-semibold text-sv-dark"
                    : esActiva
                    ? "bg-zap-100 text-sv-dark"
                    : "text-ink-600"
                }`}
              >
                {o.icon && <span className="flex h-5 w-5 shrink-0 items-center justify-center text-sv-primary">{o.icon}</span>}
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                {esElegida && <IconCheck className="h-4 w-4 shrink-0 text-sv-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
