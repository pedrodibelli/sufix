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
    a: "Tenés 30 días de garantía de reparación. Si el técnico no responde, SolvIT te asigna otro sin costo adicional.",
  },
  {
    q: "¿Pueden contactarme por fuera de la app?",
    a: "Sí, pero perdés la garantía, el respaldo del pago y la reputación auditada del técnico.",
  },
];

const FAQ_DELAYS = ["delay-0", "delay-100", "delay-200", "delay-300"];

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
      <main className="bg-[#f5fdf9]">

        {/* ── Hero ── */}
        <section className="container-pad pt-14 pb-12">
          <p className="reveal delay-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-sv-primary">
            Cómo funciona
          </p>
          <h1 className="reveal delay-100 display mt-3 text-[2.6rem] leading-[1.08] text-sv-dark sm:text-5xl">
            De la foto<br />al técnico,<br />
            <em className="not-italic text-sv-primary">sin ruleta.</em>
          </h1>
          <p className="reveal delay-200 mt-5 max-w-sm text-[15px] leading-relaxed text-ink-500">
            {esTecnico
              ? "Recibís trabajos ya descriptos, con foto. Avisás cuáles te interesan y cobrás íntegro al cierre."
              : "Publicás el problema. Técnicos verificados te avisan que quieren hacerlo. Elegís y hablás por WhatsApp — gratis mientras dure el lanzamiento."}
          </p>
          <div className="reveal delay-300 mt-8 flex flex-col gap-3 sm:flex-row">
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
        </section>

        {/* ── Flujo cliente ── */}
        {mostrarCliente && (
        <section className="bg-white">
          <div className="container-pad py-14">
            <p className="reveal delay-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
              Para clientes
            </p>
            <h2 className="reveal delay-100 display mt-1.5 text-2xl text-sv-dark sm:text-3xl">
              Si necesitás resolver algo
            </h2>

            <div className="mt-10 space-y-0">
              <StepRow n={1} paso={PASOS_CLIENTE[0]} last={false} delay="delay-0" />
              <StepRow n={2} paso={PASOS_CLIENTE[1]} last={false} delay="delay-150" />
              <StepRow n={3} paso={PASOS_CLIENTE[2]} last={true}  delay="delay-300" />
            </div>
          </div>
        </section>
        )}

        {/* ── Flujo técnico ── */}
        {mostrarTecnico && (
        <section className="bg-sv-dark">
          <div className="container-pad py-14">
            <p className="reveal delay-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-sv-primary/70">
              Para profesionales
            </p>
            <h2 className="reveal delay-100 display mt-1.5 text-2xl text-white sm:text-3xl">
              Si sos técnico
            </h2>
            <p className="reveal delay-200 mt-2 text-sm text-white/50">
              Cero comisiones sobre tu cotización. Llegás con el problema ya descripto.
            </p>

            <div className="mt-10 space-y-0">
              <StepRowDark n={1} paso={PASOS_TECNICO[0]} last={false} delay="delay-0" />
              <StepRowDark n={2} paso={PASOS_TECNICO[1]} last={false} delay="delay-150" />
              <StepRowDark n={3} paso={PASOS_TECNICO[2]} last={true}  delay="delay-300" />
            </div>
          </div>
        </section>
        )}

        {/* ── Precios ── */}
        <section className="container-pad py-14">
          <p className="reveal delay-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
            Transparencia de precios
          </p>
          <h2 className="reveal delay-100 display mt-1.5 text-2xl text-sv-dark sm:text-3xl">
            Sin sorpresas
          </h2>

          <div className={`mt-8 grid gap-4 ${mostrarCliente && mostrarTecnico ? "sm:grid-cols-2" : "max-w-md"}`}>
            {/* Cliente */}
            {mostrarCliente && (
            <div className="reveal delay-0 rounded-2xl border border-ink-100 bg-white p-6">
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
            <div className="reveal delay-150 rounded-2xl border border-sv-primary/25 bg-sv-primary/5 p-6">
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
        </section>

        {/* ── FAQ ── */}
        <section className="bg-white">
          <div className="container-pad py-14">
            <h2 className="reveal delay-0 display text-2xl text-sv-dark sm:text-3xl">
              Preguntas frecuentes
            </h2>
            <div className="mt-7 divide-y divide-ink-100 border-t border-ink-100">
              {FAQ.map((f, i) => (
                <details key={f.q} className={`reveal ${FAQ_DELAYS[i] ?? "delay-0"} group py-5`}>
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[15px] font-medium text-sv-dark">
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
        </section>

        {/* ── CTA final ── */}
        <section className="container-pad py-14">
          <div className="reveal rounded-2xl bg-sv-dark px-7 py-10 text-center sm:px-12">
            {esTecnico ? (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sv-primary">
                  Tu próximo trabajo
                </p>
                <h3 className="display mt-2 text-2xl text-white sm:text-3xl">
                  Encontrá trabajos en tu zona.
                </h3>
                <p className="mt-2 text-sm text-white/50">
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
                <p className="mt-2 text-sm text-white/50">
                  Si nadie te convence, no pagás. Nada.
                </p>
                <Link href="/publicar" className="btn-primary mt-7 inline-block px-10">
                  Publicar mi problema
                </Link>
              </>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

// ─── Step components ───────────────────────────────────────────────────────────
function StepRow({
  n,
  paso,
  last,
  delay = "delay-0",
}: {
  n: number;
  paso: { icon: string; title: string; body: string };
  last: boolean;
  delay?: string;
}) {
  return (
    <div className={`reveal ${delay} relative flex gap-5`}>
      {/* Columna izquierda: número + línea */}
      <div className="flex flex-col items-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sv-primary/10 text-sm font-semibold text-sv-primary">
          {n}
        </div>
        {!last && <div className="mt-1 w-px flex-1 bg-ink-100" />}
      </div>

      {/* Contenido */}
      <div className="pb-10">
        <span className="text-xl">{paso.icon}</span>
        <h3 className="mt-1.5 text-[15px] font-semibold text-sv-dark">{paso.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-500">{paso.body}</p>
      </div>
    </div>
  );
}

function StepRowDark({
  n,
  paso,
  last,
  delay = "delay-0",
}: {
  n: number;
  paso: { icon: string; title: string; body: string };
  last: boolean;
  delay?: string;
}) {
  return (
    <div className={`reveal ${delay} relative flex gap-5`}>
      {/* Columna izquierda: número + línea */}
      <div className="flex flex-col items-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sv-primary/15 text-sm font-semibold text-sv-primary">
          {n}
        </div>
        {!last && <div className="mt-1 w-px flex-1 bg-white/10" />}
      </div>

      {/* Contenido */}
      <div className="pb-10">
        <span className="text-xl">{paso.icon}</span>
        <h3 className="mt-1.5 text-[15px] font-semibold text-white">{paso.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-white/50">{paso.body}</p>
      </div>
    </div>
  );
}
