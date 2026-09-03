import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Política de Privacidad — Sufix",
  description: "Qué datos personales recolecta Sufix, para qué los usa y cómo ejercer tus derechos sobre ellos.",
};

// Borrador redactado en 2026-09-03 a partir del esquema real de la base
// (perfiles_profesionales, resenas, contactos_tecnico, vistas_perfil_tecnico
// y el bucket "avatars") y de los servicios de terceros que efectivamente
// usamos hoy. IMPORTANTE: es un punto de partida honesto, NO un documento
// revisado por un abogado. Si se agregan servicios nuevos (analytics,
// publicidad, pagos), hay que actualizar esta página.
const ACTUALIZADO = "3 de septiembre de 2026";

export default function PrivacidadPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FBF8EF]">
        <section className="container-home py-12 sm:py-16">
          <p className="text-[13px] font-bold uppercase tracking-wider text-sv-primary">Legal</p>
          <h1 className="display mt-2 text-3xl leading-tight text-sv-dark sm:text-4xl">
            Política de Privacidad
          </h1>
          <p className="mt-3 text-sm text-ink-500">Última actualización: {ACTUALIZADO}</p>

          <div className="mt-10 max-w-3xl space-y-8 text-[15px] leading-relaxed text-ink-700">
            <section>
              <h2 className="display text-xl text-sv-dark">1. Quiénes somos</h2>
              <p className="mt-2">
                Sufix es un directorio de técnicos de oficios que funciona en CABA y zona norte del
                GBA. Esta política explica qué datos personales recolectamos, para qué los usamos y
                cómo podés ejercer tus derechos sobre ellos, conforme a la Ley 25.326 de Protección
                de los Datos Personales de la República Argentina.
              </p>
              <p className="mt-2">
                Responsable del tratamiento: <strong>Sufix</strong>. Contacto:{" "}
                <a href="mailto:sufixar@gmail.com" className="font-medium text-sv-primary underline underline-offset-2">
                  sufixar@gmail.com
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="display text-xl text-sv-dark">2. Qué datos recolectamos</h2>
              <p className="mt-2 font-medium text-sv-dark">Si creás una cuenta:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Nombre y apellido</li>
                <li>Email y contraseña (la contraseña se guarda cifrada; nunca la vemos)</li>
                <li>Si sos técnico: teléfono de WhatsApp, rubros, zonas de trabajo</li>
              </ul>

              <p className="mt-4 font-medium text-sv-dark">Si sos técnico y completás tu perfil:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Foto de perfil</li>
                <li>Frase descriptiva y años de experiencia (opcionales)</li>
                <li>
                  Calificación de sitios externos (Google Maps, PorAca), solo si nos diste tu
                  consentimiento explícito para mostrarla
                </li>
              </ul>

              <p className="mt-4 font-medium text-sv-dark">Cuando usás el sitio:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Registramos cuándo alguien toca &quot;Contactar por WhatsApp&quot; en un perfil, para
                  saber si el directorio está sirviendo. Si estás con sesión iniciada queda asociado a
                  tu cuenta; si no, se registra de forma anónima.
                </li>
                <li>
                  Registramos las visitas a los perfiles de técnicos, de la misma forma (asociadas a
                  tu cuenta si iniciaste sesión, anónimas si no).
                </li>
                <li>Las reseñas que dejás: tu nombre, la puntuación y el comentario.</li>
              </ul>
              <p className="mt-3 text-sm text-ink-500">
                No usamos cookies de publicidad ni herramientas de seguimiento de terceros. Solo las
                cookies necesarias para mantener tu sesión iniciada.
              </p>
            </section>

            <section>
              <h2 className="display text-xl text-sv-dark">3. Para qué usamos tus datos</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Mostrar el perfil público de los técnicos a quien busca un servicio.</li>
                <li>Permitir el contacto directo por WhatsApp entre las partes.</li>
                <li>Enviar avisos por email relacionados con tu cuenta o tu actividad en el sitio.</li>
                <li>Entender qué tan bien funciona el directorio y mejorarlo.</li>
              </ul>
              <p className="mt-3">
                <strong>No vendemos tus datos personales ni los cedemos con fines publicitarios.</strong>
              </p>
            </section>

            <section>
              <h2 className="display text-xl text-sv-dark">4. Qué es público y qué no</h2>
              <p className="mt-2">
                Si sos <strong>técnico</strong>, tu perfil es público: nombre, foto, rubros, zonas,
                calificación y <strong>tu teléfono de WhatsApp</strong>. Eso es justamente el
                propósito del directorio — que te puedan contactar. Si no querés que tu teléfono sea
                visible, no deberías tener un perfil publicado.
              </p>
              <p className="mt-2">
                Si sos <strong>usuario que busca un servicio</strong>, tu email y tus datos de cuenta
                no son públicos. Sí es público tu nombre en las reseñas que dejes.
              </p>
            </section>

            <section>
              <h2 className="display text-xl text-sv-dark">5. Con quién compartimos datos</h2>
              <p className="mt-2">
                Usamos proveedores de infraestructura para que el sitio funcione. Tus datos se alojan
                en sus servidores, que pueden estar fuera de Argentina:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li><strong>Supabase</strong> — base de datos, autenticación y almacenamiento de fotos.</li>
                <li><strong>Vercel</strong> — hosting del sitio.</li>
                <li><strong>Google (Gmail)</strong> — envío de los emails de aviso.</li>
              </ul>
              <p className="mt-2">
                No compartimos tus datos con nadie más, salvo requerimiento legal de autoridad
                competente.
              </p>
            </section>

            <section>
              <h2 className="display text-xl text-sv-dark">6. Tus derechos</h2>
              <p className="mt-2">
                Podés pedirnos acceder a tus datos, corregirlos, actualizarlos o eliminarlos —
                incluida la baja total de tu cuenta y de tu perfil público. Escribinos a{" "}
                <a href="mailto:sufixar@gmail.com" className="font-medium text-sv-primary underline underline-offset-2">
                  sufixar@gmail.com
                </a>{" "}
                y lo resolvemos.
              </p>
              <p className="mt-3 text-sm text-ink-500">
                El titular de los datos personales tiene la facultad de ejercer el derecho de acceso
                a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se
                acredite un interés legítimo al efecto, conforme lo establecido en el artículo 14,
                inciso 3 de la Ley N° 25.326.
              </p>
              <p className="mt-3 text-sm text-ink-500">
                La Agencia de Acceso a la Información Pública, en su carácter de órgano de control de
                la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que
                interpongan quienes resulten afectados en sus derechos por incumplimiento de las
                normas vigentes en materia de protección de datos personales.
              </p>
            </section>

            <section>
              <h2 className="display text-xl text-sv-dark">7. Cambios en esta política</h2>
              <p className="mt-2">
                Si cambiamos cómo tratamos los datos, vamos a actualizar esta página y la fecha de
                arriba. Si el cambio es importante, lo avisamos en el sitio.
              </p>
            </section>

            <div className="rounded-2xl border border-dashed border-ink-200 p-5 text-sm text-ink-500">
              ¿Buscás las reglas de uso del sitio? Están en los{" "}
              <Link href="/terminos" className="font-medium text-sv-primary underline underline-offset-2">
                Términos y Condiciones
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
