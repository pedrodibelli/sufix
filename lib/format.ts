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
