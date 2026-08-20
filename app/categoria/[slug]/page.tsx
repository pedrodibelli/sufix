import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ServiceCard } from "@/components/ServiceCard";
import { ProCard } from "@/components/ProCard";
import {
  categoryBySlug,
  servicesByCategory,
  PROS,
} from "@/lib/data";

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = categoryBySlug(slug);
  if (!cat) notFound();
  const services = servicesByCategory(slug);
  const pros = PROS.slice(0, 4);

  return (
    <>
      <Header />
      <main>
        <section
          className={`border-b border-ink-100 bg-gradient-to-br ${cat.accent}`}
        >
          <div className="container-pad py-14">
            <Link
              href="/categorias"
              className="text-xs text-ink-600 hover:text-ink-900"
            >
              ← Todas las categorías
            </Link>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-5xl">{cat.icon}</div>
                <h1 className="display mt-3 text-4xl md:text-5xl">{cat.name}</h1>
                <p className="mt-2 max-w-xl text-ink-700">{cat.blurb}</p>
              </div>
              <Link
                href={`/publicar?cat=${cat.slug}`}
                className="btn-primary"
              >
                Publicar problema de {cat.name.toLowerCase()}
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-ink-700">
              <span className="chip">📋 {cat.count} profesionales</span>
              <span className="chip">⏱ Hoy mismo disponible</span>
              <span className="chip">✅ Garantía Sufix</span>
            </div>
          </div>
        </section>

        <section className="container-pad py-12">
          <h2 className="display text-2xl">Servicios destacados</h2>
          {services.length === 0 ? (
            <p className="mt-4 text-ink-600">
              Todavía no tenemos servicios publicados acá, pero podés publicar
              tu problema y los técnicos van a ofertar.
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {services.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          )}

          <h2 className="display mt-16 text-2xl">
            Profesionales en {cat.name.toLowerCase()}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {pros.map((p) => (
              <ProCard key={p.id} pro={p} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
