import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { IconPaso, IconCheck, IconChevronDown } from "@/components/icons";
import { createSupabaseServer } from "@/lib/supabase-server";

// ─── Data ─────────────────────────────────────────────────────────────────────
const PASOS_CLIENTE = [
  {
    icon: "explorar",
    title: "Explorás perfiles",
    body: "Mirás foto, rubros, zona y reseñas de técnicos verificados cerca tuyo — sin registrarte.",
  },
  {
    icon: "elegir",
    title: "Elegís y escribís",
    body: "Tocás \"Contactar por WhatsApp\" en el perfil que te convenza. Un clic, sin formularios ni esperas.",
  },
  {
    icon: "coordinar",
    title: "Coordinan directo",
    body: "Hablan por WhatsApp, acuerdan precio y fecha entre ustedes. Sin intermediarios, sin comisión.",
  },
];

const PASOS_TECNICO = [
  {
    icon: "registro",
    title: "Te registrás y armás tu perfil",
    body: "Cargá tu foto, tus rubros y tu zona — es lo primero que ve un cliente antes de escribirte.",
  },
  {
    icon: "aparecer",
    title: "Aparecés en el directorio",
    body: "Cualquiera puede ver tu perfil, tus reseñas y contactarte — con cuenta o sin ella.",
  },
  {
    icon: "whatsapp",
    title: "Te escriben directo por WhatsApp",
    body: "Coordinás el trabajo y cobrás vos, directo con el cliente. Cero comisión, cero intermediarios.",
  },
];

const FAQ = [
  {
    q: "¿Cuánto cuesta contactar a un técnico?",
    a: "Nada. Mirar perfiles, reseñas y escribirle a un técnico por WhatsApp es gratis, hoy y siempre.",
  },
  {
    q: "¿Cómo verifican a los técnicos?",
    a: "Nuestro equipo revisa a mano cada perfil antes de publicarlo — reputación real (reseñas existentes, años en el oficio) y que los datos de contacto sean genuinos. El sello \"Verificado\" significa que una persona de Sufix lo chequeó, no una revisión automática.",
  },
  {
    q: "¿Qué pasa si el trabajo sale mal?",
    a: "El contacto y la coordinación son directos entre vos y el técnico — te recomendamos acordar bien el alcance y el precio antes de arrancar. Es algo que estamos mejorando a medida que la plataforma crece.",
  },
  {
    q: "¿La plataforma cobra algo del trabajo?",
    a: "No. Sufix no cobra comisión ni gestiona el pago — coordinás el precio y la forma de pago directo con el técnico.",
  },
];

const FAQ_DELAYS = ["delay-0", "delay-100", "delay-200", "delay-300"];
const STEP_DELAYS = ["delay-0", "delay-150", "delay-300"];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ComoFuncionaPage() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  const esTecnico = user?.user_metadata?.es_profesional === true;

  // Antes se ocultaba el flujo del otro rol (demandante logueado no veía
  // "Si sos técnico", técnico no veía "Si necesitás resolver algo") —
  // dejaba la página con la mitad del contenido y, en Precios, una sola
  // tarjeta sola en medio de mucho vacío (se veía asimétrico y pobre).
  // Mismo criterio que se aplicó en la home (2026-08-31): ningún flujo es
  // exclusivo de un rol, mostrar los dos siempre es más completo y no
  // perjudica a nadie.
  const mostrarCliente = true;
  const mostrarTecnico = true;

  return (
    <>
      <Header />
      <ScrollReveal />
      <main className="bg-white">

        {/* ── Hero ── */}
        {/* Mismo blob decorativo que el hero de la home, para que se sienta
            la misma familia visual apenas se entra (pedido 2026-08-31). */}
        <section className="relative overflow-hidden bg-white py-14 sm:py-20 lg:py-24">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] opacity-70"
            style={{ background: "#E4EAD6", borderRadius: "44% 56% 60% 40% / 48% 42% 58% 52%" }}
            aria-hidden
          />
          <div className="container-pad relative">
            <div className="mx-auto max-w-2xl text-center">
              <p className="reveal delay-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-sv-primary">
                Cómo funciona
              </p>
              <h1 className="reveal delay-100 display mt-3 text-4xl leading-[1.1] text-sv-dark sm:text-5xl lg:text-6xl">
                Del perfil al WhatsApp,{" "}
                <em className="not-italic text-sv-primary">sin ruleta.</em>
              </h1>
              <p className="reveal delay-200 mt-5 text-base leading-relaxed text-ink-500 sm:text-lg">
                {esTecnico
                  ? "Los clientes te encuentran por tu perfil — foto, zona, rubros y reseñas — y te escriben directo por WhatsApp. Completalo para que te elijan."
                  : "Mirás perfiles de técnicos verificados, sus reseñas y su zona. Elegís el que te convenza y le escribís directo por WhatsApp — sin publicar nada, sin esperar propuestas."}
              </p>
              <div className="reveal delay-300 mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
                {esTecnico ? (
                  <Link href="/perfil" className="btn-primary text-center">
                    Completar mi perfil
                  </Link>
                ) : (
                  <Link href="/#tecnicos" className="btn-primary text-center">
                    Ver técnicos
                  </Link>
                )}
                {!user && (
                  <Link href="/registrar" className="btn-ghost text-center text-ink-500">
                    Soy técnico →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Flujo cliente ── */}
        {mostrarCliente && (
        <section className="bg-zap-50">
          <div className="container-pad py-14 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="reveal delay-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-sv-olive">
                Para clientes
              </p>
              <h2 className="reveal delay-100 display mt-1.5 text-2xl text-sv-dark sm:text-3xl">
                Si necesitás resolver algo
              </h2>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:mt-14 sm:grid-cols-3 sm:gap-6">
              {PASOS_CLIENTE.map((paso, i) => (
                <StepCard key={paso.title} n={i + 1} paso={paso} delay={STEP_DELAYS[i]} />
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ── Flujo técnico ── */}
        {mostrarTecnico && (
        <section className="bg-white">
          <div className="container-pad py-14 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="reveal delay-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
                Para profesionales
              </p>
              <h2 className="reveal delay-100 display mt-1.5 text-2xl text-sv-dark sm:text-3xl">
                Si sos técnico
              </h2>
              <p className="reveal delay-200 mt-2 text-sm text-ink-500 sm:text-base">
                Cero comisiones. Tu perfil es tu vidriera — el cliente te escribe directo.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:mt-14 sm:grid-cols-3 sm:gap-6">
              {PASOS_TECNICO.map((paso, i) => (
                <StepCard key={paso.title} n={i + 1} paso={paso} delay={STEP_DELAYS[i]} />
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ── Precios ── */}
        <section className="bg-white py-14 sm:py-20">
          <div className="container-pad">
            <div className="mx-auto max-w-4xl">
              <div className="text-center">
                <p className="reveal delay-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-sv-olive">
                  Transparencia de precios
                </p>
                <h2 className="reveal delay-100 display mt-1.5 text-2xl text-sv-dark sm:text-3xl">
                  Sin sorpresas
                </h2>
              </div>

              <div className={`mt-8 grid gap-4 sm:mt-12 ${mostrarCliente && mostrarTecnico ? "sm:grid-cols-2" : "mx-auto max-w-md"}`}>
                {/* Cliente */}
                {mostrarCliente && (
                <div className="reveal delay-0 rounded-2xl border border-ink-100 bg-white p-6 sm:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                    Para clientes
                  </p>
                  <p className="display mt-2 text-[2.4rem] leading-none font-semibold text-sv-primary">
                    $0
                  </p>
                  <p className="mt-1 text-sm text-ink-400">buscar y contactar técnicos</p>
                  <div className="my-5 h-px bg-ink-100" />
                  <ul className="space-y-2.5 text-sm text-ink-600">
                    <li className="flex items-center gap-2.5">
                      <IconCheck className="h-4 w-4 shrink-0 text-sv-primary" /> $0 por ver perfiles y reseñas
                    </li>
                    <li className="flex items-center gap-2.5">
                      <IconCheck className="h-4 w-4 shrink-0 text-sv-primary" /> $0 por escribir por WhatsApp
                    </li>
                    <li className="flex items-center gap-2.5">
                      <IconCheck className="h-4 w-4 shrink-0 text-sv-primary" /> Elegís vos, sin apuro
                    </li>
                  </ul>
                </div>
                )}

                {/* Técnico */}
                {mostrarTecnico && (
                <div className="reveal delay-150 rounded-2xl border border-sv-primary/30 bg-white p-6 sm:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-sv-olive">
                    Para técnicos
                  </p>
                  <p className="display mt-2 text-[2.4rem] leading-none font-semibold text-sv-dark">
                    0%
                  </p>
                  <p className="mt-1 text-sm text-ink-400">comisión sobre el trabajo</p>
                  <div className="my-5 h-px bg-sv-primary/15" />
                  <ul className="space-y-2.5 text-sm text-ink-600">
                    <li className="flex items-center gap-2.5">
                      <IconCheck className="h-4 w-4 shrink-0 text-sv-primary" /> $0 por aparecer en el directorio
                    </li>
                    <li className="flex items-center gap-2.5">
                      <IconCheck className="h-4 w-4 shrink-0 text-sv-primary" /> $0 por usar la plataforma
                    </li>
                    <li className="flex items-center gap-2.5">
                      <IconCheck className="h-4 w-4 shrink-0 text-sv-primary" /> Cobrás directo del cliente, sin intermediarios
                    </li>
                  </ul>
                </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="bg-white">
          <div className="container-pad py-14 sm:py-20">
            <div className="mx-auto max-w-2xl">
              <h2 className="reveal delay-0 display text-center text-2xl text-sv-dark sm:text-3xl">
                Preguntas frecuentes
              </h2>
              <div className="mt-7 divide-y divide-ink-200 border-t border-ink-200 sm:mt-10">
                {FAQ.map((f, i) => (
                  <details key={f.q} className={`reveal ${FAQ_DELAYS[i] ?? "delay-0"} group py-5`}>
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[15px] font-medium text-sv-dark sm:text-base">
                      {f.q}
                      <span className="mt-0.5 shrink-0 text-ink-300 transition-transform duration-200 group-open:rotate-180">
                        <IconChevronDown className="h-4 w-4" />
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-ink-500">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="bg-white py-14 sm:py-20">
          <div className="container-pad">
            <div className="reveal mx-auto max-w-3xl rounded-2xl bg-sv-dark px-7 py-10 text-center sm:px-12 sm:py-14">
              {esTecnico ? (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sv-primary">
                    Tu próximo cliente
                  </p>
                  <h3 className="display mt-2 text-2xl text-white sm:text-3xl">
                    Ya te está buscando.
                  </h3>
                  <p className="mt-2 text-sm text-white/50 sm:text-base">
                    Completá tu perfil — foto, zona y rubros — para aparecer en el directorio.
                  </p>
                  <Link href="/perfil" className="btn-primary mt-7 inline-block px-10">
                    Completar mi perfil
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sv-primary">
                    Sin costo
                  </p>
                  <h3 className="display mt-2 text-2xl text-white sm:text-3xl">
                    Tu técnico te está esperando.
                  </h3>
                  <p className="mt-2 text-sm text-white/50 sm:text-base">
                    Mirá perfiles, reseñas y escribile directo. Cero costo, cero vueltas.
                  </p>
                  <Link href="/#tecnicos" className="btn-primary mt-7 inline-block px-10">
                    Ver técnicos
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

// ─── StepCard ───────────────────────────────────────────────────────────────
// Reemplaza a los viejos StepRow/StepRowDark (timeline vertical angosta): en
// mobile se apilan en una columna, en desktop forman una grilla de 3 — usan
// mucho mejor el ancho de pantalla que una lista pegada a la izquierda.
function StepCard({
  n,
  paso,
  delay = "delay-0",
}: {
  n: number;
  paso: { icon: string; title: string; body: string };
  delay?: string;
}) {
  return (
    <div className={`reveal ${delay} rounded-2xl border border-ink-200 bg-white p-6`}>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sv-primary/10 text-sm font-semibold text-sv-primary">
          {n}
        </span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sv-mint p-2.5 text-sv-primary">
          <IconPaso slug={paso.icon} />
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold text-sv-dark">{paso.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{paso.body}</p>
    </div>
  );
}
