import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { createSupabaseServer } from "@/lib/supabase-server";

// ─── Data ─────────────────────────────────────────────────────────────────────
const PASOS_CLIENTE = [
  {
    icon: "📸",
    title: "Publicás el problema",
    body: "Subís una foto o video, describís qué pasó y la plataforma lo muestra a técnicos verificados en tu zona.",
  },
  {
    icon: "📩",
    title: "Recibís propuestas",
    body: "Solo profesionales con identidad auditada pueden ofertar. Ves su precio, rubro y reputación antes de decidir.",
  },
  {
    icon: "🤝",
    title: "Elegís y coordinan por WhatsApp",
    body: "Hablás con los técnicos interesados y elegís el que más te convenza. El contacto es gratis mientras dure la promo de lanzamiento.",
  },
];

const PASOS_TECNICO = [
  {
    icon: "📋",
    title: "Te registrás y validamos",
    body: "Validamos tu identidad, antecedentes y matrícula si corresponde. Quedás verificado en 48–72 hs.",
  },
  {
    icon: "🎯",
    title: "Tomás los trabajos que querés",
    body: "Filtrás por zona, rubro y rango de precio. Tu agenda la armás vos. Sin asignaciones forzadas.",
  },
  {
    icon: "💰",
    title: "Cobrás íntegro al cierre",
    body: "El pago queda respaldado por la plataforma y se libera con tu código de cierre. Cero retenciones.",
  },
];

const FAQ = [
  {
    q: "¿Cuánto cuesta contactar a un técnico?",
    a: "Por ahora, nada — mientras estemos en lanzamiento, conectar con un técnico es gratis para los primeros usuarios. Más adelante vamos a cobrar una tarifa única por conexión.",
  },
  {
    q: "¿Cómo verifican a los técnicos?",
    a: "Entrevista presencial, validación de identidad, antecedentes y matrícula cuando corresponde. La verificación se renueva anualmente.",
  },
  {
    q: "¿Qué pasa si el trabajo sale mal?",
    a: "Tenés 30 días de garantía de reparación. Si el técnico no responde, Sufix te asigna otro sin costo adicional.",
  },
  {
    q: "¿Pueden contactarme por fuera de la app?",
    a: "Sí, pero perdés la garantía, el respaldo del pago y la reputación auditada del técnico.",
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
  const esDemandante = !!user && !esTecnico;
  const mostrarCliente = !esTecnico;    // visitante o demandante
  const mostrarTecnico = !esDemandante; // visitante o técnico

  return (
    <>
      <Header />
      <ScrollReveal />
      <main className="bg-white">

        {/* ── Hero ── */}
        <section className="bg-white py-14 sm:py-20 lg:py-24">
          <div className="container-pad">
            <div className="mx-auto max-w-2xl text-center">
              <p className="reveal delay-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-sv-primary">
                Cómo funciona
              </p>
              <h1 className="reveal delay-100 display mt-3 text-4xl leading-[1.1] text-sv-dark sm:text-5xl lg:text-6xl">
                De la foto al técnico,{" "}
                <em className="not-italic text-sv-primary">sin ruleta.</em>
              </h1>
              <p className="reveal delay-200 mt-5 text-base leading-relaxed text-ink-500 sm:text-lg">
                {esTecnico
                  ? "Recibís trabajos ya descriptos, con foto. Avisás cuáles te interesan y cobrás íntegro al cierre."
                  : "Publicás el problema. Técnicos verificados te avisan que quieren hacerlo. Elegís y hablás por WhatsApp — gratis mientras dure el lanzamiento."}
              </p>
              <div className="reveal delay-300 mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
                {esTecnico ? (
                  <Link href="/" className="btn-primary text-center">
                    Ver consultas disponibles
                  </Link>
                ) : (
                  <Link href="/publicar" className="btn-primary text-center">
                    Publicar mi problema
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
        <section className="bg-zap-100">
          <div className="container-pad py-14 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="reveal delay-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
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
        <section className="bg-sv-dark">
          <div className="container-pad py-14 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="reveal delay-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-sv-primary/70">
                Para profesionales
              </p>
              <h2 className="reveal delay-100 display mt-1.5 text-2xl text-white sm:text-3xl">
                Si sos técnico
              </h2>
              <p className="reveal delay-200 mt-2 text-sm text-white/50 sm:text-base">
                Cero comisiones sobre tu cotización. Llegás con el problema ya descripto.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:mt-14 sm:grid-cols-3 sm:gap-6">
              {PASOS_TECNICO.map((paso, i) => (
                <StepCard key={paso.title} n={i + 1} paso={paso} delay={STEP_DELAYS[i]} dark />
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
                <p className="reveal delay-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
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
                  <div className="mt-2 flex items-center gap-2.5">
                    <p className="text-xl font-medium text-ink-300 line-through">$4.500</p>
                    <p className="display text-[2.4rem] leading-none font-semibold text-emerald-600">$0</p>
                  </div>
                  <p className="mt-1 text-sm text-ink-400">tarifa de conexión — gratis por lanzamiento</p>
                  <div className="my-5 h-px bg-ink-100" />
                  <ul className="space-y-2.5 text-sm text-ink-600">
                    <li className="flex items-center gap-2.5">
                      <span className="text-sv-primary">✓</span> $0 por publicar el problema
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-sv-primary">✓</span> $0 si ningún técnico te convence
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-sv-primary">✓</span> Técnico verificado incluido
                    </li>
                  </ul>
                </div>
                )}

                {/* Técnico */}
                {mostrarTecnico && (
                <div className="reveal delay-150 rounded-2xl border border-sv-primary/25 bg-sv-primary/5 p-6 sm:p-8">
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
                      <span className="text-sv-primary">✓</span> $0 por publicar propuestas
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-sv-primary">✓</span> $0 por usar la plataforma
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-sv-primary">✓</span> Pago liberado al cierre del trabajo
                    </li>
                  </ul>
                </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="bg-zap-100">
          <div className="container-pad py-14 sm:py-20">
            <div className="mx-auto max-w-2xl">
              <h2 className="reveal delay-0 display text-center text-2xl text-sv-dark sm:text-3xl">
                Preguntas frecuentes
              </h2>
              <div className="mt-7 divide-y divide-ink-100 border-t border-ink-100 sm:mt-10">
                {FAQ.map((f, i) => (
                  <details key={f.q} className={`reveal ${FAQ_DELAYS[i] ?? "delay-0"} group py-5`}>
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[15px] font-medium text-sv-dark sm:text-base">
                      {f.q}
                      <span className="mt-0.5 shrink-0 text-ink-300 transition-transform duration-200 group-open:rotate-180">
                        ▾
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
                    Tu próximo trabajo
                  </p>
                  <h3 className="display mt-2 text-2xl text-white sm:text-3xl">
                    Encontrá trabajos en tu zona.
                  </h3>
                  <p className="mt-2 text-sm text-white/50 sm:text-base">
                    Cotizás solo los que te convienen. Cero comisiones.
                  </p>
                  <Link href="/" className="btn-primary mt-7 inline-block px-10">
                    Ver consultas disponibles
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sv-primary">
                    Sin riesgo
                  </p>
                  <h3 className="display mt-2 text-2xl text-white sm:text-3xl">
                    Publicá y esperá propuestas.
                  </h3>
                  <p className="mt-2 text-sm text-white/50 sm:text-base">
                    Si nadie te convence, no pagás. Nada.
                  </p>
                  <Link href="/publicar" className="btn-primary mt-7 inline-block px-10">
                    Publicar mi problema
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
  dark = false,
  delay = "delay-0",
}: {
  n: number;
  paso: { icon: string; title: string; body: string };
  dark?: boolean;
  delay?: string;
}) {
  return (
    <div
      className={`reveal ${delay} rounded-2xl border p-6 ${
        dark ? "border-white/10 bg-white/[0.03]" : "border-ink-100 bg-[#fafcfa]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
            dark ? "bg-sv-primary/20 text-sv-primary" : "bg-sv-primary/10 text-sv-primary"
          }`}
        >
          {n}
        </span>
        <span className="text-2xl">{paso.icon}</span>
      </div>
      <h3 className={`mt-4 text-base font-semibold ${dark ? "text-white" : "text-sv-dark"}`}>
        {paso.title}
      </h3>
      <p className={`mt-1.5 text-sm leading-relaxed ${dark ? "text-white/50" : "text-ink-500"}`}>
        {paso.body}
      </p>
    </div>
  );
}
