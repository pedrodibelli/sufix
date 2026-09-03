import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { IconBandera } from "@/components/icons";
import { createSupabaseServer } from "@/lib/supabase-server";
import { ReportarForm } from "./ReportarForm";

export const revalidate = 0;

export const metadata = {
  title: "Reportar un problema — Sufix",
  description: "Contanos si tuviste un problema con un técnico, algo no funciona en el sitio, o tenés una sugerencia.",
};

// Sección nueva (2026-09-03): hasta ahora la home prometía "podés reportar"
// en la sección Seguridad pero no existía ninguna forma de hacerlo. Esta
// página cubre los reportes generales (técnico, sitio, sugerencia) y exige
// cuenta; el reporte rápido de un perfil puntual vive en /tecnico/[id] y
// se puede hacer sin cuenta.
export default async function ReportarPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FBF8EF]">
        <section className="container-home py-12 sm:py-16">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 p-2.5 text-rose-500">
                <IconBandera />
              </span>
              <p className="text-[13px] font-bold uppercase tracking-wider text-sv-primary">
                Reportar
              </p>
            </div>
            <h1 className="display mt-3 text-3xl leading-tight text-sv-dark sm:text-4xl">
              ¿Tuviste un problema?
            </h1>
            <p className="mt-3.5 text-base leading-relaxed text-ink-500">
              Contanos qué pasó. Lo lee una persona de nuestro equipo, y así mantenemos el
              directorio limpio y el sitio funcionando bien.
            </p>

            <ReportarForm logueado={!!user} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
