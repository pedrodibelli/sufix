import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostedJobCard } from "@/components/PostedJobCard";
import { type PostedJob } from "@/lib/data";
import { createSupabaseServer } from "@/lib/supabase-server";
import { type Publicacion } from "@/lib/supabase";

export const revalidate = 0;

export default async function OferentesPage() {
  const supabase = await createSupabaseServer();
  const { data: dbJobs } = await supabase
    .from("publicaciones")
    .select("*")
    .neq("status", "cerrado")
    .order("created_at", { ascending: false })
    .limit(6);

  const liveJobs: PostedJob[] = (dbJobs ?? []).map((p: Publicacion) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    categorySlug: p.category_slug,
    zone: p.zone,
    urgency: p.urgency as PostedJob["urgency"],
    photo: p.photo ?? null,
    photos: p.photos ?? [],
    postedBy: p.posted_by,
    postedAgo: "reciente",
    budget: { min: 0, max: 0 },
    bidsCount: 0,
    status: p.status as PostedJob["status"],
  }));
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-ink-950 text-white">
          <div className="absolute -right-32 -top-24 h-[500px] w-[500px] rounded-full bg-zap-300/20 blur-3xl" />
          <div className="container-pad relative grid gap-12 py-20 md:grid-cols-12">
            <div className="md:col-span-7">
              <span className="text-xs uppercase tracking-wider text-zap-300">
                Para profesionales
              </span>
              <h1 className="display mt-3 text-5xl leading-[1.05] md:text-7xl">
                Cobrás el 100%
                <br />
                de tu trabajo.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-ink-300">
                Sin comisión sobre tu cotización. La tarifa la paga el cliente.
                Vos elegís qué tomar y cuándo.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#registro" className="btn-zap">
                  Registrarme
                </Link>
                <Link href="/como-funciona" className="btn-outline border-ink-700 bg-transparent text-white hover:border-white">
                  Cómo funciona
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-4">
                <Stat label="Comisión" value="0%" />
                <Stat label="Costo por usar la app" value="$0" />
                <Stat label="Trabajos pre-diagnosticados" value="100%" />
              </div>
            </div>
            <div className="relative md:col-span-5">
              <PreviewCard />
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="container-pad py-20">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="display text-3xl md:text-4xl">
                Productividad, no solo clientes.
              </h2>
              <p className="mt-4 text-ink-700">
                Otros marketplaces te venden visibilidad. Sufix te vende
                eficiencia: el cliente ya describió el problema, ya aceptó un
                rango y está en zona de alto ticket.
              </p>
            </div>
            <div className="grid gap-3">
              <Bullet
                title="Cero viajes en falso"
                body="Llegás con el problema ya diagnosticado y la herramienta correcta."
              />
              <Bullet
                title="Reputación que se acumula"
                body="Cada trabajo bien hecho queda registrado y visible al próximo cliente."
              />
              <Bullet
                title="Acceso a barrios premium"
                body="Llegás a zonas donde hoy no tenés contactos."
              />
            </div>
          </div>
        </section>

        {/* Live demand */}
        <section className="bg-white py-20 ring-1 ring-ink-100">
          <div className="container-pad">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
                  EN VIVO
                </div>
                <h2 className="display mt-2 text-3xl md:text-4xl">
                  Trabajos esperando un técnico
                </h2>
                <p className="mt-2 text-ink-600">
                  Una muestra de los pedidos activos esta hora.
                </p>
              </div>
            </div>
            {liveJobs.length === 0 ? (
              <p className="text-ink-500">No hay pedidos activos en este momento.</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {liveJobs.map((j) => (
                  <PostedJobCard key={j.id} job={j} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Registration */}
        <section id="registro" className="container-pad py-20">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="display text-3xl md:text-4xl">
                Sumate al ecosistema.
              </h2>
              <p className="mt-4 max-w-md text-ink-700">
                Validamos identidad, matrícula y antecedentes. Te entrevistamos
                en persona. Si todo está bien, quedás verificado en 48–72 hs.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-ink-700">
                <li>📷 Foto de DNI</li>
                <li>📜 Matrícula (cuando aplique)</li>
                <li>📞 Entrevista presencial</li>
                <li>🛠 Lista de oficios y especialidades</li>
              </ul>
            </div>
            <form className="card space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre">
                  <input className="field" placeholder="Martín" />
                </Field>
                <Field label="Apellido">
                  <input className="field" placeholder="Acosta" />
                </Field>
              </div>
              <Field label="Email">
                <input className="field" placeholder="martin@ejemplo.com" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Celular">
                  <input className="field" placeholder="+54 9 11" />
                </Field>
                <Field label="Oficio">
                  <select className="field">
                    <option>Plomería</option>
                    <option>Electricidad</option>
                    <option>Gas matriculado</option>
                    <option>Aire acondicionado</option>
                    <option>Cerrajería</option>
                    <option>Pintura</option>
                    <option>Carpintería</option>
                  </select>
                </Field>
              </div>
              <Field label="Zonas donde trabajás">
                <input
                  className="field"
                  placeholder="Palermo, Belgrano, Núñez…"
                />
              </Field>
              <button
                type="button"
                className="btn-zap w-full"
              >
                Solicitar verificación
              </button>
              <p className="text-xs text-ink-500">
                Al continuar aceptás recibir un llamado del equipo de Sufix
                para coordinar la entrevista.
              </p>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function Bullet({ title, body }: { title: string; body: string }) {
  return (
    <div className="card border-ink-100 p-5">
      <div className="text-sm font-semibold">{title}</div>
      <p className="mt-1 text-sm text-ink-600">{body}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900/50 p-4">
      <div className="display text-3xl text-zap-300">{value}</div>
      <div className="mt-1 text-xs text-ink-300">{label}</div>
    </div>
  );
}

function PreviewCard() {
  return (
    <div className="relative mx-auto h-[420px] max-w-md">
      <div className="absolute right-0 top-0 w-[88%] rotate-[2deg] rounded-2xl border border-ink-800 bg-ink-900 p-4 text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-2 text-xs">
          <span className="pill bg-zap-300 text-ink-950">Nuevo pedido</span>
          <span className="text-ink-400">a 2,3 km</span>
        </div>
        <div className="mt-2 text-sm font-semibold">
          Instalar split que ya tengo comprado — 2200 frigorías
        </div>
        <div className="mt-2 text-xs text-ink-400">
          Belgrano R · Esta semana · Diagnóstico OK
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-ink-300">Rango aceptado</span>
          <span className="font-semibold text-zap-300">$80k – $130k</span>
        </div>
        <button className="mt-3 w-full rounded-full bg-zap-300 px-3 py-2 text-sm font-semibold text-ink-950">
          Hacer oferta
        </button>
      </div>

      <div className="absolute bottom-0 left-0 w-[80%] -rotate-[3deg] rounded-2xl border border-ink-800 bg-ink-900 p-4 text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3">
          <Image
            src="https://i.pravatar.cc/64?img=12"
            alt=""
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="text-sm">
            <div className="font-semibold">Martín A.</div>
            <div className="text-xs text-ink-400">
              9 trabajos cerrados este mes
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-ink-800 p-2">
            <div className="text-ink-400">Facturado</div>
            <div className="text-base font-semibold text-zap-300">
              $462.000
            </div>
          </div>
          <div className="rounded-lg bg-ink-800 p-2">
            <div className="text-ink-400">Comisión Sufix</div>
            <div className="text-base font-semibold text-zap-300">$0</div>
          </div>
        </div>
      </div>
    </div>
  );
}
