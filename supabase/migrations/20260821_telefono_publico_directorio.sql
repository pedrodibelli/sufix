-- Pivot de producto (2026-08-21, PoC "directorio de técnicos"): la home pasa
-- a mostrar los perfiles de los técnicos a cualquier visitante (logueado o
-- no), con un botón de WhatsApp directo en cada tarjeta. Para eso el teléfono
-- deja de ser un dato protegido y pasa a ser público a propósito — el técnico
-- quiere que lo contacten, es el equivalente a una guía de oficios.
--
-- ⚠️ Esto reemplaza la política de privacidad de la Tarea 3 (2026-06-09):
-- antes `perfiles_publicos` excluía el teléfono adrede y solo se revelaba
-- tras una propuesta/pago. Se decidió conscientemente relajarlo para esta
-- prueba de concepto. Si en el futuro se vuelve al modelo viejo (publicar
-- problema → propuestas), hay que sacar `telefono` de este SELECT de nuevo.

CREATE OR REPLACE VIEW perfiles_publicos
WITH (security_invoker = false) AS
  SELECT user_id, nombre, zona, rubro, verificado, creado_at, foto_url, telefono
  FROM perfiles_profesionales;

GRANT SELECT ON perfiles_publicos TO anon, authenticated;
