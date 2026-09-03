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
