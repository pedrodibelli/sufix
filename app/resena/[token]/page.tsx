import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Avatar } from "@/components/Avatar";
import { IconOficio } from "@/components/icons";
import { CATEGORIES } from "@/lib/data";
import { avatarColorFor } from "@/lib/avatarColors";
import { toTitleCase, iniciales } from "@/lib/format";
import { clienteAdmin } from "@/lib/supabaseAdmin";
import { esUuid } from "@/lib/contactantes";
import { ResenaConLinkForm } from "./ResenaConLinkForm";
import { NoContratadoForm } from "./NoContratadoForm";

// A donde llevan los botones del mail "¿cómo te fue?" (2026-10-22, ver
// CLAUDE.md §24). Sin cuenta: el token del link alcanza.
//
// Abrir esta página NO guarda nada — ni siquiera con ?no=1. Los antivirus de
// algunos mails abren los links solos para revisarlos; si la visita guardara
// "no lo contraté", se registrarían respuestas que nadie dio. Todo se guarda
// recién al tocar un botón.

export const metadata: Metadata = {
  title: "¿Cómo te fue? — Sufix",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ResenaPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ no?: string }>;
}) {
  const { token } = await params;
  const { no } = await searchParams;
  const admin = clienteAdmin();

  const { data: inv } = admin && esUuid(token)
    ? await admin
        .from("invitaciones_resena")
        .select("tecnico_id, vence_at, resena_id")
        .eq("token", token)
        .maybeSingle()
    : { data: null };

  if (!inv) {
    return (
      <Mensaje titulo="Este link no es válido">
        Puede que se haya cortado al copiarlo. Probá tocándolo de nuevo desde el mail.
      </Mensaje>
    );
  }

  const [{ data: perfil }, { data: resena }] = await Promise.all([
    admin!.from("perfiles_publicos").select("user_id, nombre, foto_url, rubro").eq("user_id", inv.tecnico_id).maybeSingle(),
    inv.resena_id
      ? admin!.from("resenas").select("estrellas, comentario, autor_nombre").eq("id", inv.resena_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (!perfil) {
    return (
      <Mensaje titulo="Este técnico ya no está en Sufix">
        Su perfil ya no está publicado, así que no se le pueden dejar reseñas.
      </Mensaje>
    );
  }

  const nombre = toTitleCase(perfil.nombre ?? "Profesional");
  const vencido = Date.parse(inv.vence_at) < Date.now();

  if (vencido) {
    return (
      <Mensaje titulo="Este link venció">
        Los links para dejar reseña duran 30 días. Si igual querés calificar a {nombre}, podés hacerlo desde{" "}
        <Link href={`/tecnico/${perfil.user_id}`} className="font-medium text-sv-primary underline underline-offset-2">
          su perfil
        </Link>{" "}
        con una cuenta de Sufix.
      </Mensaje>
    );
  }

  const rubroCats = ((perfil.rubro ?? []) as string[])
    .map((slug) => CATEGORIES.find((c) => c.slug === slug))
    .filter((c): c is (typeof CATEGORIES)[number] => !!c)
    .slice(0, 3);
  const mostrarNo = no === "1" && !inv.resena_id;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FBF8EF]">
        <section className="container-home py-10 sm:py-14">
          <div className="mx-auto max-w-md">
            <div className="flex items-center gap-4">
              <Avatar
                url={perfil.foto_url}
                initials={iniciales(nombre)}
                size={64}
                fallbackColor={avatarColorFor(perfil.user_id)}
                textClass="font-display text-xl"
              />
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-ink-500">
                  {mostrarNo ? "Contaste que no lo contrataste" : "Tu reseña de"}
                </p>
                <h1 className="display truncate text-2xl text-sv-dark">{nombre}</h1>
                {rubroCats.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {rubroCats.map((c) => (
                      <span key={c.slug} className="chip inline-flex items-center gap-1 px-2 py-0.5 text-[11px]">
                        <IconOficio slug={c.slug} className="h-3 w-3 shrink-0 text-sv-primary" />
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {mostrarNo ? (
              <NoContratadoForm token={token} nombre={nombre} />
            ) : (
              <ResenaConLinkForm
                token={token}
                nombre={nombre}
                tecnicoId={perfil.user_id}
                inicial={
                  resena
                    ? { estrellas: resena.estrellas, comentario: resena.comentario ?? "", autor: resena.autor_nombre ?? "" }
                    : null
                }
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Mensaje({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FBF8EF]">
        <section className="container-home py-16">
          <div className="mx-auto max-w-md text-center">
            <h1 className="display text-2xl text-sv-dark">{titulo}</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-600">{children}</p>
            <Link href="/" className="btn-primary mt-8 inline-flex">
              Ir a Sufix
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
