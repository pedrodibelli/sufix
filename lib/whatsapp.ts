// Mensaje precargado del botón "Contactar por WhatsApp".
//
// El rubro se nombra SOLO si sabemos por cuál vino el usuario (2026-09-04).
// Antes se usaba siempre el primero de la lista del técnico: David Ochoa
// tiene cargado "Aire acondicionado, Plomería, Electricidad", así que si
// entrabas desde /categoria/plomeria por una pérdida de agua, el mensaje
// igual decía "me interesa tu servicio de Aire acondicionado" y él recibía
// una consulta sobre otra cosa.
//
// Desde un oficio (/categoria/[slug], o una tarjeta abierta desde ahí) se
// nombra ese oficio. Desde la home, donde el técnico puede tener cinco
// rubros y no hay forma de saber cuál necesita el que escribe, no se nombra
// ninguno: "me interesa tu servicio" a secas.
export function mensajeWhatsApp(nombre: string, rubroNombre?: string | null): string {
  const primerNombre = nombre.split(" ").filter(Boolean)[0] ?? nombre;
  const servicio = rubroNombre ? ` de ${rubroNombre}` : "";
  return `¡Hola ${primerNombre}! Te encontré en Sufix, me interesa tu servicio${servicio}. ¿Estás disponible?`;
}

// Normaliza un teléfono argentino al formato que necesita wa.me (2026-09-07).
//
// El link de WhatsApp tiene que funcionar SIEMPRE, se haya cargado el número
// como se haya cargado. Para móviles argentinos wa.me exige 54 + 9 + área +
// número (13 dígitos); sin ese 9 el link abre un chat vacío o directamente
// falla, y el técnico nunca se entera de que lo quisieron contactar.
//
// Se encontraron tres formas distintas cargadas a mano: 13 dígitos correctos,
// 12 sin el 9 (+541136410584) y 10 sin nada de prefijo (1135628854).
//
// Devuelve null si no se puede completar con certeza, para no fabricar un
// número que no existe: es mejor no mostrar el botón que mandar a un chat
// equivocado.
export function telefonoWhatsApp(raw?: string | null): string | null {
  const d = (raw ?? "").replace(/\D/g, "");
  if (!d) return null;
  if (d.length === 13 && d.startsWith("549")) return d;           // ya está bien
  if (d.length === 12 && d.startsWith("54")) return "549" + d.slice(2); // falta el 9
  if (d.length === 10) return "549" + d;                          // área + número pelado
  if (d.length === 11 && d.startsWith("9")) return "54" + d;       // falta el país
  return null;
}
