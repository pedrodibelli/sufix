-- Vista "legible" de contactos_tecnico para exportar a CSV/Sheets a mano
-- desde el Table Editor, sin depender de Zapier/Make/Google Cloud. Junta los
-- IDs con nombre del técnico y de quién contactó, en vez de mostrar UUIDs
-- pelados. No se le da GRANT a anon/authenticated a propósito: solo la ve
-- el dueño del proyecto (vos) desde el Table Editor / SQL Editor, no queda
-- expuesta por la API pública — tiene nombres de personas, es dato privado.
create or replace view contactos_tecnico_legible
with (security_invoker = true) as
select
  ct.creado_at as fecha,
  pp.nombre as tecnico,
  coalesce(array_to_string(pp.rubro, ', '), '') as rubro,
  pp.zona,
  ct.origen,
  coalesce(
    nullif(trim(coalesce(au.raw_user_meta_data->>'nombre', '') || ' ' || coalesce(au.raw_user_meta_data->>'apellido', '')), ''),
    au.email,
    'Anónimo (sin cuenta)'
  ) as contactado_por
from contactos_tecnico ct
left join perfiles_profesionales pp on pp.user_id = ct.tecnico_id
left join auth.users au on au.id = ct.contactado_por
order by ct.creado_at desc;
