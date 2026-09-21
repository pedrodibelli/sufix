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
  variant = "campo",
  menuAlign = "left",
}: {
  value: string;
  onChange: (v: string) => void;
  options: CustomSelectOption[];
  placeholder: string;
  // El cuadrito de ícono a la izquierda del botón (ya lo maneja el padre:
  // en Oficio cambia según la selección, en Zona es siempre el pin fijo).
  triggerIcon: React.ReactNode;
  // "campo": el look original, un input alto con el ícono en un cuadrito —
  // es el del buscador del hero, donde hay lugar de sobra.
  // "pill" (2026-09-20): versión chata para la barra de filtro sticky del
  // directorio en mobile, donde el alto es lo más caro que hay. Sin cuadrito
  // de ícono, y cuando hay algo elegido el botón se pinta de verde para que
  // se vea de un vistazo que el listado está filtrado.
  variant?: "campo" | "pill";
  // Solo para "pill": de qué lado se ancla el menú. Una pastilla es angosta
  // (media pantalla), así que el menú crece más que ella — anclado a la
  // izquierda se sale por el borde derecho cuando la pastilla ya está a la
  // derecha. El padre dice de qué lado está cada una.
  menuAlign?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [activo, setActivo] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Ojo con el value "": varias listas traen una opción "Todos los oficios"
  // con value "" para poder limpiar el filtro. Esa opción sirve DENTRO del
  // menú, pero como texto del botón es peor que el placeholder (más larga,
  // se corta en una pastilla angosta), así que con value vacío se muestra
  // siempre el placeholder.
  const seleccionada = value ? options.find((o) => o.value === value) : undefined;
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

  const esPill = variant === "pill";
  const activoPill = esPill && !!seleccionada;

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className={
          esPill
            ? `flex w-full items-center gap-1.5 rounded-full border px-3 py-2 text-left transition-colors ${
                activoPill
                  ? "border-sv-primary bg-sv-mint text-sv-dark"
                  : "border-sv-dark/12 bg-white text-sv-dark"
              }`
            : "flex w-full items-center gap-2.5 rounded-2xl border border-sv-dark/10 bg-white px-3.5 py-1 text-left"
        }
      >
        <span
          className={
            esPill
              ? "flex h-4 w-4 shrink-0 items-center justify-center text-sv-primary"
              : "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sv-mint p-2 text-sv-primary"
          }
        >
          {triggerIcon}
        </span>
        <span
          className={
            esPill
              ? "min-w-0 flex-1 truncate text-[13.5px] font-semibold"
              : "min-w-0 flex-1 truncate py-2.5 text-[14.5px] font-medium text-sv-dark"
          }
        >
          {seleccionada ? seleccionada.label : placeholder}
        </span>
        <IconChevronDown
          className={`shrink-0 transition-transform duration-200 ${esPill ? "h-3.5 w-3.5" : "h-4 w-4"} ${
            activoPill ? "text-sv-primary" : "text-ink-400"
          } ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          className={`animate-dropdown absolute top-[calc(100%+6px)] z-30 max-h-[22rem] overflow-y-auto rounded-2xl border border-sv-dark/10 bg-white p-1.5 shadow-[0_20px_45px_-20px_rgba(29,46,32,0.35)] ${
            esPill
              ? `w-max min-w-full max-w-[calc(100vw-2.5rem)] ${menuAlign === "right" ? "right-0" : "left-0"}`
              : "left-0 right-0"
          }`}
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
                    ? "bg-sv-primary/20 text-sv-dark"
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
