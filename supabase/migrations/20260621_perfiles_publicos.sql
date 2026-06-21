-- Vista pública del perfil del técnico: SOLO datos no sensibles.
-- (teléfono/email siguen protegidos por RLS en perfiles_profesionales y solo
--  se desbloquean tras el pago.)
create or replace view perfiles_publicos
with (security_invoker = false) as
  select user_id, nombre, zona, rubro, verificado, creado_at
  from perfiles_profesionales;

grant select on perfiles_publicos to anon, authenticated;
