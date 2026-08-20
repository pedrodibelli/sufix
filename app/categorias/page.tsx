import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryGrid } from "@/components/CategoryGrid";
import { CATEGORIES } from "@/lib/data";

export default function CategoriasPage() {
  return (
    <>
      <Header />
      <main className="container-pad py-12">
        <h1 className="display text-4xl md:text-5xl">Categorías</h1>
        <p className="mt-3 max-w-2xl text-ink-700">
          Diez rubros donde la asimetría de información hace daño: vos no sabés
          cuánto cuesta el oficio, el técnico sí. Sufix te empareja la balanza.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-ink-500">
          No cubrimos limpieza ni servicios de rutina. Es a propósito: donde
          ya sabés el precio, no hace falta Sufix.
        </p>
        <div className="mt-10">
          <CategoryGrid categories={CATEGORIES} />
        </div>
      </main>
      <Footer />
    </>
  );
}
