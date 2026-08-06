-- Permite que un técnico elija VARIOS rubros (antes solo uno). Muchos hacen
-- más de un tipo de trabajo (plomero + gasista, por ejemplo) y con un solo
-- rubro se perdían trabajos que también podrían haber tomado.
--
-- perfiles_profesionales.rubro pasa de `text` a `text[]`. Los valores
-- existentes (un solo rubro) se migran a un array de un elemento, sin perder
-- datos. El registro ahora manda `categorias` (array) en el metadata del
-- usuario en vez de `categoria` (texto suelto) — ver app/registrar/page.tsx.

-- La vista perfiles_publicos depende de esta columna (rule _RETURN) — Postgres
-- no deja cambiarle el tipo mientras la vista exista. Se borra y se recrea
-- igual que estaba (ver supabase/migrations/20260621_perfiles_publicos.sql).
DROP VIEW IF EXISTS perfiles_publicos;

ALTER TABLE perfiles_profesionales
  ALTER COLUMN rubro TYPE text[]
  USING (CASE WHEN rubro IS NULL OR rubro = '' THEN NULL ELSE ARRAY[rubro] END);

COMMENT ON COLUMN perfiles_profesionales.rubro IS
  'Array de slugs de categoría (ver lib/data.ts CATEGORIES). Un técnico puede tener varios.';

CREATE OR REPLACE VIEW perfiles_publicos
WITH (security_invoker = false) AS
  SELECT user_id, nombre, zona, rubro, verificado, creado_at
  FROM perfiles_profesionales;

GRANT SELECT ON perfiles_publicos TO anon, authenticated;

-- Trigger que crea el perfil al registrarse: ahora lee `categorias` (array en
-- el metadata) en vez de `categoria` (texto suelto). Si por algún motivo no
-- viene nada, queda NULL (igual que antes).
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
      NEW.raw_user_meta_data->>'zona'
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
