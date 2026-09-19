-- Hasta ahora los 3 listados públicos (home, /categoria/[slug], /categorias)
-- filtran por verificado = true — bien para cortar el alta libre por la web
-- (nadie entra al directorio sin que un admin lo revise primero). Pero el
-- 2026-09-18 se cargaron 586 técnicos scrapeados de Google Maps por el
-- equipo de Sufix (no autoregistrados), pensados para dar volumen al
-- directorio DESDE HOY mientras el equipo los va contactando uno por uno
-- para recién ahí marcarlos verificado = true (ver runbook, CLAUDE.md §17).
-- Con el filtro actual quedan invisibles hasta que se llame a los 586, que
-- puede tardar semanas — contrario a la idea original del pivot.
--
-- Se agrega `cargado_por_equipo`: true SOLO para altas hechas a mano por el
-- equipo (via admin.auth.admin.createUser, nunca por el form de /registrar
-- — el trigger crear_perfil_al_registrarse no lo toca, así que un
-- autoregistro siempre nace en false). Los listados ahora muestran
-- verificado=true OR cargado_por_equipo=true — un self-signup sigue
-- esperando revisión como hasta ahora; un alta del equipo aparece ya,
-- simplemente sin la insignia verde de "Verificado" (esa sigue leyendo
-- SOLO `verificado`, sin tocar).

ALTER TABLE perfiles_profesionales
  ADD COLUMN IF NOT EXISTS cargado_por_equipo boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN perfiles_profesionales.cargado_por_equipo IS
  'true = alta manual del equipo Sufix (ej. scrapeo de Google Maps), no autoregistro por /registrar. Estos técnicos aparecen en el directorio público aunque verificado sea false todavía; la insignia "Verificado" sigue dependiendo solo de verificado.';

CREATE OR REPLACE VIEW perfiles_publicos
WITH (security_invoker = false) AS
  SELECT user_id, nombre, zona, rubro, verificado, cargado_por_equipo, creado_at, foto_url, telefono, titular, anos_experiencia,
         reputacion_fuente, reputacion_rating, reputacion_total, reputacion_url
  FROM perfiles_profesionales;

GRANT SELECT ON perfiles_publicos TO anon, authenticated;

-- Marca como cargados_por_equipo los 586 de la tanda de hoy: se crearon con
-- email placeholder "lead-<telefono>@sufixapp.com" (no tienen email real
-- todavía), un patrón que no usa ningún autoregistro real — sirve de
-- identificador exacto para esta tanda y para las que vengan después con el
-- mismo método.
UPDATE perfiles_profesionales
SET cargado_por_equipo = true
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE 'lead-%@sufixapp.com'
);
