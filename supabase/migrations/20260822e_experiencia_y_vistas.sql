-- 1) Años de experiencia (opcional) — mismo patrón que `titular`: columna
--    nueva en perfiles_profesionales, expuesta en la vista pública, editable
--    desde /perfil, mostrada en /tecnico/[id].
ALTER TABLE perfiles_profesionales ADD COLUMN IF NOT EXISTS anos_experiencia int;

CREATE OR REPLACE VIEW perfiles_publicos
WITH (security_invoker = false) AS
  SELECT user_id, nombre, zona, rubro, verificado, creado_at, foto_url, telefono, titular, anos_experiencia
  FROM perfiles_profesionales;

GRANT SELECT ON perfiles_publicos TO anon, authenticated;

-- 2) Vistas de perfil: cada carga de /tecnico/[id] deja un registro liviano
--    (mismo patrón que contactos_tecnico) — sirve para medir conversión
--    "vio el perfil" -> "contactó" más adelante.
CREATE TABLE IF NOT EXISTS vistas_perfil_tecnico (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tecnico_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visitante  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  creado_at  timestamptz DEFAULT now()
);

ALTER TABLE vistas_perfil_tecnico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vistas_insert_cualquiera"
ON vistas_perfil_tecnico FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "vistas_select_propio"
ON vistas_perfil_tecnico FOR SELECT
TO authenticated
USING (tecnico_id = auth.uid());

-- Vista legible para exportar a CSV/Sheets a mano (Table Editor), mismo
-- patrón que contactos_tecnico_legible. Sin GRANT a anon/authenticated a
-- propósito: solo se ve desde el Table/SQL Editor del dueño del proyecto.
CREATE OR REPLACE VIEW vistas_perfil_legible
WITH (security_invoker = true) AS
SELECT
  vp.creado_at AS fecha,
  pp.nombre AS tecnico,
  COALESCE(
    NULLIF(TRIM(COALESCE(au.raw_user_meta_data->>'nombre', '') || ' ' || COALESCE(au.raw_user_meta_data->>'apellido', '')), ''),
    au.email,
    'Anónimo (sin cuenta)'
  ) AS visitante
FROM vistas_perfil_tecnico vp
LEFT JOIN perfiles_profesionales pp ON pp.user_id = vp.tecnico_id
LEFT JOIN auth.users au ON au.id = vp.visitante
ORDER BY vp.creado_at DESC;
