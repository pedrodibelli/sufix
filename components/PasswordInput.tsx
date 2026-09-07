"use client";

import { useState } from "react";

// Campo de contraseña con ojo para ver lo que se escribe (2026-09-07).
//
// Sin esto, escribir una contraseña a ciegas en el celular es la causa número
// uno de "no me anda la contraseña": se equivocan al tipear, no lo ven, y
// vuelven a intentar con el mismo error. Se usa en registrar, ingresar,
// cambiar contraseña y restablecer — todos los campos de contraseña de la app.
export function PasswordInput({
  value,
  onChange,
  placeholder,
  autoComplete,
  id,
  required,
  minLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  id?: string;
  required?: boolean;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className="field pr-11"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        // tabIndex -1 para no interrumpir el salto entre campos con Tab
        tabIndex={-1}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-zap-100 hover:text-sv-dark"
      >
        {visible ? (
          // Ojo tachado
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden>
            <path d="M3 3l18 18" />
            <path d="M10.6 10.7a2 2 0 0 0 2.8 2.8" />
            <path d="M9.4 5.2A9.5 9.5 0 0 1 12 4.9c5 0 8.4 4 9.3 6.1a1 1 0 0 1 0 .8 13 13 0 0 1-2.4 3.4" />
            <path d="M6.3 6.8A12.6 12.6 0 0 0 2.7 11a1 1 0 0 0 0 .8c.9 2.1 4.3 6.1 9.3 6.1a9.7 9.7 0 0 0 3.9-.8" />
          </svg>
        ) : (
          // Ojo abierto
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden>
            <path d="M2.7 11.6a1 1 0 0 1 0-.8C3.6 8.7 7 4.7 12 4.7s8.4 4 9.3 6.1a1 1 0 0 1 0 .8c-.9 2.1-4.3 6.1-9.3 6.1s-8.4-4-9.3-6.1Z" />
            <circle cx="12" cy="11.2" r="2.6" />
          </svg>
        )}
      </button>
    </div>
  );
}
