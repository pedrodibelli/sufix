import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/data";
import { IconInstagram } from "@/components/icons";

// Footer completo (2026-09-03): antes era una sola línea con el logo. Se
// suma la estructura clásica de columnas + los links legales, que además
// son necesarios por la Ley 25.326 (política de privacidad).
//
// Criterio: SOLO links a páginas que existen de verdad. La competencia
// tiene ~25 links (Blog, Prensa, Centro de Ayuda, Urgencias 24hs...) que
// acá no existirían — un footer con pocos links que funcionan se ve mejor
// que uno lleno de links muertos. Cuando esas secciones existan, se suman.

// Los 5 oficios con más técnicos cargados hoy; el resto vive en /categorias.
const OFICIOS_DESTACADOS = ["plomeria", "electricidad", "gas", "aire", "cerrajeria"];

export function Footer() {
  const oficios = OFICIOS_DESTACADOS
    .map((slug) => CATEGORIES.find((c) => c.slug === slug))
    .filter((c): c is (typeof CATEGORIES)[number] => !!c);

  // Footer oscuro (2026-09-04). El resto de la app es crema; que el pie sea
  // verde oscuro lo separa del contenido y marca el final de la página, que es
  // lo que hace casi cualquier sitio con el que nos comparan. Mismo par de
  // colores que la tira "el problema" de la home (bg-sv-dark + crema).
  const linkCls = "text-[13.5px] text-[#FBF8EF]/60 transition-colors hover:text-[#FBF8EF]";
  const tituloCls = "font-display text-[13px] font-semibold uppercase tracking-wider text-[#FBF8EF]";

  return (
    <footer className="bg-sv-dark">
      <div className="container-home py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Marca */}
          <div className="lg:pr-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Sufix" width={26} height={26} className="h-[26px] w-[26px] object-contain" />
              <span className="font-display text-lg font-semibold text-[#FBF8EF]">Sufix</span>
            </div>
            <p className="mt-3 text-[13.5px] leading-relaxed text-[#FBF8EF]/60">
              Conectamos hogares con técnicos verificados de CABA y zona norte. Sin comisiones, sin
              intermediarios.
            </p>
            <a
              href="https://www.instagram.com/sufix.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[13.5px] font-medium text-[#FBF8EF]/60 transition-colors hover:text-[#FBF8EF]"
            >
              <IconInstagram className="h-[18px] w-[18px]" />
              @sufix.ar
            </a>
          </div>

          {/* Oficios */}
          <div>
            <h3 className={tituloCls}>Oficios</h3>
            <ul className="mt-3.5 space-y-2">
              {oficios.map((c) => (
                <li key={c.slug}>
                  <Link href={`/categoria/${c.slug}`} className={linkCls}>
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/categorias" className={`${linkCls} font-medium`}>
                  Ver todos los oficios →
                </Link>
              </li>
            </ul>
          </div>

          {/* Sufix — todo apunta a contenido que ya existe: "Cuánto cuesta"
              y "Preguntas frecuentes" son anclas a secciones de
              /como-funciona que ya estaban escritas, y "Seguridad" a la
              sección de la home. No hacía falta crear páginas nuevas. */}
          <div>
            <h3 className={tituloCls}>Sufix</h3>
            <ul className="mt-3.5 space-y-2">
              <li>
                <Link href="/#tecnicos" className={linkCls}>Buscar técnicos</Link>
              </li>
              <li>
                <Link href="/como-funciona" className={linkCls}>Cómo funciona</Link>
              </li>
              <li>
                <Link href="/como-funciona#precios" className={linkCls}>Cuánto cuesta</Link>
              </li>
              <li>
                <Link href="/como-funciona#faq" className={linkCls}>Preguntas frecuentes</Link>
              </li>
              <li>
                <Link href="/#seguridad" className={linkCls}>Seguridad</Link>
              </li>
            </ul>
          </div>

          {/* Para técnicos + Legal */}
          <div>
            <h3 className={tituloCls}>Para técnicos</h3>
            <ul className="mt-3.5 space-y-2">
              <li>
                <Link href="/registrar" className={linkCls}>Sumate como profesional</Link>
              </li>
              <li>
                <Link href="/ingresar" className={linkCls}>Ingresar a mi cuenta</Link>
              </li>
            </ul>

            <h3 className={`${tituloCls} mt-7`}>Legal y soporte</h3>
            <ul className="mt-3.5 space-y-2">
              <li>
                <Link href="/terminos" className={linkCls}>Términos y Condiciones</Link>
              </li>
              <li>
                <Link href="/privacidad" className={linkCls}>Política de Privacidad</Link>
              </li>
              <li>
                <a href="mailto:sufixar@gmail.com" className={linkCls}>sufixar@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[#FBF8EF]/15 pt-6">
          <p className="text-[13px] text-[#FBF8EF]/45">
            © {new Date().getFullYear()} Sufix. Hecho en Buenos Aires.
          </p>
          <p className="text-[13px] text-[#FBF8EF]/45">sufixapp.com</p>
        </div>
      </div>
    </footer>
  );
}
