-- Nombres reales en las tarjetas (2026-11-05, ver CLAUDE.md §26).
--
-- Los técnicos cargados desde Google Maps tenían como nombre el título de su
-- ficha, que muchas veces es una lista de palabras clave ("Gasista
-- Matriculado Plomero Instalacion Cocina Termotanque Estufa Calefon
-- Vanitory"). `nombre` pasa a ser lo que se muestra: el nombre de la persona
-- si se conoce, si no la marca limpia.
--
-- nombre_maps: el título original de la ficha, para no perderlo (sirve para
--   el próximo relevamiento de puntajes y para deshacer un cambio).
-- nombre_tipo: qué es `nombre`.
--   'persona'   nombre de una persona ("Raúl Castro", "Facundo").
--   'marca'     nombre de un negocio ("Fénix Soluciones", "Cerrajería Charcas").
--   'pendiente' ni una cosa ni la otra ("Electricista matriculado"): falta
--               conseguir el nombre, a mano.
--   NULL        sin clasificar (altas nuevas). Quien se registró solo por la
--               web puso su nombre, así que el código lo trata como persona
--               si cargado_por_equipo es false.
-- Sirve para no saludar nunca a una marca por su primera palabra ("El Líder"
-- saludaba "Hola El!") y para el "Hablamos con ..." de /tecnico/[id].

ALTER TABLE perfiles_profesionales ADD COLUMN IF NOT EXISTS nombre_maps text;
ALTER TABLE perfiles_profesionales ADD COLUMN IF NOT EXISTS nombre_tipo text
  CHECK (nombre_tipo IN ('persona', 'marca', 'pendiente'));

-- Mismas columnas y en el mismo orden que 20261022b_ocultar_tecnicos.sql
-- (CREATE OR REPLACE VIEW no deja sacar ni reordenar columnas); lo único
-- nuevo es nombre_tipo, al final. nombre_maps no hace falta en la web.
-- Sigue siendo SECURITY DEFINER a propósito (ver CLAUDE.md §25).
CREATE OR REPLACE VIEW perfiles_publicos
WITH (security_invoker = false) AS
  SELECT user_id, nombre, zona, rubro, verificado, creado_at, foto_url, telefono, titular, anos_experiencia,
         reputacion_fuente, reputacion_rating, reputacion_total, reputacion_url, cargado_por_equipo,
         nombre_tipo
  FROM perfiles_profesionales
  WHERE oculto_motivo IS NULL;

GRANT SELECT ON perfiles_publicos TO anon, authenticated;
