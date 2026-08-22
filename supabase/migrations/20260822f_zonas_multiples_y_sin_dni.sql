-- Zona múltiple (mismo patrón que rubro, migración 20260806_rubros_multiples):
-- un técnico puede cubrir varias zonas — la mayoría recorre bastante más que
-- un solo barrio para tener trabajo suficiente. zona pasa de `text` a `text[]`.
--
-- También: el registro deja de pedir DNI a los técnicos (el trigger ya no lo
-- necesita para nada — era del modelo viejo de pago/verificación de
-- identidad). No se borra la tabla `verificaciones` ni el bloque que la
-- llena: si algún día vuelve a mandarse `dni` en el metadata, sigue
-- funcionando solo. Simplemente el formulario deja de pedirlo.

-- Dos vistas dependen de la columna `zona` y hay que sacarlas de encima
-- antes de poder cambiarle el tipo (Postgres no deja alterar una columna
-- mientras algo la usa). Las volvemos a crear después, más abajo.
DROP VIEW IF EXISTS perfiles_publicos;
DROP VIEW IF EXISTS contactos_tecnico_legible;

ALTER TABLE perfiles_profesionales
  ALTER COLUMN zona TYPE text[]
  USING (CASE WHEN zona IS NULL OR zona = '' THEN NULL ELSE ARRAY[zona] END);

COMMENT ON COLUMN perfiles_profesionales.zona IS
  'Array de zonas (ver lib/data.ts ZONES). Un técnico puede cubrir varias.';

CREATE OR REPLACE VIEW perfiles_publicos
WITH (security_invoker = false) AS
  SELECT user_id, nombre, zona, rubro, verificado, creado_at, foto_url, telefono, titular, anos_experiencia
  FROM perfiles_profesionales;

GRANT SELECT ON perfiles_publicos TO anon, authenticated;

-- Misma vista de antes, solo que `zona` ahora se junta en un texto separado
-- por comas (igual que ya se hacía con `rubro`) para que el CSV siga
-- mostrando algo legible en una sola celda, no un array pelado.
CREATE OR REPLACE VIEW contactos_tecnico_legible
WITH (security_invoker = true) AS
SELECT
  ct.creado_at AS fecha,
  pp.nombre AS tecnico,
  COALESCE(array_to_string(pp.rubro, ', '), '') AS rubro,
  COALESCE(array_to_string(pp.zona, ', '), '') AS zona,
  ct.origen,
  COALESCE(
    NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'nombre', '') || ' ' || COALESCE(au.raw_user_meta_data->>'apellido', '')), ''),
    au.email,
    'Anónimo (sin cuenta)'
  ) AS contactado_por
FROM contactos_tecnico ct
LEFT JOIN perfiles_profesionales pp ON pp.user_id = ct.tecnico_id
LEFT JOIN auth.users au ON au.id = ct.contactado_por
ORDER BY ct.creado_at DESC;

-- El trigger de registro ahora lee `zonas` (array en el metadata) en vez de
-- `zona` (texto suelto) — igual patrón que ya se usó para categorias/rubro.
CREATE OR REPLACE FUNCTION crear_perfil_al_registrarse()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (NEW.raw_user_meta_data->>'es_profesional')::boolean = true THEN
    INSERT INTO perfiles_profesionales (user_id, nombre, telefono, email, rubro, zona)
    VALUES (
      NEW.id,
      TRIM(COALESCE(NEW.raw_user_meta_data->>'nombre','') || ' ' || COALESCE(NEW.raw_user_meta_data->>'apellido','')),
      NEW.raw_user_meta_data->>'telefono',
      NEW.email,
      (
        SELECT array_agg(x)
        FROM jsonb_array_elements_text(COALESCE(NEW.raw_user_meta_data->'categorias', '[]'::jsonb)) x
      ),
      (
        SELECT array_agg(x)
        FROM jsonb_array_elements_text(COALESCE(NEW.raw_user_meta_data->'zonas', '[]'::jsonb)) x
      )
    )
    ON CONFLICT (user_id) DO NOTHING;

    IF (NEW.raw_user_meta_data->>'dni') IS NOT NULL AND (NEW.raw_user_meta_data->>'dni') != '' THEN
      INSERT INTO verificaciones (user_id, dni)
      VALUES (NEW.id, NEW.raw_user_meta_data->>'dni')
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
