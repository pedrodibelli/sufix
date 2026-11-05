// Normaliza nombres para mostrar ("JUAN PEREZ", "juan perez" -> "Juan Perez")
// sin tocar el dato guardado — el técnico puede haberlo escrito en cualquier
// combinación de mayúsculas/minúsculas, esto es solo para que se vea prolijo
// y consistente en toda la web.
//
// Desde 2026-11-05 respeta lo que ya viene bien escrito, porque las marcas
// cargadas por el equipo se rompían: antes pasaba todo a minúscula, y "TKD
// Electricidad" salía "Tkd Electricidad". Ahora, palabra por palabra:
// - toda en minúscula -> mayúscula inicial ("lucas" -> "Lucas");
// - toda en mayúscula -> mayúscula inicial ("ROSALINO" -> "Rosalino"),
//   salvo una sigla corta (hasta 4 letras) en un texto que no está entero en
//   mayúscula: "TKD Electricidad" queda igual, "JUAN PEREZ" no;
// - mezcla ("ColorPro", "McKenzie") -> tal cual.
// Las palabras de unión van en minúscula si no son la primera ("Cerrajería
// del Valle", "Pintura en Altura C y A").
const UNIONES = new Set(["de", "del", "la", "las", "los", "el", "y", "e", "en", "a"]);

export function toTitleCase(texto: string): string {
  const limpio = texto.replace(/\s+/g, " ").trim();
  const todoMayuscula = limpio === limpio.toUpperCase();
  return limpio
    .split(" ")
    .map((palabra, i) => {
      const min = palabra.toLowerCase();
      // Una letra sola en mayúscula en un texto mixto es una inicial, no una
      // unión: la "A" de "C y A".
      const inicial = palabra.length === 1 && palabra !== min && !todoMayuscula;
      if (i > 0 && UNIONES.has(min) && !inicial) return min;
      const letras = palabra.replace(/[^\p{L}]/gu, "");
      if (!letras) return palabra;
      const esMayuscula = letras === letras.toUpperCase() && letras !== letras.toLowerCase();
      if (esMayuscula && !todoMayuscula && letras.length <= 4) return palabra;
      // La primera LETRA, no el primer carácter: '"SALERNO"' -> '"Salerno"'.
      if (palabra === min || esMayuscula) return min.replace(/\p{L}/u, (c) => c.toUpperCase());
      return palabra;
    })
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
