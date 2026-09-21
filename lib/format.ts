// Normaliza nombres para mostrar ("JUAN PEREZ", "juan perez" -> "Juan Perez")
// sin tocar el dato guardado — el técnico puede haberlo escrito en cualquier
// combinación de mayúsculas/minúsculas, esto es solo para que se vea prolijo
// y consistente en toda la web. No maneja excepciones de preposiciones
// ("de la", "del") a propósito: es mucho laburo para un beneficio marginal,
// y el resultado sin eso ya es muchísimo mejor que el texto tal cual se
// escribió.
export function toTitleCase(texto: string): string {
  return texto
    .toLowerCase()
    .split(" ")
    .map((palabra) => (palabra ? palabra[0].toUpperCase() + palabra.slice(1) : palabra))
    .join(" ");
}

// Iniciales para el avatar cuando el técnico no subió foto.
//
// Parece un one-liner y lo era —
// `nombre.split(" ").map((w) => w[0]).join("").slice(0, 2)` — pero `w[0]`
// devuelve la primera UNIDAD UTF-16, no el primer carácter. En un nombre que
// arranca fuera del BMP (hay tres en la base: "𝗣𝗟𝗢𝗠𝗘𝗥𝗢" escrito con la
// tipografía negrita de Unicode, y dos que empiezan con emoji) eso devolvía
// media pareja sustituta: un carácter roto (el rombo con el signo de
// pregunta) en la tarjeta, y además ROMPÍA LA HIDRATACIÓN de React en
// /categoria — el servidor y el navegador serializan ese medio carácter
// distinto, así que React descartaba el HTML del servidor y volvía a renderizar la grilla
// entera en el cliente (error #418 en producción, 2026-09-21).
//
// Además se saltean los símbolos: de cada palabra se toma su primera letra o
// número, así "🟠WOLFCOLORS Pintores" da "WP" y no "🟠P".
export function iniciales(texto: string): string {
  const esLetraONumero = (c: string) => /\p{L}|\p{N}/u.test(c);

  const letras = [...texto.trim().split(/\s+/)]
    .map((palabra) => [...palabra].find(esLetraONumero))
    .filter((c): c is string => !!c);

  // Si el nombre es puro símbolo no hay inicial posible: mejor el primer
  // carácter entero (nunca medio) que un círculo vacío.
  if (letras.length === 0) return [...texto.trim()][0] ?? "";

  return letras.slice(0, 2).join("").toUpperCase();
}
