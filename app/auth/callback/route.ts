import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export const runtime = "nodejs";

// Vuelta del login con Google (PKCE): cambia el `code` por una sesión real y
// redirige. El botón de Google (components/GoogleButton.tsx) solo se ofrece a
// demandantes — la primera vez que alguien entra por acá y todavía no tiene
// `es_profesional` seteado, lo marcamos como demandante (false) y le
// completamos nombre/apellido con los datos que dio Google. Si ya tenía la
// cuenta armada (técnico o demandante existente), no se toca nada.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const dest = next.startsWith("/") ? next : "/";

  if (code) {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const meta = data.user.user_metadata ?? {};
      if (meta.es_profesional === undefined) {
        const nombreCompleto = ((meta.full_name || meta.name || "") as string).trim();
        const partes = nombreCompleto.split(/\s+/).filter(Boolean);
        const nombre = (meta.given_name as string) || partes[0] || "";
        const apellido = (meta.family_name as string) || partes.slice(1).join(" ") || "";

        await supabase.auth.updateUser({
          data: { ...meta, es_profesional: false, nombre, apellido },
        });
      }
    }
  }

  return NextResponse.redirect(`${origin}${dest}`);
}
