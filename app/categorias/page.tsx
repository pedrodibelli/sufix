import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryGrid } from "@/components/CategoryGrid";
import { CATEGORIES } from "@/lib/data";
import { createSupabaseServer } from "@/lib/supabase-server";

export const revalidate = 0; // se actualiza solo a medida que entran técnicos

export const metadata = {
  title: "Todos los oficios — Sufix",
  description: "Todos los oficios con técnicos verificados en Sufix: plomería, electricidad, gas, aire acondicionado, cerrajería y más.",
};

// Reescrita 2026-09-03: mostraba el campo `count` hardcodeado de
// lib/data.ts ("100 profesionales" por rubro), herencia del mock viejo
// pre-pivot — al entrar a la categoría el número real era otro, quedaba
// raro. Ahora cuenta los técnicos de verdad, con el mismo criterio que
// usa el directorio de la home (rubro cargado + teléfono).
export default async function CategoriasPage() {
  const supabase = await createSupabaseServer();
  const { data: tecnicos } = await supabase
    .from("perfiles_publicos")
    .select("rubro")
    .not("rubro", "is", null)
    .not("telefono", "is", null);

  const counts: Record<string, number> = {};
  for (const t of tecnicos ?? []) {
    for (const slug of (t.rubro as string[] | null) ?? []) {
      counts[slug] = (counts[slug] ?? 0) + 1;
    }
  }
  const totalTecnicos = (tecnicos ?? []).length;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FBF8EF]">
        <section className="container-home py-12 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[13px] font-bold uppercase tracking-wider text-sv-primary">Oficios</p>
            <h1 className="display mt-2 text-3xl leading-tight text-sv-dark sm:text-4xl">
              Todos los profesionales, <span className="text-sv-primary">en un solo lugar.</span>
            </h1>
            <p className="mt-3.5 text-base leading-relaxed text-ink-500">
              {totalTecnicos > 0
                ? `${totalTecnicos} técnicos verificados en ${CATEGORIES.length} oficios. Elegí el tuyo y escribiles directo por WhatsApp.`
                : `${CATEGORIES.length} oficios. Estamos sumando técnicos verificados a cada uno.`}
            </p>
          </div>

          <div className="mt-10 sm:mt-14">
            <CategoryGrid categories={CATEGORIES} counts={counts} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
