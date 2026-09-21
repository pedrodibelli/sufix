// URL pública del sitio, saneada.
//
// El saneo no es paranoia (2026-09-20): `NEXT_PUBLIC_APP_URL` se cargó una vez
// en Vercel pipeando el valor desde PowerShell, y PowerShell le metió un BOM
// (U+FEFF) adelante. El valor "parecía" correcto en todos lados, pero el
// sitemap salía con `<loc>﻿https://sufix.com.ar/...</loc>` y robots.txt
// apuntaba a un sitemap con esa misma basura — o sea, links rotos para Google
// sin ningún error visible. Un BOM es invisible en un panel y en un `echo`.
const CRUDO = process.env.NEXT_PUBLIC_APP_URL ?? "https://sufix.com.ar";

export const APP_URL = CRUDO
  .replace(/^﻿/, "") // BOM al principio
  .trim()
  .replace(/\/$/, ""); // barra final, para poder concatenar `${APP_URL}/algo`
