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
//
// 2026-10-22: se sumó el mail que se pide antes de abrir WhatsApp (tabla
// contactantes, ver CLAUDE.md §24), los mails de consejos y de "¿cómo te
// fue?", las reseñas sin cuenta, y Vercel Web Analytics (que se había
// agregado el 2026-09-23 sin actualizar esta página). Ese mismo día se cargó
// el puntaje de Google Maps de todos los técnicos cargados por el equipo: la
// línea que decía "solo con tu consentimiento explícito" dejó de ser cierta.
const ACTUALIZADO = "22 de octubre de 2026";

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
                  Si tu negocio tiene una ficha pública en Google Maps: su puntaje, la cantidad de
                  reseñas y el link a la ficha. Si no querés que lo mostremos, escribinos y lo sacamos.
                </li>
              </ul>

              <p className="mt-4 font-medium text-sv-dark">Si contactás a un técnico sin tener cuenta:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Tu email (obligatorio para seguir a WhatsApp) y tu WhatsApp (opcional).</li>
                <li>A qué técnicos contactaste y cuándo.</li>
                <li>Si marcaste la casilla para recibir novedades de Sufix.</li>
                <li>
                  Tu email queda guardado en tu navegador para no volver a pedírtelo la próxima vez que
                  contactes a alguien.
                </li>
              </ul>

              <p className="mt-4 font-medium text-sv-dark">Cuando usás el sitio:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  Registramos cuándo alguien toca &quot;Contactar por WhatsApp&quot; en un perfil, para
                  saber si el directorio está sirviendo. Si estás con sesión iniciada queda asociado a
                  tu cuenta; si no, al email que nos dejaste.
                </li>
                <li>
                  Registramos las visitas a los perfiles de técnicos, de la misma forma (asociadas a
                  tu cuenta si iniciaste sesión, anónimas si no).
                </li>
                <li>Las reseñas que dejás: tu nombre, la puntuación y el comentario.</li>
              </ul>
              <p className="mt-3 text-sm text-ink-500">
                No usamos cookies de publicidad ni herramientas de seguimiento entre sitios. Solo las
                cookies necesarias para mantener tu sesión iniciada. Para contar visitas usamos Vercel
                Web Analytics, que mide páginas vistas de forma agregada y sin cookies.
              </p>
            </section>

            <section>
              <h2 className="display text-xl text-sv-dark">3. Para qué usamos tus datos</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Mostrar el perfil público de los técnicos a quien busca un servicio.</li>
                <li>Permitir el contacto directo por WhatsApp entre las partes.</li>
                <li>Identificar tu cuenta y poder comunicarnos con vos si hiciera falta.</li>
                <li>Entender qué tan bien funciona el directorio y mejorarlo.</li>
              </ul>
              <p className="mt-3">
                <strong>Los emails que te podemos mandar son estos:</strong>
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Confirmación de tu dirección de email al crear la cuenta.</li>
                <li>Recuperación de contraseña, solo si vos la pedís.</li>
                <li>Si sos técnico: el aviso de que revisamos tu perfil y ya está publicado.</li>
                <li>
                  Si contactaste a un técnico: unos consejos de seguridad la primera vez, y unos días
                  después un email preguntándote cómo te fue, con la opción de dejarle una reseña.
                </li>
                <li>
                  Novedades de Sufix, <strong>solo si marcaste la casilla</strong> para recibirlas.
                </li>
              </ul>
              <p className="mt-3">
                Todos estos emails, salvo los de tu cuenta, traen un link para darte de baja. Si te das
                de baja, no te escribimos más.
              </p>
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
                Si sos <strong>usuario que busca un servicio</strong>, tu email, tu WhatsApp y tus
                datos de cuenta no son públicos — tampoco para los técnicos que contactás. Sí es
                público el nombre con el que firmes las reseñas que dejes.
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
                <li><strong>Vercel</strong> — hosting del sitio y conteo de visitas (Web Analytics).</li>
                <li><strong>Resend</strong> — envío de los emails de arriba. Solo recibe tu dirección y el contenido del aviso.</li>
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
