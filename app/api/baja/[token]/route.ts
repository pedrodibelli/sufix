import { darDeBajaPorToken } from "@/lib/contactantes";

// Baja de un clic (RFC 8058): es la URL del encabezado List-Unsubscribe de
// los mails a clientes. Gmail y otros la llaman por POST cuando la persona
// toca "Anular suscripción" en su propia interfaz, sin pasar por la web.
// Un GET (alguien que pegó la URL en el navegador) va a la página con botón.

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const ok = await darDeBajaPorToken(token);
  return new Response(ok ? "ok" : "no encontrado", { status: ok ? 200 : 404 });
}

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return Response.redirect(new URL(`/baja/${token}`, request.url), 303);
}
