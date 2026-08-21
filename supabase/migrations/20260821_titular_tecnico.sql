-- Mejora de UX del directorio de técnicos (inspirada en solvitapp.com.ar):
-- una frase corta y libre que el técnico escribe sobre sí mismo, para mostrar
-- en su tarjeta además de los chips de rubro (ej. "Electricista matriculado,
-- gasista matriculado"). Opcional — si no la completa, seguimos mostrando
-- los nombres de rubro como hasta ahora.

ALTER TABLE perfiles_profesionales
  ADD COLUMN IF NOT EXISTS titular text;

COMMENT ON COLUMN perfiles_profesionales.titular IS
  'Frase corta libre para la tarjeta del directorio (ej. "Electricista matriculado"). Opcional.';

CREATE OR REPLACE VIEW perfiles_publicos
WITH (security_invoker = false) AS
  SELECT user_id, nombre, zona, rubro, verificado, creado_at, foto_url, telefono, titular
  FROM perfiles_profesionales;

GRANT SELECT ON perfiles_publicos TO anon, authenticated;
