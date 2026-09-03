-- Reportes generales (2026-09-03, misma tanda que 20260903c): además de
-- reportar un perfil puntual, el usuario pidió una sección propia en el
-- menú ("Reportar un problema") donde se pueda avisar de:
--   - un problema con un técnico (más allá de reportar su perfil)
--   - un problema con el sitio
--   - una sugerencia
--
-- Un problema con la web no tiene técnico asociado, así que tecnico_id pasa
-- a ser opcional y se agrega `tipo` para distinguir. Una sola tabla para
-- los dos casos, así el panel de admin los ve todos juntos.
--
-- Diferencia deliberada entre los dos flujos:
--   - Reporte de PERFIL: se puede sin cuenta (quien detecta un teléfono
--     falso capaz ni tiene usuario). Es una alerta rápida de seguridad.
--   - Reporte GENERAL: exige cuenta, porque es una conversación — hay que
--     poder responderle a alguien. Se valida en el server action.
ALTER TABLE reportes
  ALTER COLUMN tecnico_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'perfil';

COMMENT ON COLUMN reportes.tipo IS
  'perfil = reporte sobre un tecnico puntual; web = problema con el sitio; sugerencia = idea o mejora.';
COMMENT ON COLUMN reportes.tecnico_id IS
  'NULL cuando el reporte no es sobre un tecnico (tipo web/sugerencia).';
