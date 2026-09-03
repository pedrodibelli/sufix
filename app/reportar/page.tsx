import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
//
// El encabezado ("¿Tuviste un problema?" + bajada) vive dentro de
// ReportarForm, no acá: al enviar hay que ocultarlo para que la pantalla de
// agradecimiento quede sola y no repita algo que el usuario ya leyó.
export default async function ReportarPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FBF8EF]">
        <section className="container-home py-12 sm:py-16">
          <div className="mx-auto max-w-2xl">
            <ReportarForm logueado={!!user} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
