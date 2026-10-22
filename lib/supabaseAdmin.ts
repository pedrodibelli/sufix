import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente con service role: saltea RLS. SOLO para código de servidor (server
// actions, route handlers, server components) — nunca importarlo desde un
// componente "use client": la key se filtraría al navegador.
//
// Devuelve null si falta la env var, para que quien lo use pueda degradar en
// vez de romper (mismo criterio que enviarMail() con RESEND_API_KEY).
export function clienteAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
