-- Ocultar técnicos del sitio sin borrarlos (2026-10-22, ver CLAUDE.md §25).
--
-- Motivo: al cargar el puntaje de Google Maps aparecieron 12 técnicos
-- duplicados (la misma persona verificada a mano y su ficha de Maps cargada
-- aparte, con el mismo teléfono). Esos se ocultan. (Los de menos de 4
-- estrellas se pensaban ocultar con esto también, pero al final se borraron
-- de la base — ver CLAUDE.md §25.)
--
-- Se hace en la VISTA y no en cada consulta: perfiles_publicos es lo que leen
-- la home, /categoria, /categorias, /tecnico/[id], el sitemap, /admin y el
-- cron de seguimiento. Filtrando acá, un técnico oculto desaparece de todos
-- lados a la vez (su perfil da 404) sin tocar una línea de código, y no hay
-- forma de que un listado nuevo se olvide del filtro.
--
-- Para volver a mostrar a alguien: UPDATE perfiles_profesionales SET
-- oculto_motivo = NULL WHERE user_id = '...'. No se borra nada: la cuenta, la
-- foto, las reseñas y los contactos siguen intactos.

ALTER TABLE perfiles_profesionales ADD COLUMN IF NOT EXISTS oculto_motivo text;

-- Mismas columnas y en el mismo orden que 20260918_directorio_cargados_por_equipo.sql
-- (CREATE OR REPLACE VIEW no deja sacar ni reordenar columnas); lo único
-- nuevo es el WHERE.
CREATE OR REPLACE VIEW perfiles_publicos
WITH (security_invoker = false) AS
  SELECT user_id, nombre, zona, rubro, verificado, creado_at, foto_url, telefono, titular, anos_experiencia,
         reputacion_fuente, reputacion_rating, reputacion_total, reputacion_url, cargado_por_equipo
  FROM perfiles_profesionales
  WHERE oculto_motivo IS NULL;

GRANT SELECT ON perfiles_publicos TO anon, authenticated;
