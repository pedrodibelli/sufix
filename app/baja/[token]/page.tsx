import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { clienteAdmin } from "@/lib/supabaseAdmin";
import { esUuid } from "@/lib/contactantes";
import { BajaBoton } from "./BajaBoton";

// Link "Darme de baja" del pie de los mails a clientes (2026-10-22, ver
// CLAUDE.md §24). Pide un clic de confirmación en vez de dar de baja al abrir
// la página: los antivirus de algunos mails abren los links solos, y daríamos
// de baja a gente que nunca lo pidió. El botón "Anular suscripción" de Gmail
// no pasa por acá: pega directo a /api/baja/[token] por POST.

export const metadata: Metadata = {
  title: "Dejar de recibir mails — Sufix",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// "juanperez@gmail.com" → "ju••••••@gmail.com": que la persona reconozca su
// mail sin que el link se lo muestre entero a cualquiera que lo tenga.
function enmascarar(email: string): string {
  const [usuario, dominio] = email.split("@");
  return `${usuario.slice(0, 2)}${"•".repeat(Math.min(Math.max(usuario.length - 2, 3), 6))}@${dominio}`;
}

export default async function BajaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = clienteAdmin();
  const { data: persona } = admin && esUuid(token)
    ? await admin.from("contactantes").select("email, baja_at").eq("token_baja", token).maybeSingle()
    : { data: null };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FBF8EF]">
        <section className="container-home py-16">
          <div className="mx-auto max-w-md text-center">
            {!persona ? (
              <>
                <h1 className="display text-2xl text-sv-dark">Este link no es válido</h1>
                <p className="mt-3 text-[15px] text-ink-600">
                  Probá tocándolo de nuevo desde el mail, o escribinos a{" "}
                  <a href="mailto:sufixar@gmail.com" className="font-medium text-sv-primary underline underline-offset-2">
                    sufixar@gmail.com
                  </a>{" "}
                  y te damos de baja a mano.
                </p>
              </>
            ) : persona.baja_at ? (
              <>
                <h1 className="display text-2xl text-sv-dark">Ya no te vamos a escribir</h1>
                <p className="mt-3 text-[15px] text-ink-600">
                  {enmascarar(persona.email)} está dado de baja. Podés seguir usando Sufix igual que siempre.
                </p>
              </>
            ) : (
              <>
                <h1 className="display text-2xl text-sv-dark">¿Dejar de recibir mails de Sufix?</h1>
                <p className="mt-3 text-[15px] text-ink-600">
                  No le vamos a escribir más a {enmascarar(persona.email)}: ni consejos, ni preguntas sobre los técnicos que
                  contactes, ni novedades. Podés seguir usando Sufix igual.
                </p>
                <BajaBoton token={token} />
              </>
            )}
            <Link href="/" className="mt-8 inline-block text-sm text-ink-500 underline underline-offset-2">
              Volver a Sufix
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
