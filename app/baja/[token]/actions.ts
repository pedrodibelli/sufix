"use server";

import { darDeBajaPorToken } from "@/lib/contactantes";

export async function darDeBaja(token: string): Promise<{ ok: true } | { error: string }> {
  const ok = await darDeBajaPorToken(token);
  return ok ? { ok: true } : { error: "No se pudo. Probá de nuevo o escribinos a sufixar@gmail.com." };
}
