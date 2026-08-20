import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ServiceCard } from "@/components/ServiceCard";
import { StarRating } from "@/components/StarRating";
import { SERVICES, findPro } from "@/lib/data";

export default async function ProfesionalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pro = findPro(slug);
  if (!pro) notFound();
  const services = SERVICES.filter((s) => s.proId === pro.id);

  return (
    <>
      <Header />
      <main>
        {/* Banner */}
        <section className="border-b border-ink-100 bg-white">
          <div className="container-pad py-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <Image
                src={pro.avatar}
                alt={pro.name}
                width={120}
                height={120}
                className="h-28 w-28 rounded-full object-cover ring-4 ring-zap-100"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {pro.badges.map((b) => (
                    <span
                      key={b}
                      className={`pill ${
                        b === "Top Pro"
                          ? "bg-zap-300 text-ink-950"
                          : "bg-brand-100 text-brand-800"
                      }`}
                    >
                      {b === "Top Pro" && "⭐ "}
                      {b}
                    </span>
                  ))}
                </div>
                <h1 className="display mt-2 text-3xl md:text-4xl">
                  {pro.name}
                </h1>
                <div className="mt-1 text-ink-600">{pro.title}</div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink-600">
                  <StarRating rating={pro.rating} reviews={pro.reviewsCount} />
                  <span>📍 {pro.zone}</span>
                  <span>🕒 {pro.responseTime}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:w-64">
                <button className="btn-primary">Chatear con {pro.name.split(" ")[0]}</button>
                <Link
                  href={`/publicar?pro=${pro.slug}`}
                  className="btn-outline"
                >
                  Pedir presupuesto directo
                </Link>
              </div>
            </div>

            {/* Highlights */}
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
              {pro.highlights.map((h) => (
                <div key={h.label} className="card p-4">
                  <div className="text-xs uppercase tracking-wider text-ink-500">
                    {h.label}
                  </div>
                  <div className="display mt-1 text-2xl">{h.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="container-pad py-12">
          <div className="grid gap-10 lg:grid-cols-[1fr,300px]">
            <div>
              <h2 className="display text-2xl">Sobre {pro.name.split(" ")[0]}</h2>
              <p className="mt-3 text-ink-700">{pro.bio}</p>

              <h3 className="mt-10 text-sm font-semibold uppercase tracking-wider text-ink-500">
                Especialidades
              </h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {pro.skills.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>

              {services.length > 0 && (
                <>
                  <h3 className="mt-12 display text-2xl">Servicios publicados</h3>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((s) => (
                      <ServiceCard key={s.id} service={s} />
                    ))}
                  </div>
                </>
              )}

              <h3 className="mt-12 display text-2xl">Reseñas recientes</h3>
              <div className="mt-4 space-y-4">
                {MOCK_REVIEWS.map((r, i) => (
                  <div key={i} className="card p-5">
                    <div className="flex items-center gap-3">
                      <Image
                        src={`https://i.pravatar.cc/64?img=${r.avatar}`}
                        alt={r.author}
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{r.author}</div>
                        <div className="text-xs text-ink-500">
                          {r.service} · {r.date}
                        </div>
                      </div>
                      <StarRating rating={r.rating} />
                    </div>
                    <p className="mt-3 text-sm text-ink-800">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <aside>
              <div className="sticky top-24 space-y-4">
                <div className="card p-5">
                  <div className="text-xs uppercase tracking-wider text-ink-500">
                    Verificación Sufix
                  </div>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span>✅</span> Identidad validada
                    </li>
                    <li className="flex items-center gap-2">
                      <span>✅</span> Antecedentes auditados
                    </li>
                    <li className="flex items-center gap-2">
                      <span>✅</span> Entrevista presencial
                    </li>
                    {pro.matricula && (
                      <li className="flex items-center gap-2">
                        <span>📜</span> {pro.matricula}
                      </li>
                    )}
                  </ul>
                  <div className="mt-4 text-xs text-ink-500">
                    En Sufix desde {pro.verifiedSince}
                  </div>
                </div>

                <div className="card border-ink-200 bg-ink-50 p-5">
                  <div className="text-xs uppercase tracking-wider text-ink-500">
                    Idiomas
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {pro.languages.map((l) => (
                      <span key={l} className="chip">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="card p-5">
                  <div className="text-sm font-semibold">¿Sospechás un problema?</div>
                  <p className="mt-1 text-xs text-ink-600">
                    Reportá al equipo de Sufix y revisamos en 24 hs.
                  </p>
                  <button className="btn-outline mt-3 w-full text-xs">
                    Reportar
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const MOCK_REVIEWS = [
  {
    author: "Tomás L.",
    avatar: 41,
    date: "Hace 4 días",
    rating: 5,
    service: "Instalación de split",
    text: "Llegó a horario, instalación en 2 hs y me dejó la factura. Recomendable 100%.",
  },
  {
    author: "Marina F.",
    avatar: 31,
    date: "Hace 2 semanas",
    rating: 4.8,
    service: "Service heladera",
    text: "Diagnóstico claro y honesto. Me dijo que no valía la pena arreglarla y por qué.",
  },
  {
    author: "Diego R.",
    avatar: 51,
    date: "Hace 1 mes",
    rating: 5,
    service: "Carga de gas R32",
    text: "Mil veces mejor que el service oficial. Y mitad de precio.",
  },
];
