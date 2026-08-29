import Link from "next/link";
import { CATEGORIES } from "@/lib/data";

// Secciones de marketing de la home para visitantes sin cuenta (rediseño
// 2026-08-28, landing "crema/salvia"). Todo estático/decorativo — sin fetch
// de datos — separado de app/page.tsx para no inflar ese archivo (que ya
// tiene bastante lógica de datos reales del directorio).

// ---- Tira de "el problema" ----------------------------------------------
export function ProblemStrip() {
  return (
    <div className="bg-sv-dark py-6 text-center text-[#FBF8EF]">
      <p className="container-home mx-auto max-w-2xl font-display text-lg font-semibold sm:text-xl">
        Buscar un técnico de confianza hoy es preguntar en grupos de vecinos y{" "}
        <span className="text-sv-light">cruzar los dedos</span>. Sufix te muestra perfiles verificados de tu zona, al toque.
      </p>
    </div>
  );
}

// ---- Seguridad (copy ajustado a lo que REALMENTE hacemos hoy — nada de
// "antecedentes penales" ni "matrícula verificada" que todavía no chequeamos) ----
const VERIFICACIONES = [
  {
    icon: "🔍",
    title: "Revisión manual, no automática",
    body: "Una persona de nuestro equipo mira cada perfil antes de publicarlo — no se auto-declara nadie.",
  },
  {
    icon: "⭐",
    title: "Reputación real, no inventada",
    body: "Priorizamos técnicos con historial y reseñas comprobables antes de sumarlos al directorio.",
  },
  {
    icon: "📱",
    title: "Contacto verificado",
    body: "Confirmamos que el teléfono de WhatsApp que ves en el perfil es real y del técnico.",
  },
  {
    icon: "🚩",
    title: "Podés reportar",
    body: "Si algo no cuadra con un perfil, nos avisás y lo revisamos — así mantenemos el directorio limpio.",
  },
];

export function SeguridadSection() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="container-home">
        <div className="mx-auto mb-10 max-w-xl text-center sm:mb-14">
          <span className="text-[13px] font-bold uppercase tracking-wider text-sv-primary">Seguridad</span>
          <h2 className="display mt-3 text-3xl leading-tight text-sv-dark sm:text-4xl">
            Ningún técnico entra <span className="text-sv-primary">sin que lo miremos primero.</span>
          </h2>
          <p className="mt-3.5 text-base leading-relaxed text-ink-500">
            Cada perfil pasa por una revisión hecha a mano por nuestro equipo antes de estar visible en el directorio.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {VERIFICACIONES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-ink-100 bg-white p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sv-mint text-lg">
                {v.icon}
              </div>
              <h4 className="font-display text-[14.5px] font-semibold leading-tight text-sv-dark">{v.title}</h4>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-500">{v.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Grilla de oficios (todas las categorías reales, no un subconjunto) --
export function OficiosGrid() {
  return (
    <section className="bg-zap-50 py-14 sm:py-20">
      <div className="container-home">
        <div className="mx-auto mb-10 max-w-xl text-center sm:mb-14">
          <span className="text-[13px] font-bold uppercase tracking-wider text-sv-primary">Oficios</span>
          <h2 className="display mt-3 text-3xl leading-tight text-sv-dark sm:text-4xl">
            Todos los profesionales, <span className="text-sv-primary">en un solo lugar.</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/categoria/${c.slug}`}
              className="rounded-2xl border border-ink-100 bg-white p-5 text-center transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-22px_rgba(29,46,32,0.3)]"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sv-mint text-xl">
                {c.icon}
              </div>
              <h4 className="font-display text-[14.5px] font-semibold text-sv-dark">{c.name}</h4>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---- Cómo funciona, 3 pasos (versión corta — la larga vive en /como-funciona) ----
const PASOS = [
  { icon: "🔍", title: "Buscá por oficio y zona", body: "Filtrá entre técnicos verificados de tu barrio en segundos." },
  { icon: "⭐", title: "Mirá su perfil y reseñas", body: "Comparás experiencia y opiniones reales de otros clientes." },
  { icon: "💬", title: "Escribí por WhatsApp", body: "Un clic y hablás directo con el técnico. Gratis, sin registro." },
];

export function ComoFuncionaPasos() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="container-home">
        <div className="mx-auto mb-10 max-w-xl text-center sm:mb-14">
          <span className="text-[13px] font-bold uppercase tracking-wider text-sv-primary">Cómo funciona</span>
          <h2 className="display mt-3 text-3xl leading-tight text-sv-dark sm:text-4xl">
            Buscá por <span className="text-sv-primary">oficio y zona.</span>
          </h2>
        </div>
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-8 sm:flex-row sm:items-start sm:justify-between">
          {PASOS.map((p, i) => (
            <div key={p.title} className="flex flex-1 flex-col items-center text-center">
              <div className="mb-4 flex h-[70px] w-[70px] items-center justify-center rounded-full border-[1.5px] border-sv-dark/10 bg-[#FBF8EF] text-2xl shadow-[0_14px_30px_-18px_rgba(29,46,32,0.25)]">
                {p.icon}
              </div>
              <p className="max-w-[150px] font-display text-sm font-semibold leading-snug text-sv-dark">{p.title}</p>
              <p className="mt-1 max-w-[170px] text-xs leading-relaxed text-ink-500">{p.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/como-funciona" className="text-sm font-semibold text-sv-primary underline underline-offset-4 hover:text-sv-olive">
            Ver todos los detalles →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ---- Mockup de conversación de WhatsApp (contenido genérico, no un técnico
// real, para no atribuirle una charla inventada a nadie del directorio) ----
export function WhatsAppMockupSection() {
  return (
    <section className="bg-zap-50 py-14 sm:py-20">
      <div className="container-home grid items-center gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
        <div>
          <span className="text-[13px] font-bold uppercase tracking-wider text-sv-primary">Todo por WhatsApp</span>
          <h2 className="display mt-3 text-3xl leading-tight text-sv-dark sm:text-4xl">
            Contactás, coordinás <span className="text-sv-primary">y listo.</span>
          </h2>
          <p className="mt-3 text-base text-ink-500">Simple y rápido, sin vueltas ni intermediarios.</p>
          <div className="mt-6 flex flex-col gap-5">
            {[
              { icon: "💬", title: "Hablás directo con el profesional", body: "Sin formularios, sin esperar respuesta de la plataforma." },
              { icon: "🗓️", title: "Coordinás día, horario y detalles", body: "Vos y el técnico se ponen de acuerdo, a su ritmo." },
              { icon: "🤝", title: "Elegís con quién hablar, sin intermediarios", body: "El contacto es directo, siempre." },
            ].map((b) => (
              <div key={b.title} className="flex items-start gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sv-mint text-base">{b.icon}</span>
                <div>
                  <h4 className="font-display text-[15px] font-semibold text-sv-dark">{b.title}</h4>
                  <p className="text-[13.5px] text-ink-500">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[32px] border-[8px] border-sv-dark bg-white shadow-[0_30px_60px_-24px_rgba(29,46,32,0.4)]">
          <div className="flex items-center gap-2.5 bg-sv-primary px-4 py-3.5 text-white">
            <div className="h-8 w-8 shrink-0 rounded-full bg-white/30" />
            <div>
              <b className="block font-display text-sm">Sergio Moro</b>
              <span className="block text-[11.5px] opacity-85">Plomero</span>
            </div>
          </div>
          <div className="flex min-h-[340px] flex-col gap-2.5 bg-[#EFEAD9] p-4">
            <div className="max-w-[78%] self-end rounded-2xl rounded-br-[4px] bg-[#DCF3D6] px-3 py-2.5 text-[13px] leading-snug">
              Hola Sergio, necesito ayuda con una pérdida de agua en la cocina.
              <time className="mt-0.5 block text-right text-[9.5px] text-ink-500">10:30</time>
            </div>
            <div className="max-w-[78%] self-start rounded-2xl rounded-bl-[4px] bg-white px-3 py-2.5 text-[13px] leading-snug">
              ¡Hola! Soy Sergio, plomero. ¿En qué puedo ayudarte?
              <time className="mt-0.5 block text-right text-[9.5px] text-ink-500">10:31</time>
            </div>
            <div className="max-w-[78%] self-end rounded-2xl rounded-br-[4px] bg-[#DCF3D6] px-3 py-2.5 text-[13px] leading-snug">
              La canilla de la pileta pierde agua y no para.
              <time className="mt-0.5 block text-right text-[9.5px] text-ink-500">10:32</time>
            </div>
            <div className="max-w-[78%] self-start rounded-2xl rounded-bl-[4px] bg-white px-3 py-2.5 text-[13px] leading-snug">
              De acuerdo, ¿tenés disponibilidad mañana por la tarde?
              <time className="mt-0.5 block text-right text-[9.5px] text-ink-500">10:33</time>
            </div>
            <div className="max-w-[78%] self-end rounded-2xl rounded-br-[4px] bg-[#DCF3D6] px-3 py-2.5 text-[13px] leading-snug">
              Sí, a las 16 hs estaría bien.
              <time className="mt-0.5 block text-right text-[9.5px] text-ink-500">10:34</time>
            </div>
            <div className="max-w-[78%] self-start rounded-2xl rounded-bl-[4px] bg-white px-3 py-2.5 text-[13px] leading-snug">
              Perfecto, nos vemos mañana a las 16 hs. Llevo todo lo necesario.
              <time className="mt-0.5 block text-right text-[9.5px] text-ink-500">10:35</time>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
