"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PostedJob } from "@/lib/data";
import { CATEGORIES } from "@/lib/data";
import { CategoryArt } from "./CategoryArt";
// Flujo viejo (precio de consulta + pago) pausado — ver lib/config.ts
// PROPUESTAS_CON_PRECIO_ACTIVO. Para reactivarlo, volver a importar y usar
// ContactarModal en vez de ContactoDirectoModal en este archivo.
import { ContactoDirectoModal } from "./ContactoDirectoModal";

interface Props {
  jobs: PostedJob[];
  supabaseJobIds: string[];
  esProfesional: boolean;
  sinSesion: boolean;
  yaContactadoIds: string[];
  misPublicacionesIds: string[];
}

const URGENCY_LABEL: Record<string, string> = {
  hoy: "Hoy mismo",
  esta_semana: "Esta semana",
  flexible: "Flexible",
};

const URGENCY_STYLE: Record<string, string> = {
  hoy: "bg-rose-100/80 text-rose-700",
  esta_semana: "bg-amber-100/80 text-amber-700",
  flexible: "bg-emerald-100/80 text-emerald-700",
};

const GRID = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

export function MarketplaceGrid({
  jobs,
  supabaseJobIds,
  esProfesional,
  sinSesion,
  yaContactadoIds,
  misPublicacionesIds,
}: Props) {
  const [selected, setSelected] = useState<PostedJob | null>(null);

  const esDemandante = !sinSesion && !esProfesional;
  const misJobs = esDemandante ? jobs.filter((j) => misPublicacionesIds.includes(j.id)) : [];
  const otrosJobs = esDemandante ? jobs.filter((j) => !misPublicacionesIds.includes(j.id)) : jobs;

  if (jobs.length === 0 && misJobs.length === 0) {
    return (
      <div className={`rounded-2xl border p-10 text-center ${esProfesional ? "border-white/10 bg-[#162420]" : "card"}`}>
        <div className="text-2xl">🤷</div>
        <h3 className={`display mt-2 text-2xl ${esProfesional ? "text-zap-50" : "text-sv-dark"}`}>Sin resultados</h3>
        <p className={`mt-2 ${esProfesional ? "text-zap-400" : "text-ink-400"}`}>Probá con otro filtro o publicá tu problema directo.</p>
        <Link href="/publicar" className="btn-primary mt-6 inline-block">
          Publicar mi problema
        </Link>
      </div>
    );
  }

  /* ── Vista demandante ─────────────────────────────── */
  if (esDemandante) {
    return (
      <>
        {/* Sección: mis consultas */}
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-sv-dark">
            Mis consultas
            {misJobs.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                {misJobs.length}
              </span>
            )}
          </h2>
          <p className="text-sm text-ink-400">
            {misJobs.length === 0
              ? "Todavía no publicaste ningún problema."
              : "Los técnicos que te mandaron propuesta están esperando tu respuesta."}
          </p>
        </div>

        <div className={GRID}>
          {/* Tarjeta publicar */}
          <Link
            href="/publicar"
            className="group flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-amber-300/60 bg-gradient-to-b from-amber-50 to-white p-6 text-center transition hover:border-amber-400"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-xl transition group-hover:bg-amber-200">
              +
            </span>
            <div>
              <p className="font-semibold text-sv-dark">Publicar un problema</p>
              <p className="mt-1 text-xs text-ink-400">Los técnicos te mandan presupuesto en minutos</p>
            </div>
          </Link>

          {misJobs.map((j, i) => (
            <JobCard
              key={j.id}
              job={j}
              index={i + 1}
              esProfesional={false}
              sinSesion={false}
              yaContactado={false}
              esMio={true}
              onContactar={() => {}}
            />
          ))}
        </div>

        {/* Separador: otras consultas */}
        {otrosJobs.length > 0 && (
          <>
            <div className="my-10 flex items-center gap-3">
              <div className="h-px flex-1 bg-ink-100" />
              <span className="text-[11px] font-medium text-ink-300">
                {otrosJobs.length} {otrosJobs.length === 1 ? "consulta más" : "consultas más"}
              </span>
              <div className="h-px flex-1 bg-ink-100" />
            </div>

            <div className={GRID}>
              {otrosJobs.map((j, i) => (
                <JobCard
                  key={j.id}
                  job={j}
                  index={i}
                  esProfesional={false}
                  sinSesion={false}
                  yaContactado={false}
                  esMio={false}
                  onContactar={() => {}}
                />
              ))}
            </div>
          </>
        )}

        {selected && <ContactoDirectoModal job={selected} onClose={() => setSelected(null)} />}
      </>
    );
  }

  /* ── Vista oferente / sin sesión ──────────────────── */
  return (
    <>
      <div className={GRID}>
        {sinSesion && (
          <Link
            href="/publicar"
            className="group flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-sv-primary/40 bg-gradient-to-b from-zap-50 to-white p-6 text-center transition hover:border-sv-primary/70"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sv-primary/10 text-2xl transition group-hover:bg-sv-primary/15">
              +
            </span>
            <div>
              <p className="font-semibold text-sv-dark">Publicar mi problema</p>
              <p className="mt-1 text-xs text-ink-400">Los técnicos te mandan presupuesto en minutos</p>
            </div>
          </Link>
        )}

        {otrosJobs.map((j, i) => (
          <JobCard
            key={j.id}
            job={j}
            index={sinSesion ? i + 1 : i}
            esProfesional={esProfesional}
            sinSesion={sinSesion}
            yaContactado={yaContactadoIds.includes(j.id)}
            esMio={false}
            onContactar={() => setSelected(j)}
          />
        ))}
      </div>

      {selected && <ContactoDirectoModal job={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function JobCard({
  job,
  index,
  esProfesional,
  sinSesion,
  yaContactado,
  esMio,
  onContactar,
}: {
  job: PostedJob;
  index: number;
  esProfesional: boolean;
  sinSesion: boolean;
  yaContactado: boolean;
  esMio: boolean;
  onContactar: () => void;
}) {
  const cat = CATEGORIES.find((c) => c.slug === job.categorySlug);
  const hue = cat?.hue ?? 180;
  const urgencyLabel = URGENCY_LABEL[job.urgency] ?? job.urgency;
  const urgencyStyle = URGENCY_STYLE[job.urgency] ?? "bg-ink-100 text-ink-500";

  const cardBase = esProfesional
    ? [
        "flex flex-col overflow-hidden rounded-2xl border",
        esMio ? "border-l-4 border-l-amber-400 border-white/10 bg-[#162420]" : "border-white/10 bg-[#162420]",
      ].join(" ")
    : [
        "card flex flex-col overflow-hidden",
        esMio ? "border-l-4 border-l-amber-400 ring-1 ring-amber-200" : "border-ink-100",
        !esMio && !sinSesion ? "opacity-90" : "",
      ].join(" ");

  const shadowHover = esProfesional
    ? "0 8px 30px rgba(0,0,0,0.40)"
    : "0 8px 30px rgba(14,17,13,0.10)";

  return (
    <div
      className={cardBase}
      style={{ animationDelay: `${Math.min(index * 45, 300)}ms`, transition: "box-shadow 200ms ease-out" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = shadowHover; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}
    >
      {/* Header: foto real o arte generativo */}
      <div className="relative h-44 w-full overflow-hidden">
        {job.photo
          ? <Image src={job.photo} alt={job.title} fill sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw" className={`object-cover ${!esMio && !esProfesional && !sinSesion ? "brightness-95 saturate-90" : ""}`} />
          : <CategoryArt icon={cat?.icon ?? "🔧"} hue={hue} className="h-full w-full" />
        }

        {/* Badge categoría */}
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/40 bg-white/30 px-2.5 py-1 text-xs font-medium text-sv-dark backdrop-blur-md">
          {cat?.icon} {cat?.name ?? job.categorySlug}
        </span>

        {/* Badge urgencia */}
        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${urgencyStyle}`}>
          {urgencyLabel}
        </span>

        {/* Badge "Mi consulta" */}
        {esMio && (
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            Mi consulta
          </span>
        )}
      </div>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className={`display line-clamp-2 text-[17px] leading-snug ${esProfesional ? "text-zap-50" : "text-sv-dark"}`}>
          {job.title}
        </h3>

        <p className={`mt-1.5 text-sm ${esProfesional ? "text-zap-400" : "text-ink-400"}`}>
          {job.postedBy} · {job.zone} · {job.postedAgo}
        </p>

        <p className={`mt-2 line-clamp-2 text-sm ${esProfesional ? "text-zap-200/70" : "text-ink-500"}`}>
          {job.description}
        </p>

        <div className="mt-3">
          <span className={`chip text-xs ${esProfesional ? "border-white/10 bg-white/5 text-zap-300" : ""}`}>
            💬 {job.bidsCount} propuesta{job.bidsCount !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="mt-auto pt-4">
          {/* Sin sesión */}
          {sinSesion && (
            <Link href="/ingresar" className="btn-outline block w-full text-center text-sm">
              Ingresar para contactar
            </Link>
          )}

          {/* Oferente */}
          {!sinSesion && esProfesional && !yaContactado && (
            <button type="button" onClick={onContactar} className="btn-primary w-full text-sm">
              Quiero hacer este trabajo
            </button>
          )}
          {!sinSesion && esProfesional && yaContactado && (
            <div className="w-full rounded-xl border border-zap-500/30 bg-zap-500/10 px-3 py-2 text-center text-xs font-medium text-zap-300">
              Ya avisaste tu interés · esperando que te elijan
            </div>
          )}

          {/* Demandante — propia */}
          {esMio && (
            <Link href="/mis-consultas" className="btn-outline block w-full text-center text-sm border-amber-300 text-amber-700 hover:bg-amber-50">
              Ver propuestas →
            </Link>
          )}

          {/* Demandante — ajena */}
          {!sinSesion && !esProfesional && !esMio && (
            <p className="text-center text-xs text-ink-300">
              Solo técnicos pueden enviar propuestas
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
