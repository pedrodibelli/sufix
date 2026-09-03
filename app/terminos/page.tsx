import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Términos y Condiciones — Sufix",
  description: "Términos y condiciones de uso de Sufix, el directorio de técnicos verificados de CABA.",
};

// Borrador redactado en 2026-09-03 a partir de cómo funciona la app hoy
// (directorio + contacto directo por WhatsApp, sin pagos ni intermediación).
// IMPORTANTE: es un punto de partida honesto sobre lo que hace el producto,
// NO un documento revisado por un abogado. Si el modelo de negocio cambia
// (ej. si Sufix vuelve a cobrar o a gestionar pagos, ver CLAUDE.md §9),
// esta página tiene que actualizarse.
const ACTUALIZADO = "3 de septiembre de 2026";

export default function TerminosPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FBF8EF]">
        <section className="container-home py-12 sm:py-16">
          <p className="text-[13px] font-bold uppercase tracking-wider text-sv-primary">Legal</p>
          <h1 className="display mt-2 text-3xl leading-tight text-sv-dark sm:text-4xl">
            Términos y Condiciones
          </h1>
          <p className="mt-3 text-sm text-ink-500">Última actualización: {ACTUALIZADO}</p>

          <div className="mt-10 max-w-3xl space-y-8 text-[15px] leading-relaxed text-ink-700">
            <section>
              <h2 className="display text-xl text-sv-dark">1. Qué es Sufix</h2>
              <p className="mt-2">
                Sufix es un directorio de profesionales de oficios (plomería, electricidad, gas,
                aire acondicionado y otros) que operan en la Ciudad Autónoma de Buenos Aires y zona
                norte del Gran Buenos Aires. Su única función es mostrar perfiles de técnicos y
                permitir que quien los necesite los contacte de forma directa por WhatsApp.
              </p>
              <p className="mt-2">
                Al usar el sitio aceptás estos términos. Si no estás de acuerdo, no lo uses.
              </p>
            </section>

            <section>
              <h2 className="display text-xl text-sv-dark">2. Sufix no es parte del trabajo contratado</h2>
              <p className="mt-2">
                Esto es lo más importante de entender: <strong>Sufix no presta servicios de oficios,
                no emplea a los técnicos, no los supervisa y no participa del trabajo que acuerden
                entre ustedes.</strong> Cuando tocás &quot;Contactar por WhatsApp&quot;, la conversación,
                el presupuesto, el precio, la fecha, la forma de pago y la ejecución del trabajo son
                un acuerdo privado entre vos y el técnico.
              </p>
              <p className="mt-2">
                En consecuencia, Sufix no responde por la calidad, los plazos, los daños, los
                incumplimientos ni por cualquier conflicto derivado del trabajo contratado. Te
                recomendamos acordar por escrito el alcance y el precio antes de que empiece el
                trabajo, y pedir factura cuando corresponda.
              </p>
            </section>

            <section>
              <h2 className="display text-xl text-sv-dark">3. Sufix es gratis</h2>
              <p className="mt-2">
                Hoy no cobramos nada: ni al usuario que busca un técnico, ni al técnico que aparece
                en el directorio. No cobramos comisión sobre los trabajos ni gestionamos pagos entre
                las partes. Si esto cambiara en el futuro, lo vamos a avisar antes en el sitio.
              </p>
            </section>

            <section>
              <h2 className="display text-xl text-sv-dark">4. Qué significa &quot;Verificado&quot;</h2>
              <p className="mt-2">
                El sello &quot;Verificado&quot; significa que una persona de nuestro equipo revisó ese
                perfil antes de publicarlo: que los datos de contacto sean reales y que el técnico
                tenga historial comprobable en su oficio. <strong>No es una garantía sobre el trabajo
                que vaya a realizar</strong>, ni una certificación de matrícula, ni un control de
                antecedentes. Es una revisión manual de nuestro equipo, nada más y nada menos.
              </p>
            </section>

            <section>
              <h2 className="display text-xl text-sv-dark">5. Reputación de sitios externos</h2>
              <p className="mt-2">
                Algunos perfiles muestran una calificación proveniente de sitios externos (por
                ejemplo Google Maps o PorAca), siempre identificada con el nombre de la fuente y con
                un enlace para verificarla en el sitio de origen. Esa calificación pertenece a esa
                plataforma, no a Sufix, y se muestra únicamente con el consentimiento del técnico.
                No copiamos ni reproducimos reseñas individuales de terceros dentro de Sufix.
              </p>
            </section>

            <section>
              <h2 className="display text-xl text-sv-dark">6. Cuentas y contenido de los usuarios</h2>
              <p className="mt-2">
                Si creás una cuenta, sos responsable de la veracidad de los datos que cargás y de
                mantener tu contraseña segura. Los técnicos son responsables de que su perfil (foto,
                zonas, rubros, teléfono) sea real y esté actualizado.
              </p>
              <p className="mt-2">
                Las reseñas que se dejan en Sufix deben referirse a una experiencia real. Podemos
                dar de baja perfiles o reseñas que sean falsos, ofensivos, engañosos o que suplanten
                la identidad de otra persona.
              </p>
            </section>

            <section>
              <h2 className="display text-xl text-sv-dark">7. Disponibilidad del servicio</h2>
              <p className="mt-2">
                Sufix es un proyecto en desarrollo. Puede tener interrupciones, errores o cambios de
                funcionalidad sin aviso previo. No garantizamos disponibilidad continua del sitio.
              </p>
            </section>

            <section>
              <h2 className="display text-xl text-sv-dark">8. Contacto</h2>
              <p className="mt-2">
                Por cualquier consulta sobre estos términos, escribinos a{" "}
                <a href="mailto:sufixar@gmail.com" className="font-medium text-sv-primary underline underline-offset-2">
                  sufixar@gmail.com
                </a>
                .
              </p>
            </section>

            <div className="rounded-2xl border border-dashed border-ink-200 p-5 text-sm text-ink-500">
              ¿Buscás cómo tratamos tus datos personales? Está todo en la{" "}
              <Link href="/privacidad" className="font-medium text-sv-primary underline underline-offset-2">
                Política de Privacidad
              </Link>
              .
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
