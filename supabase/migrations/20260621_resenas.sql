-- Reseñas: el demandante califica al técnico cuando el trabajo está cerrado.

create table if not exists resenas (
  id             uuid default gen_random_uuid() primary key,
  publicacion_id uuid references publicaciones(id) on delete cascade,
  tecnico_id     uuid not null,          -- profesional calificado
  autor_id       uuid not null,          -- demandante que califica
  estrellas      int  not null check (estrellas between 1 and 5),
  comentario     text,
  creado_at      timestamptz default now(),
  unique (publicacion_id, autor_id)      -- una reseña por trabajo
);

alter table resenas enable row level security;

-- Lectura pública (para mostrar reputación en propuestas y perfil)
drop policy if exists "resenas_select_public" on resenas;
create policy "resenas_select_public" on resenas for select using (true);

-- Resumen por técnico: promedio + cantidad (respeta el RLS del que consulta)
create or replace view resenas_resumen
with (security_invoker = true) as
  select tecnico_id,
         round(avg(estrellas)::numeric, 2) as promedio,
         count(*)::int as total
  from resenas
  group by tecnico_id;

grant select on resenas_resumen to anon, authenticated;

-- Crear/actualizar reseña. Valida: dueño de la pub, pub cerrada, y toma el
-- técnico de la propuesta aceptada/completada. SECURITY DEFINER para integridad.
create or replace function crear_resena(
  p_publicacion_id uuid,
  p_estrellas int,
  p_comentario text
) returns void
language plpgsql security definer set search_path = public, auth as $$
declare
  v_owner   uuid;
  v_status  text;
  v_tecnico uuid;
begin
  if p_estrellas < 1 or p_estrellas > 5 then
    raise exception 'Calificación inválida';
  end if;

  select user_id, status into v_owner, v_status
  from publicaciones where id = p_publicacion_id;

  if v_owner is null then raise exception 'Publicación no encontrada'; end if;
  if v_owner <> auth.uid() then raise exception 'No autorizado'; end if;
  if v_status <> 'cerrado' then raise exception 'Solo podés calificar trabajos cerrados'; end if;

  select profesional_id into v_tecnico
  from propuestas
  where publicacion_id = p_publicacion_id::text
    and estado in ('aceptada', 'completada')
  limit 1;

  if v_tecnico is null then raise exception 'No se encontró el técnico del trabajo'; end if;

  insert into resenas (publicacion_id, tecnico_id, autor_id, estrellas, comentario)
  values (p_publicacion_id, v_tecnico, auth.uid(), p_estrellas, nullif(trim(p_comentario), ''))
  on conflict (publicacion_id, autor_id)
  do update set estrellas = excluded.estrellas,
                comentario = excluded.comentario,
                creado_at = now();
end;
$$;

grant execute on function crear_resena(uuid, int, text) to authenticated;
