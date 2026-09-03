-- Reputación de Google Maps (2026-09-03): para técnicos que ya confirmaron
-- que quieren que su reputación real de Google (rating + cantidad de
-- reseñas) también se vea en Sufix. NO se copian reseñas individuales de
-- gente real como si fueran de Sufix (eso sería fabricar testimonios que
-- nunca pasaron por acá) — se muestra el número agregado, claramente
-- identificado como "de Google Maps", con link a la ficha real para que
-- cualquiera lo pueda verificar con un clic. Ver charla del 2026-08-27
-- para el porqué de este enfoque en vez de copiar reseñas textuales.
--
-- Los 3 campos quedan NULL para todos los técnicos por defecto — el opt-in
-- ES tenerlos cargados: si Pedro no cargó el dato, es porque ese técnico
-- todavía no dio el ok, y no cambia nada para él.
ALTER TABLE perfiles_profesionales
  ADD COLUMN IF NOT EXISTS google_rating numeric(2,1),
  ADD COLUMN IF NOT EXISTS google_reviews_count integer,
  ADD COLUMN IF NOT EXISTS google_maps_url text;

COMMENT ON COLUMN perfiles_profesionales.google_rating IS
  'Rating de Google Maps (0.0-5.0), solo para técnicos que confirmaron que quieren mostrarlo. NULL = no aplica.';
COMMENT ON COLUMN perfiles_profesionales.google_reviews_count IS
  'Cantidad de reseñas de Google Maps al momento de cargar el dato.';
COMMENT ON COLUMN perfiles_profesionales.google_maps_url IS
  'Link a la ficha real de Google Maps del técnico, para que cualquiera pueda verificar el rating.';

-- perfiles_publicos es la vista que lee toda la app — hay que agregar los
-- 3 campos ahí también, si no quedan invisibles para el frontend.
DROP VIEW IF EXISTS perfiles_publicos;
CREATE VIEW perfiles_publicos
WITH (security_invoker = false) AS
  SELECT
    user_id, nombre, zona, rubro, verificado, creado_at, foto_url, telefono,
    titular, anos_experiencia, google_rating, google_reviews_count, google_maps_url
  FROM perfiles_profesionales;

GRANT SELECT ON perfiles_publicos TO anon, authenticated;
