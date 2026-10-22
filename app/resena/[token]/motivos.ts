// Por qué no contrató al técnico (respuesta al mail de seguimiento). Vive
// aparte de actions.ts porque un archivo "use server" sólo puede exportar
// funciones. Lo usan el formulario y el resumen de /admin.
export const MOTIVOS_NO_CONTRATADO = [
  { value: "no_respondio", label: "No me respondió" },
  { value: "precio", label: "Me pareció caro" },
  { value: "otro_tecnico", label: "Elegí a otro técnico" },
  { value: "lo_resolvi", label: "Lo resolví de otra forma" },
  { value: "otro", label: "Otro motivo" },
] as const;
