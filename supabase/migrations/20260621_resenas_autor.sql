-- Guarda el nombre del autor de la reseña (nombre + inicial del apellido) para
-- mostrarlo con credibilidad sin exponer el apellido completo.
alter table resenas add column if not exists autor_nombre text;

create or replace function crear_resena(
  p_publicacion_id uuid,
  p_estrellas int,
  p_comentario text
) returns void
language plpgsql security definer set search_path = public, auth as $$
declare
  v_owner    uuid;
  v_status   text;
  v_tecnico  uuid;
  v_nombre   text;
  v_apellido text;
  v_autor    text;
begin
  if p_estrellas < 1 or p_estrellas > 5 then raise exception 'Calificación inválida'; end if;

  select user_id, status into v_owner, v_status from publicaciones where id = p_publicacion_id;
  if v_owner is null then raise exception 'Publicación no encontrada'; end if;
  if v_owner <> auth.uid() then raise exception 'No autorizado'; end if;
  if v_status <> 'cerrado' then raise exception 'Solo podés calificar trabajos cerrados'; end if;

  select profesional_id into v_tecnico from propuestas
    where publicacion_id = p_publicacion_id::text and estado in ('aceptada', 'completada') limit 1;
  if v_tecnico is null then raise exception 'No se encontró el técnico del trabajo'; end if;

  -- Nombre del autor: "Nombre A."
  select raw_user_meta_data->>'nombre', raw_user_meta_data->>'apellido'
    into v_nombre, v_apellido
  from auth.users where id = auth.uid();

  v_autor := nullif(trim(
    coalesce(v_nombre, '') ||
    case when coalesce(v_apellido, '') <> '' then ' ' || left(v_apellido, 1) || '.' else '' end
  ), '');

  insert into resenas (publicacion_id, tecnico_id, autor_id, autor_nombre, estrellas, comentario)
  values (p_publicacion_id, v_tecnico, auth.uid(), v_autor, p_estrellas, nullif(trim(p_comentario), ''))
  on conflict (publicacion_id, autor_id)
  do update set estrellas = excluded.estrellas,
                comentario = excluded.comentario,
                autor_nombre = excluded.autor_nombre,
                creado_at = now();
end;
$$;
