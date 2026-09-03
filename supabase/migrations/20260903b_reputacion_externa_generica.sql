-- Generaliza la reputación externa (2026-09-03, segunda vuelta): la
-- migración anterior (20260903_reputacion_google_maps.sql) dejó 3 campos
-- hardcodeados para Google Maps. El usuario pidió sumar PorAca
-- (poraca.com.ar) con el mismo formato — en vez de agregar otra terna de
-- columnas específica, se generaliza a una sola "reputación externa" con
-- el nombre de la fuente como dato, así sirve para Google, PorAca, o
-- cualquier otro sitio que aparezca después, sin tocar el esquema de nuevo.
--
-- Mismo criterio de antes (ver migración previa para el porqué completo):
-- NO se copian reseñas individuales de gente real, solo el número agregado
-- (rating + cantidad), siempre con el nombre de la fuente al lado y un link
-- para verificar. Opt-in por técnico: si no está cargado, no aplica.

-- La vista depende de las columnas viejas de Google -- hay que sacarla de
-- encima antes de poder tocar la tabla (mismo gotcha que la migración de
-- zona múltiple, 20260822f).
DROP VIEW IF EXISTS perfiles_publicos;

ALTER TABLE perfiles_profesionales
  ADD COLUMN IF NOT EXISTS reputacion_fuente text,   -- 'Google Maps', 'PorAca', etc.
  ADD COLUMN IF NOT EXISTS reputacion_rating numeric(2,1),
  ADD COLUMN IF NOT EXISTS reputacion_total integer,
  ADD COLUMN IF NOT EXISTS reputacion_url text;

-- Migra lo que ya se había cargado con las columnas viejas (David Ochoa)
UPDATE perfiles_profesionales
SET reputacion_fuente = 'Google Maps',
    reputacion_rating = google_rating,
    reputacion_total = google_reviews_count,
    reputacion_url = google_maps_url
WHERE google_rating IS NOT NULL;

ALTER TABLE perfiles_profesionales
  DROP COLUMN IF EXISTS google_rating,
  DROP COLUMN IF EXISTS google_reviews_count,
  DROP COLUMN IF EXISTS google_maps_url;

COMMENT ON COLUMN perfiles_profesionales.reputacion_fuente IS
  'Nombre del sitio de origen de la reputación externa (ej. "Google Maps", "PorAca"). NULL = no aplica.';
COMMENT ON COLUMN perfiles_profesionales.reputacion_rating IS
  'Rating de esa fuente externa (0.0-5.0), solo para técnicos que confirmaron que quieren mostrarlo.';
COMMENT ON COLUMN perfiles_profesionales.reputacion_total IS
  'Cantidad de reseñas de esa fuente externa al momento de cargar el dato.';
COMMENT ON COLUMN perfiles_profesionales.reputacion_url IS
  'Link al perfil/ficha real en esa fuente externa, para que cualquiera pueda verificar el rating.';

CREATE VIEW perfiles_publicos
WITH (security_invoker = false) AS
  SELECT
    user_id, nombre, zona, rubro, verificado, creado_at, foto_url, telefono,
    titular, anos_experiencia, reputacion_fuente, reputacion_rating, reputacion_total, reputacion_url
  FROM perfiles_profesionales;

GRANT SELECT ON perfiles_publicos TO anon, authenticated;
