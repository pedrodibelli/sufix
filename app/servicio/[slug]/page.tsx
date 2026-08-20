import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ServiceCard } from "@/components/ServiceCard";
import { StarRating } from "@/components/StarRating";
import {
  SERVICES,
  findService,
  proById,
  formatARS,
  categoryBySlug,
} from "@/lib/data";

export default async function ServicioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = findService(slug);
  if (!service) notFound();

  const pro = proById(service.proId)!;
  const cat = categoryBySlug(service.categorySlug)!;
  const related = SERVICES.filter(
    (s) => s.categorySlug === service.categorySlug && s.id !== service.id
  ).slice(0, 4);

  return (
    <>
      <Header />
      <main className="container-pad py-8">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
          <Link href="/buscar" className="hover:text-ink-900">
            Explorar
          </Link>
          <span>/</span>
          <Link
            href={`/categoria/${cat.slug}`}
            className="hover:text-ink-900"
          >
            {cat.icon} {cat.name}
          </Link>
          <span>/</span>
          <span className="line-clamp-1 text-ink-700">{service.title}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr,380px]">
          {/* Main */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {service.tags.map((t) => (
                <span key={t} className="pill bg-ink-100 text-ink-700">
                  {t}
                </span>
              ))}
            </div>
            <h1 className="display mt-3 text-3xl leading-tight md:text-4xl">
              {service.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-600">
              <Link
                href={`/profesional/${pro.slug}`}
                className="inline-flex items-center gap-2"
              >
                <Image
                  src={pro.avatar}
                  alt={pro.name}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
                <span className="font-medium text-ink-950 hover:underline">
                  {pro.name}
                </span>
              </Link>
              <StarRating
                rating={service.rating}
                reviews={service.reviewsCount}
              />
              <span>· {service.delivery}</span>
              {pro.badges.includes("Matriculado") && (
                <span className="pill bg-brand-100 text-brand-800">
                  Matriculado
                </span>
              )}
            </div>

            {/* Hero gallery */}
            <div className="mt-6 grid gap-2 sm:grid-cols-[1fr,200px]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-100">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(min-width: 1024px) 700px, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-1 grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl bg-ink-100 sm:aspect-square"
                  >
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      sizes="200px"
                      className="object-cover grayscale-[20%]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mt-10">
              <h2 className="display text-2xl">Sobre este servicio</h2>
              <p className="mt-3 text-ink-700">{service.description}</p>
            </div>

            {/* Includes */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
                Qué incluye
              </h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {service.includes.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1 flex h-4 w-4 flex-none items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700">
                      ✓
                    </span>
                    <span className="text-ink-800">{i}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Zones */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
                Zonas que cubre
              </h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {service.zones.map((z) => (
                  <span key={z} className="chip">
                    📍 {z}
                  </span>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-10">
              <h2 className="display text-2xl">Preguntas frecuentes</h2>
              <div className="mt-4 divide-y divide-ink-100 border-y border-ink-100">
                {service.faq.map((f) => (
                  <details key={f.q} className="group py-4">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-medium text-ink-950">
                      {f.q}
                      <span className="text-ink-400 transition-transform group-open:rotate-180">
                        ▾
                      </span>
                    </summary>
                    <p className="mt-2 text-sm text-ink-700">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>

            {/* Reviews mock */}
            <div className="mt-10">
              <div className="flex items-baseline gap-3">
                <h2 className="display text-2xl">Reseñas</h2>
                <StarRating
                  rating={service.rating}
                  reviews={service.reviewsCount}
                  size="md"
                />
              </div>
              <div className="mt-4 grid gap-4">
                {MOCK_REVIEWS.map((r, i) => (
                  <div key={i} className="card p-5">
                    <div className="flex items-center gap-3">
                      <Image
                        src={`https://i.pravatar.cc/64?img=${r.avatar}`}
                        alt={r.author}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full"
                      />
                      <div>
                        <div className="text-sm font-semibold">{r.author}</div>
                        <div className="text-xs text-ink-500">{r.date}</div>
                      </div>
                      <div className="ml-auto">
                        <StarRating rating={r.rating} />
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-ink-800">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky right column */}
          <div>
            <div className="sticky top-24 space-y-4">
              <div className="card overflow-hidden">
                <div className="p-5">
                  <div className="text-[11px] uppercase tracking-wider text-ink-500">
                    Desde
                  </div>
                  <div className="display text-4xl">
                    {formatARS(service.priceFrom)}
                  </div>
                  <div className="mt-1 text-xs text-ink-500">
                    Precio del trabajo · íntegro al técnico
                  </div>

                  <div className="my-4 border-t border-dashed border-ink-200" />

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-600">Tarifa de conexión</span>
                    <span className="font-medium">$4.500</span>
                  </div>
                  <div className="mt-1 text-[11px] text-ink-500">
                    Cobramos solo si aceptás una oferta.
                  </div>

                  <Link
                    href={`/publicar?cat=${service.categorySlug}`}
                    className="btn-primary mt-5 w-full"
                  >
                    Pedir este servicio
                  </Link>
                  <button className="btn-outline mt-2 w-full">
                    Chatear con {pro.name.split(" ")[0]}
                  </button>
                </div>
                <div className="border-t border-ink-100 bg-ink-50 p-5 text-xs">
                  <ul className="space-y-2 text-ink-700">
                    <li className="flex items-start gap-2">
                      <span>🛡️</span> Pago respaldado por Sufix
                    </li>
                    <li className="flex items-start gap-2">
                      <span>⏱️</span> {service.delivery}
                    </li>
                    <li className="flex items-start gap-2">
                      <span>✅</span> Garantía de reparación incluida
                    </li>
                    <li className="flex items-start gap-2">
                      <span>🆔</span> Identidad del técnico verificada en sitio
                    </li>
                  </ul>
                </div>
              </div>

              <Link
                href={`/profesional/${pro.slug}`}
                className="card flex items-center gap-3 p-4 transition hover:border-ink-300"
              >
                <Image
                  src={pro.avatar}
                  alt={pro.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {pro.name}
                  </div>
                  <div className="truncate text-xs text-ink-600">
                    {pro.responseTime}
                  </div>
                </div>
                <span className="text-ink-400">›</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="display text-2xl">Servicios relacionados</h2>
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {related.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

const MOCK_REVIEWS = [
  {
    author: "Sol R.",
    avatar: 22,
    date: "Hace 1 semana",
    rating: 5,
    text: "Puntual, prolijo y la factura coincide al peso con lo que cotizó. Hace mucho que no me pasaba esto.",
  },
  {
    author: "Mariano P.",
    avatar: 18,
    date: "Hace 3 semanas",
    rating: 4.9,
    text: "Resolvió en una hora algo que dos plomeros antes no pudieron. Dejó todo limpio.",
  },
  {
    author: "Ana G.",
    avatar: 25,
    date: "Hace 1 mes",
    rating: 5,
    text: "Mostró el problema con cámara antes de tocar nada. Eso me dio mucha tranquilidad.",
  },
];
