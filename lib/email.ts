// Validación del mail que se pide antes de abrir WhatsApp (2026-10-22).
// Se usa de los dos lados: en el pop-up (para avisar antes de seguir) y en el
// servidor (para no confiar en lo que mande el navegador).

export function normalizarEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function emailValido(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/.test(email);
}

// Dominios que usa casi todo el mundo acá. Si lo escrito se parece mucho a uno
// de estos pero no es igual, casi seguro es un error de tipeo ("gmial.com",
// "hotmail.con"). Importa más de lo que parece: un mail mal escrito no sólo
// se pierde, además REBOTA, y cada rebote le baja la reputación a
// sufixapp.com — que es nuevo y ya tuvo mails cayendo en spam.
const DOMINIOS_COMUNES = [
  "gmail.com",
  "hotmail.com",
  "hotmail.com.ar",
  "outlook.com",
  "outlook.com.ar",
  "live.com",
  "live.com.ar",
  "yahoo.com",
  "yahoo.com.ar",
  "icloud.com",
  "fibertel.com.ar",
  "mail.com", // existe de verdad: está acá para no "corregirlo" a gmail.com
];

// Errores muy argentinos que la distancia no agarra: agregarle ".ar" a un
// dominio que no lo tiene ("gmail.com.ar" está a 3 letras de "gmail.com").
const CORRECCIONES: Record<string, string> = {
  "gmail.com.ar": "gmail.com",
  "gmail.ar": "gmail.com",
  "icloud.com.ar": "icloud.com",
};

/**
 * Si el dominio parece un error de tipeo de uno común, devuelve el mail
 * corregido para sugerirlo ("¿Quisiste decir…?"). Es sólo una sugerencia:
 * nunca bloquea, porque hay dominios reales parecidos a los comunes.
 */
export function sugerirEmail(email: string): string | null {
  const arroba = email.lastIndexOf("@");
  if (arroba < 1) return null;
  const usuario = email.slice(0, arroba);
  const dominio = email.slice(arroba + 1);
  if (!dominio || DOMINIOS_COMUNES.includes(dominio)) return null;
  if (CORRECCIONES[dominio]) return `${usuario}@${CORRECCIONES[dominio]}`;

  let mejor: string | null = null;
  let mejorDistancia = Infinity;
  for (const d of DOMINIOS_COMUNES) {
    const dist = distancia(dominio, d);
    if (dist < mejorDistancia) {
      mejor = d;
      mejorDistancia = dist;
    }
  }
  // Hasta 2 cambios: "gmial.com" (1), "gmai.co" (2). Más que eso ya es otro
  // dominio, no un dedo que se resbaló.
  return mejor && mejorDistancia <= 2 ? `${usuario}@${mejor}` : null;
}

// Distancia de Levenshtein: cuántas letras hay que cambiar, agregar o sacar
// para pasar de una palabra a la otra.
function distancia(a: string, b: string): number {
  const fila = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = fila[0];
    fila[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const arriba = fila[j];
      fila[j] = Math.min(fila[j] + 1, fila[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = arriba;
    }
  }
  return fila[b.length];
}
