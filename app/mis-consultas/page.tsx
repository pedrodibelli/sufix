import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createSupabaseServer } from "@/lib/supabase-server";
import { TecnicosContactadosView, type ContactoItem } from "./TecnicosContactadosView";
import { QuienTeContactoView } from "./QuienTeContactoView";
import { type TecnicoPublico } from "@/components/TecnicoCard";

export const revalidate = 0;

// "Mis consultas" pasó de ser el tablero del flujo viejo (publicar problema →
// propuestas) a un historial de contactos — ver CLAUDE.md "Pivot 2026-08-2x".
// El código viejo (DemandanteView.tsx, OferenteView.tsx) sigue completo en el
// repo sin usarse, y en el tag de git idea-publicar-problema-2026-08-20 con
// el resto del flujo si hiciera falta volver.
export default async function MisConsultasPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const esProfesional = user.user_metadata?.es_profesional === true;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FBF8EF]">
        <div className="container-pad py-10">
          {esProfesional ? <QuienTeContactoData userId={user.id} /> : <TecnicosContactadosData userId={user.id} />}
        </div>
      </main>
      <Footer />
    </>
  );
}

async function TecnicosContactadosData({ userId }: { userId: string }) {
  const supabase = await createSupabaseServer();

  const { data: contactos } = await supabase
    .from("contactos_tecnico")
    .select("id, tecnico_id, creado_at")
    .eq("contactado_por", userId)
    .order("creado_at", { ascending: false });

  // Agrupar por técnico: cuántas veces + primera/última vez.
  const porTecnico = new Map<string, { veces: number; ultimaFecha: string }>();
  for (const c of contactos ?? []) {
    const prev = porTecnico.get(c.tecnico_id);
    if (!prev) porTecnico.set(c.tecnico_id, { veces: 1, ultimaFecha: c.creado_at });
    else prev.veces += 1;
  }
  const tecnicoIds = [...porTecnico.keys()];

  const [{ data: perfiles }, { data: resumenRows }, { data: misResenas }] = await Promise.all([
    tecnicoIds.length > 0
      ? supabase.from("perfiles_publicos").select("user_id, nombre, zona, rubro, verificado, foto_url, telefono, titular, creado_at").in("user_id", tecnicoIds)
      : Promise.resolve({ data: [] as TecnicoPublico[] }),
    tecnicoIds.length > 0
      ? supabase.from("resenas_resumen").select("tecnico_id, promedio, total").in("tecnico_id", tecnicoIds)
      : Promise.resolve({ data: [] as { tecnico_id: string; promedio: number; total: number }[] }),
    supabase.from("resenas").select("tecnico_id").eq("autor_id", userId).is("publicacion_id", null),
  ]);

  const resumenMap = Object.fromEntries(
    (resumenRows ?? []).map((r) => [r.tecnico_id, { promedio: Number(r.promedio), total: Number(r.total) }])
  );
  const yaResenados = new Set((misResenas ?? []).map((r) => r.tecnico_id as string));

  const items: ContactoItem[] = (perfiles ?? [])
    .map((p) => {
      const meta = porTecnico.get(p.user_id)!;
      return {
        perfil: p as TecnicoPublico,
        resumen: resumenMap[p.user_id],
        veces: meta.veces,
        ultimaFecha: meta.ultimaFecha,
        yaResenado: yaResenados.has(p.user_id),
      };
    })
    .sort((a, b) => new Date(b.ultimaFecha).getTime() - new Date(a.ultimaFecha).getTime());

  return <TecnicosContactadosView items={items} />;
}

async function QuienTeContactoData({ userId }: { userId: string }) {
  const supabase = await createSupabaseServer();

  const { data: contactos } = await supabase
    .from("contactos_tecnico")
    .select("id, contactado_por, origen, creado_at")
    .eq("tecnico_id", userId)
    .order("creado_at", { ascending: false })
    .limit(100);

  return <QuienTeContactoView contactos={contactos ?? []} />;
}
